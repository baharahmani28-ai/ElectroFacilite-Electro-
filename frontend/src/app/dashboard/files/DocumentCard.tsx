'use client';

import { useEffect, useState } from 'react';
import { FileText, Download } from 'lucide-react';

interface DocumentCardProps {
  doc: any;
  getDocumentTypeLabel: (type: string) => string;
}

export default function DocumentCard({ doc, getDocumentTypeLabel }: DocumentCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageLoading, setImageLoading] = useState(true);
  const [showPdfModal, setShowPdfModal] = useState(false);

  useEffect(() => {
    // Load secure preview for images and PDFs
    if (doc.mime_type && (doc.mime_type.startsWith('image/') || doc.mime_type === 'application/pdf')) {
      loadSecureImage();
    } else {
      setImageLoading(false);
    }

    return () => {
      if (imageUrl) {
        window.URL.revokeObjectURL(imageUrl);
      }
    };
  }, [doc.file_path]);

  const loadSecureImage = async () => {
    try {
      // Extract filename from path (works with both forward and back slashes)
      const filename = doc.file_path.split(/[/\\]/).pop();
      const token = document.cookie.split('; ').find((row: string) => row.startsWith('token='))?.split('=')[1];
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      // ? CORRECT: Fetch file from secure endpoint
      // Files are served from disk, never stored as text in database
      const response = await fetch(`http://localhost:5000/api/secure/documents/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setImageUrl(url);
      setImageLoading(false);
    } catch (err) {
      console.error('Failed to load document:', err);
      setImageLoading(false);
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    const filename = doc.file_path.split(/[/\\]/).pop();
    const token = document.cookie.split('; ').find((row: string) => row.startsWith('token='))?.split('=')[1];
    
    if (!token) {
      alert('Erreur d\'authentification');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/secure/documents/${filename}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to download document');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Erreur lors du téléchargement');
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">
            {getDocumentTypeLabel(doc.document_type)}
          </h3>
          <p className="text-sm text-gray-600">{doc.file_name}</p>
          <p className="text-xs text-gray-500">
            {(doc.file_size / 1024).toFixed(2)} KB
          </p>
        </div>
        <button
          onClick={handleDownload}
          className="bg-blue-100 text-blue-600 p-2 rounded-lg hover:bg-blue-200"
          title="Télécharger"
        >
          <Download size={20} />
        </button>
      </div>
      
      {/* Image Preview */}
      {doc.mime_type && doc.mime_type.startsWith('image/') && (
        <div className="mt-3">
          {imageLoading ? (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={doc.file_name}
              className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(imageUrl, '_blank')}
              title="Cliquez pour agrandir&quot;
            />
          ) : (
            <div className="w-full h-48 bg-red-50 rounded-lg flex items-center justify-center">
              <p className="text-red-600 text-sm">Échec du chargement de l'image</p>
            </div>
          )}
        </div>
      )}
      
      {/* PDF Preview - Enhanced with iframe modal */}
      {doc.mime_type === 'application/pdf' && (
        <>
          <div 
            className="mt-3 flex flex-col items-center justify-center bg-gray-100 h-48 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={() => setShowPdfModal(true)}
          >
            <FileText size={48} className="text-red-500 mb-2" />
            <span className="text-gray-700 font-medium">PDF Document</span>
            <span className="text-xs text-gray-500 mt-1">Cliquez pour prévisualiser</span>
          </div>

          {/* PDF Modal with iframe */}
          {showPdfModal && imageUrl && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
              onClick={() => setShowPdfModal(false)}
            >
              <div 
                className="bg-white rounded-lg w-full h-full max-w-6xl max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="font-semibold text-lg">{doc.file_name}</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDownload}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center space-x-2"
                    >
                      <Download size={18} />
                      <span>Télécharger</span>
                    </button>
                    <button
                      onClick={() => setShowPdfModal(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl px-3&quot;
                    >
                      ×
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  {/* ? CORRECT: PDF rendered in iframe from blob URL */}
                  <iframe
                    src={imageUrl}
                    className="w-full h-full border-0"
                    title={doc.file_name}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

