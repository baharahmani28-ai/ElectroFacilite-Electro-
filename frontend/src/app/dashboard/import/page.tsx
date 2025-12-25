'use client';

import { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { importAPI } from '@/lib/api';

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleDownloadTemplate = async () => {
    try {
      const response = await importAPI.downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'products_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to download template:', error);
      alert('Failed to download template');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file first');
      return;
    }

    setUploading(true);
    try {
      const response = await importAPI.bulkImport(file);
      setResult(response.data);
      setFile(null);
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bulk Product Import</h1>

      {/* Instructions Card */}
      <div className="card mb-6 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-gray-800 mb-2">How to Import Products</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
              <li>Download the Excel template below</li>
              <li>Fill in your product details (name, category, price, etc.)</li>
              <li>Make sure to use the correct branch codes: BR-001 to BR-006</li>
              <li>Upload the completed Excel file</li>
              <li>Review the import results</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Download Template */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <FileSpreadsheet className="text-green-600" size={32} />
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Excel Template</h3>
              <p className="text-sm text-gray-600">Download the template with sample products</p>
            </div>
          </div>
          <button
            onClick={handleDownloadTemplate}
            className="btn-primary flex items-center space-x-2"
          >
            <Download size={20} />
            <span>Download Template</span>
          </button>
        </div>
      </div>

      {/* Branch Codes Reference */}
      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-3">Branch Codes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center space-x-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">BR-001</span>
            <span className="text-gray-700">Batna</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">BR-002</span>
            <span className="text-gray-700">Constantine</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">BR-003</span>
            <span className="text-gray-700">Sétif</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">BR-004</span>
            <span className="text-gray-700">Bou Saada</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">BR-005</span>
            <span className="text-gray-700">Breika</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded">BR-006</span>
            <span className="text-gray-700">M'Sila</span>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <div className="card mb-6">
        <h3 className="font-bold text-gray-800 mb-4">Upload Excel File</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <input
            id="file-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="file-input" className="btn-primary cursor-pointer inline-block mb-2">
            Select Excel File
          </label>
          {file && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-3">Selected: {file.name}</p>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="btn-primary"
              >
                {uploading ? 'Uploading...' : 'Upload & Import'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="card">
          <h3 className="font-bold text-gray-800 mb-4">Import Results</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
              <span className="text-green-800">
                <strong>{result.successCount}</strong> products imported successfully
              </span>
            </div>
            {result.errorCount > 0 && (
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                <XCircle className="text-red-600" size={24} />
                <span className="text-red-800">
                  <strong>{result.errorCount}</strong> products failed to import
                </span>
              </div>
            )}
            {result.errors && result.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold text-gray-700 mb-2">Errors:</h4>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-60 overflow-y-auto">
                  {result.errors.map((error: any, index: number) => (
                    <div key={index} className="text-sm text-red-700 mb-1">
                      Row {error.row}: {error.error}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

