import { GEMINI_PROMPT_PREAMBLE } from '../constants';

export async function generateReport(userQuery: string, fileStructure: string): Promise<string> {
  const prompt = `${GEMINI_PROMPT_PREAMBLE}

CONTEXT
The following is a summary of workbook sheets and headers, without worksheet rows:
${fileStructure}

USER REQUEST
${userQuery}

INSTRUCTIONS
Follow the OUTPUT STRUCTURE TEMPLATE. Return one Markdown report.`;

  const response = await fetch('/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || typeof result?.report !== 'string') {
    throw new Error(result?.error || 'Report generation requires the local app server.');
  }
  return result.report;
}
