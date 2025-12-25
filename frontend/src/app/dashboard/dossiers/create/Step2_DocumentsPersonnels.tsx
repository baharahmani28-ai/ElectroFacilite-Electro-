'use client';

import React, { useState } from 'react';
import { Upload, File, X, Check, AlertCircle } from 'lucide-react';

interface FileUpload {
  id: string;
  file: File;
  preview: string;
  type: string;
}

interface Step2Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export default function Step2_DocumentsPersonnels({ onNext, onBack, initialData }: Step2Props) {
  // State for each document type
  const [carteIdentite, setCarteIdentite] = useState<FileUpload[]>([]);
  const [extraitNaissance, setExtraitNaissance] = useState<FileUpload | null>(null);
  const [certificatResidence, setCertificatResidence] = useState<FileUpload | null>(null);
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploading, setUploading] = useState(false);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Type de fichier non accepté. Utilisez PDF, JPG ou PNG.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'La taille du fichier dépasse 5MB.';
    }
    return null;
  };

  // Handle file upload
  const handleFileUpload = (
    files: FileList | null,
    fieldName: string,
    maxFiles: number = 1
  ) => {
    if (!files || files.length === 0) return;

    const newErrors = { ...errors };
    delete newErrors[fieldName];

    const fileArray = Array.from(files);
    const validFiles: FileUpload[] = [];

    for (let i = 0; i < Math.min(fileArray.length, maxFiles); i++) {
      const file = fileArray[i];
      const error = validateFile(file);

      if (error) {
        newErrors[fieldName] = error;
        setErrors(newErrors);
        return;
      }

      const fileUpload: FileUpload = {
        id: `${Date.now()}-${i}`,
        file: file,
        preview: file.type.startsWith('image/') 
          ? URL.createObjectURL(file)
          : '',
        type: file.type
      };

      validFiles.push(fileUpload);
    }

    // Update state based on field
    if (fieldName === 'carteIdentite') {
      setCarteIdentite(prev => [...prev, ...validFiles].slice(0, 2));
    } else if (fieldName === 'extraitNaissance') {
      setExtraitNaissance(validFiles[0]);
    } else if (fieldName === 'certificatResidence') {
      setCertificatResidence(validFiles[0]);
    }

    setErrors(newErrors);
  };

  // Remove file
  const removeFile = (fieldName: string, fileId?: string) => {
    if (fieldName === 'carteIdentite' && fileId) {
      setCarteIdentite(prev => prev.filter(f => f.id !== fileId));
    } else if (fieldName === 'extraitNaissance') {
      setExtraitNaissance(null);
    } else if (fieldName === 'certificatResidence') {
      setCertificatResidence(null);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (carteIdentite.length !== 2) {
      newErrors.carteIdentite = '2 copies de la carte d\'identité sont requises';
    }
    if (!extraitNaissance) {
      newErrors.extraitNaissance = 'L\'extrait de naissance est requis';
    }
    if (!certificatResidence) {
      newErrors.certificatResidence = 'Le certificat de résidence est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setUploading(true);

    try {
      // Prepare form data for upload
      const formData = new FormData();
      
      // Add carte identite files
      carteIdentite.forEach((upload, index) => {
        formData.append(`carteIdentite${index + 1}`, upload.file);
      });

      // Add other files
      if (extraitNaissance) {
        formData.append('extraitNaissance', extraitNaissance.file);
      }
      if (certificatResidence) {
        formData.append('certificatResidence', certificatResidence.file);
      }

      // In production, upload to server here
      // const response = await uploadAPI.uploadDocuments(formData);

      // For now, pass file information to parent
      onNext({
        carteIdentite: carteIdentite.map(f => f.file.name),
        extraitNaissance: extraitNaissance?.file.name,
        certificatResidence: certificatResidence?.file.name,
        formData: formData
      });
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: 'Erreur lors du téléchargement des fichiers' });
    } finally {
      setUploading(false);
    }
  };

  // Render file preview
  const renderFilePreview = (upload: FileUpload, fieldName: string, canRemove: boolean = true) => (
    <div key={upload.id} className="relative border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
      {/* Preview */}
      <div className="flex items-center gap-3">
        {upload.type.startsWith('image/') ? (
          <img 
            src={upload.preview} 
            alt="Preview" 
            className="w-16 h-16 object-cover rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center">
            <File className="w-8 h-8 text-red-600" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {upload.file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(upload.file.size / 1024).toFixed(2)} KB
          </p>
        </div>

        {canRemove && (
          <button
            type="button"
            onClick={() => removeFile(fieldName, upload.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Success indicator */}
      <div className="absolute top-2 right-2">
        <div className="bg-green-500 rounded-full p-1">
          <Check size={12} className="text-white" />
        </div>
      </div>
    </div>
  );

  // Render upload zone
  const renderUploadZone = (
    fieldName: string,
    label: string,
    required: boolean = false,
    maxFiles: number = 1,
    currentCount: number = 0
  ) => {
    const hasError = errors[fieldName];
    const isComplete = currentCount >= maxFiles;

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
          {maxFiles > 1 && (
            <span className="text-gray-500 text-xs ml-2">
              ({currentCount}/{maxFiles} fichiers)
            </span>
          )}
        </label>

        {!isComplete && (
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            hasError ? 'border-red-300 bg-red-50' : 'border-gray-300 hover:border-teal-500 bg-gray-50'
          }`}>
            <input
              type="file"
              id={fieldName}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={maxFiles > 1}
              onChange={(e) => handleFileUpload(e.target.files, fieldName, maxFiles - currentCount)}
              className="hidden"
            />
            <label
              htmlFor={fieldName}
              className="cursor-pointer flex flex-col items-center"
            >
              <Upload className={`w-10 h-10 ${hasError ? 'text-red-400' : 'text-gray-400'} mb-2`} />
              <p className="text-sm text-gray-600">
                Cliquez pour télécharger ou glissez-déposez
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG (max 5MB)
              </p>
            </label>
          </div>
        )}

        {hasError && (
          <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
            <AlertCircle size={16} />
            <span>{hasError}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Phase 2: Documents Personnels</h2>
        <p className="text-gray-600 mt-2">
          Téléchargez les documents personnels requis
        </p>
      </div>

      <div className="space-y-6">
        {/* Carte d'identité biométrique (2 copies) */}
        <div className="space-y-4">
          {renderUploadZone(
            'carteIdentite',
            'Carte d\'identité biométrique (2 copies)',
            true,
            2,
            carteIdentite.length
          )}
          
          {/* Show uploaded files */}
          {carteIdentite.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {carteIdentite.map(upload => renderFilePreview(upload, 'carteIdentite'))}
            </div>
          )}
        </div>

        {/* Extrait de naissance */}
        <div className="space-y-4">
          {!extraitNaissance && renderUploadZone(
            'extraitNaissance',
            'Extrait de naissance',
            true
          )}
          
          {extraitNaissance && renderFilePreview(extraitNaissance, 'extraitNaissance')}
        </div>

        {/* Certificat de résidence */}
        <div className="space-y-4">
          {!certificatResidence && renderUploadZone(
            'certificatResidence',
            'Certificat de résidence',
            true
          )}
          
          {certificatResidence && renderFilePreview(certificatResidence, 'certificatResidence')}
        </div>

        {/* Form error */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{errors.submit}</span>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleSubmit(e as any);
            }}
            disabled={uploading}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Téléchargement...' : 'Continuer'}
          </button>
        </div>
      </div>
    </div>
  );
}

