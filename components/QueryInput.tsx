
import React from 'react';
import { Loader } from './Loader';
import { WandIcon } from './icons';

interface QueryInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  isFileUploaded: boolean;
}

const QueryInput: React.FC<QueryInputProps> = ({
  query,
  onQueryChange,
  onSubmit,
  isLoading,
  isFileUploaded
}) => {
  const isDisabled = isLoading || !isFileUploaded || !query.trim();

  return (
    <div className="mt-4 space-y-4">
      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="e.g., Identify rebranding opportunities for underperforming respiratory molecules..."
        className="w-full h-28 p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        disabled={isLoading}
      />
      <button
        onClick={onSubmit}
        disabled={isDisabled}
        className="w-full flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <>
            <Loader />
            <span className="ml-2">Analyzing...</span>
          </>
        ) : (
          <>
            <WandIcon className="h-5 w-5 mr-2" />
            Generate Intelligence Report
          </>
        )}
      </button>
    </div>
  );
};

export default QueryInput;
