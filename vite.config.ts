import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin, type PreviewServer, type ViteDevServer } from 'vite';
import react from '@vitejs/plugin-react';
import { GoogleGenAI } from '@google/genai';

function localReports(apiKey: string | undefined): Plugin {
  const ai = apiKey ? new GoogleGenAI({ apiKey }) : undefined;

  async function report(req: IncomingMessage, res: ServerResponse) {
    function respond(status: number, body: object) {
      res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(JSON.stringify(body));
    }

    const host = req.headers.host ?? '';
    const origin = req.headers.origin;
    const localHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i.test(host);
    const localClient = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '');
    if (!localHost || !localClient || (origin && origin !== 'http://' + host)) {
      return respond(403, { error: 'Report generation is available only from the local app.' });
    }
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return respond(405, { error: 'Expected POST.' });
    }
    if (req.headers['content-type']?.split(';')[0].trim() !== 'application/json') {
      return respond(415, { error: 'Expected a JSON request.' });
    }
    if (!ai) return respond(503, { error: 'Set GEMINI_API_KEY in .env.local and restart the app.' });

    const chunks: Buffer[] = [];
    let bytes = 0;
    let prompt: unknown;
    try {
      for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        bytes += buffer.length;
        if (bytes > 128 * 1024) {
          req.resume();
          return respond(413, { error: 'The report request is too large.' });
        }
        chunks.push(buffer);
      }
      prompt = JSON.parse(Buffer.concat(chunks).toString('utf8'))?.prompt;
    } catch {
      return respond(400, { error: 'Invalid JSON request.' });
    }
    if (typeof prompt !== 'string' || !prompt.trim()) return respond(400, { error: 'A prompt is required.' });

    try {
      const result = await ai.models.generateContent({ model: 'gemini-2.5-pro', contents: prompt });
      if (!result.text) return respond(502, { error: 'Gemini did not return a report.' });
      return respond(200, { report: result.text });
    } catch {
      return respond(502, { error: 'Gemini request failed. Check the API configuration and quota.' });
    }
  }

  function configure(server: ViteDevServer | PreviewServer) {
    server.middlewares.use('/api/report', (req, res) => {
      void report(req, res).catch(() => {
        if (!res.headersSent) res.writeHead(500);
        res.end();
      });
    });
  }
  return { name: 'local-reports', configureServer: configure, configurePreviewServer: configure };
}

export default defineConfig(({ mode }) => {
  const { GEMINI_API_KEY } = loadEnv(mode, '.', 'GEMINI_');
  return {
    server: { port: 3000, host: '127.0.0.1' },
    preview: { host: '127.0.0.1' },
    plugins: [react(), localReports(GEMINI_API_KEY)],
    resolve: { alias: { '@': path.resolve(__dirname, '.') } }
  };
});
