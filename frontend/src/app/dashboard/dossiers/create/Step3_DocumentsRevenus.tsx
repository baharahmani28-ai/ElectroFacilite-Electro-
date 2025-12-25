'use client';

import React, { useState, useEffect } from 'react';
import { Upload, File, X, Check, AlertCircle, Download } from 'lucide-react';

interface FileUpload {
  id: string;
  file: File;
  preview: string;
  type: string;
}

interface Step3Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
  incomeType: string; // 'Employé' | 'Retraité civil' | 'Employé Armée Nationale' | 'Retraité Armée Nationale'
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export default function Step3_DocumentsRevenus({ onNext, onBack, initialData, incomeType }: Step3Props) {
  // Common documents (required for all)
  const [cheques, setCheques] = useState<FileUpload[]>([]);
  const [releveCompte, setReleveCompte] = useState<FileUpload | null>(null);

  // Conditional documents based on income type
  const [attestationTravail, setAttestationTravail] = useState<FileUpload | null>(null);
  const [fichesPaie, setFichesPaie] = useState<FileUpload[]>([]);
  const [attestationRetraite, setAttestationRetraite] = useState<FileUpload | null>(null);
  const [attestationPresence, setAttestationPresence] = useState<FileUpload | null>(null);
  const [attestationPension, setAttestationPension] = useState<FileUpload | null>(null);

  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [uploading, setUploading] = useState(false);

  // Clear conditional documents when income type changes
  useEffect(() => {
    setAttestationTravail(null);
    setFichesPaie([]);
    setAttestationRetraite(null);
    setAttestationPresence(null);
    setAttestationPension(null);
  }, [incomeType]);

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
    switch (fieldName) {
      case 'cheques':
        setCheques(prev => [...prev, ...validFiles].slice(0, 3));
        break;
      case 'releveCompte':
        setReleveCompte(validFiles[0]);
        break;
      case 'attestationTravail':
        setAttestationTravail(validFiles[0]);
        break;
      case 'fichesPaie':
        setFichesPaie(prev => [...prev, ...validFiles].slice(0, 3));
        break;
      case 'attestationRetraite':
        setAttestationRetraite(validFiles[0]);
        break;
      case 'attestationPresence':
        setAttestationPresence(validFiles[0]);
        break;
      case 'attestationPension':
        setAttestationPension(validFiles[0]);
        break;
    }

    setErrors(newErrors);
  };

  // Remove file
  const removeFile = (fieldName: string, fileId?: string) => {
    switch (fieldName) {
      case 'cheques':
        if (fileId) setCheques(prev => prev.filter(f => f.id !== fileId));
        break;
      case 'releveCompte':
        setReleveCompte(null);
        break;
      case 'attestationTravail':
        setAttestationTravail(null);
        break;
      case 'fichesPaie':
        if (fileId) setFichesPaie(prev => prev.filter(f => f.id !== fileId));
        break;
      case 'attestationRetraite':
        setAttestationRetraite(null);
        break;
      case 'attestationPresence':
        setAttestationPresence(null);
        break;
      case 'attestationPension':
        setAttestationPension(null);
        break;
    }
  };

  // Download file
  const downloadFile = (upload: FileUpload) => {
    const url = URL.createObjectURL(upload.file);
    const a = document.createElement('a');
    a.href = url;
    a.download = upload.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Validate form based on income type
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    // Common validations
    if (cheques.length !== 3) {
      newErrors.cheques = '3 chèques sont requis';
    }
    if (!releveCompte) {
      newErrors.releveCompte = 'Le relevé de compte est requis';
    }

    // Conditional validations based on income type
    if (incomeType === 'Employé') {
      if (!attestationTravail) {
        newErrors.attestationTravail = 'L\'attestation de travail est requise';
      }
      if (fichesPaie.length !== 3) {
        newErrors.fichesPaie = '3 fiches de paie sont requises';
      }
    } else if (incomeType === 'Retraité civil') {
      if (!attestationRetraite) {
        newErrors.attestationRetraite = 'L\'attestation de retraite est requise';
      }
    } else if (incomeType === 'Employé Armée Nationale') {
      if (!attestationPresence) {
        newErrors.attestationPresence = 'L\'attestation de présence au corps est requise';
      }
    } else if (incomeType === 'Retraité Armée Nationale') {
      if (!attestationPension) {
        newErrors.attestationPension = 'L\'attestation de pension militaire est requise';
      }
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
      
      // Add common files
      cheques.forEach((upload, index) => {
        formData.append(`cheque${index + 1}`, upload.file);
      });
      if (releveCompte) {
        formData.append('releveCompte', releveCompte.file);
      }

      // Add conditional files based on income type
      if (incomeType === 'Employé') {
        if (attestationTravail) {
          formData.append('attestationTravail', attestationTravail.file);
        }
        fichesPaie.forEach((upload, index) => {
          formData.append(`fichePaie${index + 1}`, upload.file);
        });
      } else if (incomeType === 'Retraité civil' && attestationRetraite) {
        formData.append('attestationRetraite', attestationRetraite.file);
      } else if (incomeType === 'Employé Armée Nationale' && attestationPresence) {
        formData.append('attestationPresence', attestationPresence.file);
      } else if (incomeType === 'Retraité Armée Nationale' && attestationPension) {
        formData.append('attestationPension', attestationPension.file);
      }

      // In production, upload to server here
      // const response = await uploadAPI.uploadRevenueDocuments(formData);

      // Pass data to parent
      const documentData: any = {
        cheques: cheques.map(f => f.file.name),
        releveCompte: releveCompte?.file.name,
        incomeType: incomeType,
        formData: formData
      };

      // Add conditional documents to response
      if (incomeType === 'Employé') {
        documentData.attestationTravail = attestationTravail?.file.name;
        documentData.fichesPaie = fichesPaie.map(f => f.file.name);
      } else if (incomeType === 'Retraité civil') {
        documentData.attestationRetraite = attestationRetraite?.file.name;
      } else if (incomeType === 'Employé Armée Nationale') {
        documentData.attestationPresence = attestationPresence?.file.name;
      } else if (incomeType === 'Retraité Armée Nationale') {
        documentData.attestationPension = attestationPension?.file.name;
      }

      onNext(documentData);
    } catch (error) {
      console.error('Upload error:', error);
      setErrors({ submit: 'Erreur lors du téléchargement des fichiers' });
    } finally {
      setUploading(false);
    }
  };

  // Render file preview with download option
  const renderFilePreview = (upload: FileUpload, fieldName: string) => (
    <div key={upload.id} className="relative border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-center gap-3">
        {/* Preview */}
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
        
        {/* File info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {upload.file.name}
          </p>
          <p className="text-xs text-gray-500">
            {(upload.file.size / 1024).toFixed(2)} KB
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => downloadFile(upload)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Télécharger"
          >
            <Download size={20} />
          </button>
          <button
            type="button"
            onClick={() => removeFile(fieldName, upload.id)}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <X size={20} />
          </button>
        </div>
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
    currentCount: number = 0,
    description?: string
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
        {description && (
          <p className="text-xs text-gray-500">{description}</p>
        )}

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
        <h2 className="text-2xl font-bold text-gray-800">Phase 3: Documents Bancaires et Revenus</h2>
        <p className="text-gray-600 mt-2">
          Type de revenus: <span className="font-semibold text-teal-600">{incomeType}</span>
        </p>
      </div>

      <div className="space-y-6">
        {/* COMMON DOCUMENTS FOR ALL INCOME TYPES */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">Documents Communs (Requis pour tous)</h3>
        </div>

        {/* 3 Chèques postaux ou bancaires */}
        <div className="space-y-4">
          {renderUploadZone(
            'cheques',
            '3 Chèques postaux ou bancaires',
            true,
            3,
            cheques.length
          )}
          
          {cheques.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {cheques.map(upload => renderFilePreview(upload, 'cheques'))}
            </div>
          )}
        </div>

        {/* Relevé de compte (6 derniers mois) */}
        <div className="space-y-4">
          {!releveCompte && renderUploadZone(
            'releveCompte',
            'Relevé de compte (6 derniers mois)',
            true,
            1,
            0,
            'Téléchargez votre relevé de compte bancaire des 6 derniers mois'
          )}
          
          {releveCompte && renderFilePreview(releveCompte, 'releveCompte')}
        </div>

        {/* CONDITIONAL DOCUMENTS BASED ON INCOME TYPE */}
        <div className="bg-teal-50 border-l-4 border-teal-500 p-4 mt-8 mb-6">
          <h3 className="font-semibold text-teal-900 mb-2">
            Documents Spécifiques - {incomeType}
          </h3>
        </div>

        {/* FOR EMPLOYÉ */}
        {incomeType === 'Employé' && (
          <>
            {/* Attestation de travail */}
            <div className="space-y-4">
              {!attestationTravail && renderUploadZone(
                'attestationTravail',
                'Attestation de travail',
                true
              )}
              
              {attestationTravail && renderFilePreview(attestationTravail, 'attestationTravail')}
            </div>

            {/* Fiches de paie (3 derniers mois) */}
            <div className="space-y-4">
              {renderUploadZone(
                'fichesPaie',
                'Fiches de paie (3 derniers mois)',
                true,
                3,
                fichesPaie.length
              )}
              
              {fichesPaie.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                  {fichesPaie.map(upload => renderFilePreview(upload, 'fichesPaie'))}
                </div>
              )}
            </div>
          </>
        )}

        {/* FOR RETRAITÉ CIVIL */}
        {incomeType === 'Retraité civil' && (
          <div className="space-y-4">
            {!attestationRetraite && renderUploadZone(
              'attestationRetraite',
              'Attestation de retraite (CNAS / CASNOS)',
              true
            )}
            
            {attestationRetraite && renderFilePreview(attestationRetraite, 'attestationRetraite')}
          </div>
        )}

        {/* FOR EMPLOYÉ ARMÉE NATIONALE */}
        {incomeType === 'Employé Armée Nationale' && (
          <div className="space-y-4">
            {!attestationPresence && renderUploadZone(
              'attestationPresence',
              'Attestation de présence au corps',
              true
            )}
            
            {attestationPresence && renderFilePreview(attestationPresence, 'attestationPresence')}
          </div>
        )}

        {/* FOR RETRAITÉ ARMÉE NATIONALE */}
        {incomeType === 'Retraité Armée Nationale' && (
          <div className="space-y-4">
            {!attestationPension && renderUploadZone(
              'attestationPension',
              'Attestation de pension militaire',
              true
            )}
            
            {attestationPension && renderFilePreview(attestationPension, 'attestationPension')}
          </div>
        )}

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

