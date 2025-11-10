
import React, { useState, useCallback, useRef } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import QueryInput from './components/QueryInput';
import ReportDisplay from './components/ReportDisplay';
import { parseExcelStructure } from './utils/excelParser';
import { generateReport } from './services/geminiService';
import { AppState } from './types';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [userQuery, setUserQuery] = useState<string>('');
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const reportDisplayRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (file: File | null) => {
    setUploadedFile(file);
    setReport(null);
    setError(null);
    setAppState(AppState.IDLE);
  };

  const handleQueryChange = (query: string) => {
    setUserQuery(query);
  };

  const handleGenerateReport = useCallback(async () => {
    if (!uploadedFile || !userQuery) {
      setError('Please upload a file and enter a query.');
      return;
    }

    setAppState(AppState.LOADING);
    setReport(null);
    setError(null);

    try {
      const fileStructure = await parseExcelStructure(uploadedFile);
      const generatedReport = await generateReport(userQuery, fileStructure);
      setReport(generatedReport);
      setAppState(AppState.SUCCESS);
      
      setTimeout(() => {
        reportDisplayRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate report: ${errorMessage}`);
      setAppState(AppState.ERROR);
    }
  }, [uploadedFile, userQuery]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-10 space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-700">1. Upload IMS Data File</h2>
                <p className="text-gray-500 mt-1">Upload your multi-sheet IMS (IQVIA) dataset (.xlsx, .xls).</p>
                <FileUpload onFileChange={handleFileChange} />
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-700">2. Define Your Strategic Query</h2>
                <p className="text-gray-500 mt-1">
                    Ask a question about the data, e.g., "Analyze the anti-infective therapy market in India."
                </p>
                <QueryInput
                    query={userQuery}
                    onQueryChange={handleQueryChange}
                    onSubmit={handleGenerateReport}
                    isLoading={appState === AppState.LOADING}
                    isFileUploaded={!!uploadedFile}
                />
            </div>
          </div>
        </div>

        <div ref={reportDisplayRef} className="mt-8 md:mt-12 max-w-4xl mx-auto">
          <ReportDisplay
            appState={appState}
            report={report}
            error={error}
          />
        </div>
      </main>
      <footer className="text-center p-4 text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Pharma Intelligence & Strategy Agent. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;
