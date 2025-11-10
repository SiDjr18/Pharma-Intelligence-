
import React, { useEffect, useState, useRef } from 'react';
import { AppState } from '../types';
import { Loader } from './Loader';
import { DownloadIcon, FileTextIcon, AlertTriangleIcon } from './icons';

// Make sure marked and saveAs are available globally from index.html
declare const marked: any;
declare const saveAs: any;

interface ReportDisplayProps {
  appState: AppState;
  report: string | null;
  error: string | null;
}

const ReportDisplay: React.FC<ReportDisplayProps> = ({ appState, report, error }) => {
  const [reportHtml, setReportHtml] = useState('');
  const reportContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (report && typeof marked !== 'undefined') {
      const html = marked.parse(report, { gfm: true, breaks: true });
      setReportHtml(html);
    } else {
      setReportHtml('');
    }
  }, [report]);

  const handleDownload = () => {
    if (!reportContentRef.current) return;
    
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Pharma Intelligence Report</title></head><body>`;
    const footer = "</body></html>";
    const sourceHTML = header + reportContentRef.current.innerHTML + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    
    try {
        if(typeof saveAs !== 'undefined') {
            const blob = new Blob([sourceHTML], {
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            });
            saveAs(blob, 'Pharma_Intelligence_Report.docx');
        } else {
            console.error('FileSaver.js (saveAs) is not loaded.');
            alert('Could not initiate download. FileSaver library not found.');
        }
    } catch(e) {
        console.error("Error downloading file:", e);
        alert('An error occurred during download.');
    }
  };
  
  const renderContent = () => {
    switch (appState) {
      case AppState.LOADING:
        return (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500">
            <Loader />
            <p className="mt-4 text-lg font-medium">Generating your report...</p>
            <p className="text-sm">This may take a moment.</p>
          </div>
        );
      case AppState.ERROR:
        return (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <AlertTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-red-800">Error Generating Report</h3>
            </div>
            <p className="mt-2 text-red-700">{error}</p>
          </div>
        );
      case AppState.SUCCESS:
        if (report) {
          return (
            <>
              <div className="flex justify-between items-center mb-4 pb-4 border-b">
                 <h2 className="text-2xl font-bold text-gray-800">Generated Report</h2>
                 <button 
                    onClick={handleDownload}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm"
                  >
                   <DownloadIcon className="h-5 w-5 mr-2" />
                   Download as Word
                 </button>
              </div>
              <div
                ref={reportContentRef}
                className="prose prose-blue max-w-none prose-headings:font-semibold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-600"
                dangerouslySetInnerHTML={{ __html: reportHtml }}
              />
            </>
          );
        }
        return null;
      case AppState.IDLE:
      default:
        return (
          <div className="text-center p-12 bg-gray-100 rounded-lg border-2 border-dashed">
            <FileTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">Your report will appear here</h3>
            <p className="mt-1 text-sm text-gray-500">Upload a file and submit a query to begin.</p>
          </div>
        );
    }
  };

  return <div className="bg-white p-6 md:p-8 rounded-xl shadow-lg min-h-[200px]">{renderContent()}</div>;
};

export default ReportDisplay;
