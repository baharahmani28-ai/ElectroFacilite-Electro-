'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, FileText, User, Package, DollarSign, Calendar, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface Step4Props {
  onNext: (data: any) => void;
  onBack: () => void;
  simulationData: any;
  step2Data: any;
  step3Data: any;
  productLines: any[];
}

export default function Step4_Recapitulatif({ 
  onNext, 
  onBack, 
  simulationData, 
  step2Data, 
  step3Data,
  productLines 
}: Step4Props) {
  const [extractedInfo, setExtractedInfo] = useState<any>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Simulate OCR extraction from uploaded documents
  const extractDocumentInfo = async () => {
    setIsExtracting(true);
    
    // Simulate API call to OCR service
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted data
    const mockExtractedData = {
      cin: {
        numero: '199501234567',
        nom: simulationData.nom,
        prenom: simulationData.prenom,
        dateNaissance: simulationData.dateNaissance,
        lieuNaissance: 'Batna',
        confidence: 92
      },
      fichePaie: {
        employeur: 'Entreprise ABC',
        salaire: parseFloat(simulationData.salaire) || 50000,
        periode: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        confidence: 88
      },
      attestationTravail: {
        entreprise: 'Entreprise ABC',
        poste: simulationData.situationProfessionnelle,
        dateDebut: '01/01/2020',
        confidence: 85
      }
    };
    
    setExtractedInfo(mockExtractedData);
    setIsExtracting(false);
  };

  const calculateTotal = () => {
    return productLines.reduce((sum, line) => sum + (line.total_price || 0), 0);
  };

  const calculateMonthlyPayment = () => {
    const total = calculateTotal();
    const months = parseInt(simulationData.periodicite) || 12;
    return total / months;
  };

  const handleNext = () => {
    onNext({
      extractedInfo,
      totalAmount: calculateTotal(),
      monthlyPayment: calculateMonthlyPayment()
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Récapitulatif du Dossier</h2>
        <p className="text-gray-600">Vérifiez toutes les informations avant de continuer</p>
      </div>

      {/* Extraction OCR Card */}
      <div className="card bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Sparkles className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 mb-2">Extraction Automatique des Documents</h3>
            <p className="text-sm text-gray-600 mb-4">
              Notre système d'IA peut extraire automatiquement les informations de vos documents pour vérifier leur cohérence.
            </p>
            
            {!extractedInfo ? (
              <button
                onClick={extractDocumentInfo}
                disabled={isExtracting}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isExtracting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Extraction en cours...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>Lancer l'extraction automatique</span>
                  </>
                )}
              </button>
            ) : (
              <div className="bg-white rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2 text-green-600 font-semibold mb-3">
                  <CheckCircle size={20} />
                  <span>Extraction terminée avec succès !</span>
                </div>
                
                {/* CIN Info */}
                <div className="border-l-4 border-blue-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800 mb-1">Carte d'Identité Nationale</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Numéro:</span> <span className="font-medium">{extractedInfo.cin.numero}</span></div>
                    <div><span className="text-gray-600">Nom:</span> <span className="font-medium">{extractedInfo.cin.nom}</span></div>
                    <div><span className="text-gray-600">Prénom:</span> <span className="font-medium">{extractedInfo.cin.prenom}</span></div>
                    <div><span className="text-gray-600">Date de naissance:</span> <span className="font-medium">{extractedInfo.cin.dateNaissance}</span></div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Confiance: {extractedInfo.cin.confidence}%
                    </span>
                  </div>
                </div>

                {/* Fiche de Paie */}
                <div className="border-l-4 border-green-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800 mb-1">Fiche de Paie</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Employeur:</span> <span className="font-medium">{extractedInfo.fichePaie.employeur}</span></div>
                    <div><span className="text-gray-600">Salaire:</span> <span className="font-medium">{extractedInfo.fichePaie.salaire.toLocaleString()} DA</span></div>
                    <div><span className="text-gray-600">Période:</span> <span className="font-medium">{extractedInfo.fichePaie.periode}</span></div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Confiance: {extractedInfo.fichePaie.confidence}%
                    </span>
                  </div>
                </div>

                {/* Attestation de Travail */}
                <div className="border-l-4 border-yellow-500 pl-4 py-2">
                  <h4 className="font-semibold text-gray-800 mb-1">Attestation de Travail</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-600">Entreprise:</span> <span className="font-medium">{extractedInfo.attestationTravail.entreprise}</span></div>
                    <div><span className="text-gray-600">Poste:</span> <span className="font-medium">{extractedInfo.attestationTravail.poste}</span></div>
                    <div><span className="text-gray-600">Date début:</span> <span className="font-medium">{extractedInfo.attestationTravail.dateDebut}</span></div>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                      Confiance: {extractedInfo.attestationTravail.confidence}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Client Info */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <User className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-gray-800">Informations Client</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Nom complet:</span>
            <p className="font-semibold">{simulationData.prenom} {simulationData.nom}</p>
          </div>
          <div>
            <span className="text-gray-600">Date de naissance:</span>
            <p className="font-semibold">{simulationData.dateNaissance || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600">Situation:</span>
            <p className="font-semibold">{simulationData.situationPersonnelle || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600">Téléphone:</span>
            <p className="font-semibold">{simulationData.telephone}</p>
          </div>
          <div>
            <span className="text-gray-600">Email:</span>
            <p className="font-semibold">{simulationData.email || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600">Profession:</span>
            <p className="font-semibold">{simulationData.situationProfessionnelle || 'N/A'}</p>
          </div>
          <div>
            <span className="text-gray-600">Salaire mensuel:</span>
            <p className="font-semibold">{parseFloat(simulationData.salaire || 0).toLocaleString()} DA</p>
          </div>
        </div>
      </div>

      {/* Products Summary */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Package className="text-green-600" size={24} />
          <h3 className="text-lg font-bold text-gray-800">Produits Commandés</h3>
        </div>
        <div className="space-y-3">
          {productLines.filter(line => line.product_id).map((line, index) => (
            <div key={line.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-semibold text-gray-800">Produit {index + 1}</p>
                <p className="text-sm text-gray-600">Quantité: {line.quantity}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-800">{line.total_price.toLocaleString()} DA</p>
                <p className="text-xs text-gray-600">{line.unit_price.toLocaleString()} DA / unité</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="card bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="text-blue-600" size={24} />
          <h3 className="text-lg font-bold text-gray-800">Résumé Financier</h3>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Montant total:</span>
            <span className="text-2xl font-bold text-gray-800">{calculateTotal().toLocaleString()} DA</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Durée:</span>
            <span className="text-xl font-semibold text-gray-800">{simulationData.periodicite || 0} mois</span>
          </div>
          <div className="h-px bg-gray-300"></div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700">Mensualité estimée:</span>
            <span className="text-2xl font-bold text-blue-600">{calculateMonthlyPayment().toLocaleString()} DA/mois</span>
          </div>
        </div>
      </div>

      {/* Documents Status */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-purple-600" size={24} />
          <h3 className="text-lg font-bold text-gray-800">Documents Fournis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-medium">Documents personnels (3)</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
            <CheckCircle className="text-green-600" size={20} />
            <span className="text-sm font-medium">Documents de revenus (2)</span>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all flex items-center gap-2"
        >
          <ArrowLeft size={20} />
          Précédent
        </button>

        <button
          onClick={handleNext}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          Suivant
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
}

