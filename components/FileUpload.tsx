
import React, { useState, useRef } from 'react';
import { UploadCloudIcon, FileIcon, XIcon } from './icons';

interface FileUploadProps {
  onFileChange: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileChange }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File | undefined) => {
    if (selectedFile && (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.type === 'application/vnd.ms-excel')) {
      setFile(selectedFile);
      onFileChange(selectedFile);
    } else {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    onFileChange(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-4">
      {!file ? (
         <label
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-blue-500 focus:outline-none ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
        >
          <span className="flex items-center space-x-2">
            <UploadCloudIcon className="w-6 h-6 text-gray-600" />
            <span className="font-medium text-gray-600">
              Drop files to Attach, or&nbsp;
              <span className="text-blue-600 underline">browse</span>
            </span>
          </span>
          <input
            ref={fileInputRef}
            type="file"
            name="file_upload"
            className="hidden"
            accept=".xlsx, .xls"
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
          />
        </label>
      ) : (
        <div className="p-4 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileIcon className="h-6 w-6 text-green-600" />
            <span className="text-sm font-medium text-gray-700">{file.name}</span>
          </div>
          <button
            onClick={removeFile}
            className="text-gray-500 hover:text-red-600 transition-colors"
            aria-label="Remove file"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
