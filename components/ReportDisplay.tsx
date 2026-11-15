import React, { useMemo, useRef } from 'react';
import DOMPurify from 'dompurify';
import { AppState } from '../types';
import { Loader } from './Loader';
import { DownloadIcon, FileTextIcon, AlertTriangleIcon } from './icons';

declare const marked: { parse: (input: string, options: { gfm: boolean; breaks: boolean }) => string };
declare const saveAs: (file: Blob, filename: string) => void;

interface ReportDisplayProps {
  appState: AppState;
  report: string | null;
  error: string | null;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ appState, report, error }) => {
  const reportContentRef = useRef<HTMLDivElement>(null);
  const reportHtml = useMemo(() => {
    if (!report || typeof marked === 'undefined') return '';
    return DOMPurify.sanitize(marked.parse(report, { gfm: true, breaks: true }), {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr', 'ul', 'ol', 'li', 'strong', 'em', 'del', 'pre', 'code', 'blockquote', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
      ALLOWED_ATTR: [],
      ALLOW_DATA_ATTR: false,
      ALLOW_ARIA_ATTR: false,
    });
  }, [report]);

  function handleDownload() {
    if (!reportContentRef.current) return;
    if (typeof saveAs === 'undefined') {
      alert('Could not initiate download. FileSaver library not found.');
      return;
    }
    const header = "<html><head><meta charset='utf-8'><title>Pharma Intelligence Report</title></head><body>";
    const html = header + reportContentRef.current.innerHTML + '</body></html>';
    try {
      saveAs(new Blob([html], { type: 'application/vnd.ms-word' }), 'Pharma_Intelligence_Report.doc');
    } catch {
      alert('An error occurred during download.');
    }
  }

  function renderContent() {
    switch (appState) {
      case AppState.LOADING:
        return (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader />
            <p className="mt-4 text-lg font-medium">Generating your report...</p>
            <p className="mt-1 text-sm">This may take a moment.</p>
          </div>
        );
      case AppState.ERROR:
        return (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center mb-2">
              <AlertTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-red-800">Error Generating Report</h3>
            </div>
            <p className="text-red-700">{error}</p>
          </div>
        );
      case AppState.SUCCESS:
        if (!report) return null;
        return (
          <>
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <h2 className="text-2xl font-bold text-gray-800">Generated Report</h2>
              <button onClick={handleDownload} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm">
                <DownloadIcon className="h-5 w-5 mr-2" />
                Download as Word
              </button>
            </div>
            <div ref={reportContentRef} className="prose prose-blue max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg" dangerouslySetInnerHTML={{ __html: reportHtml }} />
          </>
        );
      default:
        return (
          <div className="text-center p-12 bg-gray-100 rounded-lg border-2 border-dashed">
            <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Your report will appear here</h3>
            <p className="mt-1 text-sm text-gray-500">Upload a file and submit a query to begin.</p>
          </div>
        );
    }
  }

  return <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-[200px]">{renderContent()}</div>;
};

export default ReportDisplay;
