import React, { useState, useRef } from 'react';
import { useFetcher } from '@remix-run/react';

interface CSVUploadProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

interface UploadProgress {
  status: 'idle' | 'uploading' | 'success' | 'error';
  message?: string;
  results?: {
    total: number;
    success: number;
    failed: number;
    errors: string[];
  };
}

export default function CSVUpload({ onSuccess, onError }: CSVUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({ status: 'idle' });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('en');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadProgress({ status: 'idle' });
    } else {
      setSelectedFile(null);
      setUploadProgress({ 
        status: 'error', 
        message: 'Please select a valid CSV file' 
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadProgress({ 
        status: 'error', 
        message: 'Please select a file first' 
      });
      return;
    }

    setUploadProgress({ status: 'uploading', message: 'Uploading questions...' });

    const formData = new FormData();
    formData.append('csvFile', selectedFile);
    formData.append('language', language);

    try {
      fetcher.submit(formData, {
        method: 'POST',
        action: '/api/questions/bulk-upload',
        encType: 'multipart/form-data'
      });
    } catch (error) {
      setUploadProgress({ 
        status: 'error', 
        message: 'Upload failed. Please try again.' 
      });
      onError?.('Upload failed. Please try again.');
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = `questionType,category,difficulty,tags,questionText,explanation,optionA,optionB,optionC,optionD,correctOptionKey
mcq,mathematics,medium,"algebra;equations","What is x in 2x + 5 = 13?","Subtract 5 from both sides: 2x = 8, then divide by 2: x = 4","4","5","6","7","A"
mcq,science,easy,"physics;motion","What is the SI unit of velocity?","Velocity is measured in meters per second","m/s","m/s²","kg","N","A"
mcq,history,hard,"ancient;civilization","Who was the first emperor of Rome?","Augustus was the first Roman emperor","Julius Caesar","Augustus","Nero","Marcus Aurelius","B"`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const resetUpload = () => {
    setSelectedFile(null);
    setUploadProgress({ status: 'idle' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle fetcher state changes
  React.useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.error) {
        setUploadProgress({ 
          status: 'error', 
          message: fetcher.data.error 
        });
        onError?.(fetcher.data.error);
      } else {
        setUploadProgress({ 
          status: 'success', 
          message: fetcher.data.message,
          results: fetcher.data.results
        });
        onSuccess?.(fetcher.data.message);
      }
    }
  }, [fetcher.state, fetcher.data, onSuccess, onError]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Bulk Upload Questions
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Upload multiple questions at once using a CSV file. Download the template below to see the required format.
        </p>
      </div>

      {/* Template Download */}
      <div className="mb-6">
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download CSV Template
        </button>
      </div>

      {/* Language Selection */}
      <div className="mb-6">
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Question Language
        </label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label htmlFor="csvFile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select CSV File
        </label>
        <input
          ref={fileInputRef}
          type="file"
          id="csvFile"
          accept=".csv"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
        />
        {selectedFile && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {/* Upload Button */}
      <div className="mb-6">
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploadProgress.status === 'uploading'}
          className="w-full inline-flex justify-center items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadProgress.status === 'uploading' ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Upload Questions
            </>
          )}
        </button>
      </div>

      {/* Progress and Results */}
      {uploadProgress.status !== 'idle' && (
        <div className="mb-6">
          {uploadProgress.status === 'uploading' && (
            <div className="flex items-center text-blue-600 dark:text-blue-400">
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {uploadProgress.message}
            </div>
          )}

          {uploadProgress.status === 'success' && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center text-green-800 dark:text-green-200">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{uploadProgress.message}</span>
              </div>
              
              {uploadProgress.results && (
                <div className="mt-3 text-sm text-green-700 dark:text-green-300">
                  <p>Total: {uploadProgress.results.total}</p>
                  <p>Success: {uploadProgress.results.success}</p>
                  <p>Failed: {uploadProgress.results.failed}</p>
                  
                  {uploadProgress.results.errors.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc list-inside mt-1">
                        {uploadProgress.results.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-xs">{error}</li>
                        ))}
                        {uploadProgress.results.errors.length > 5 && (
                          <li className="text-xs">... and {uploadProgress.results.errors.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {uploadProgress.status === 'error' && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center text-red-800 dark:text-red-200">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{uploadProgress.message}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Button */}
      {uploadProgress.status === 'success' && (
        <button
          onClick={resetUpload}
          className="w-full inline-flex justify-center items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        >
          Upload Another File
        </button>
      )}
    </div>
  );
}
