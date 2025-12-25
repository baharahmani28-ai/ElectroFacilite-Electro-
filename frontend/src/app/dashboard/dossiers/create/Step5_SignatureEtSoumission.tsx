'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle, Send, FileSignature, AlertCircle } from 'lucide-react';

interface Step5Props {
  onSubmit: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

export default function Step5_SignatureEtSoumission({ onSubmit, onBack, isSubmitting }: Step5Props) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [signature, setSignature] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = () => {
    const newErrors: {[key: string]: string} = {};

    if (!hasReadTerms) {
      newErrors.terms = 'Vous devez lire les conditions générales';
    }
    if (!acceptTerms) {
      newErrors.accept = 'Vous devez accepter les conditions générales';
    }
    if (!signature.trim()) {
      newErrors.signature = 'La signature est requise';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">Signature et Soumission</h2>
        <p className="text-gray-600">Dernière étape avant d'envoyer votre dossier à l'administrateur</p>
      </div>

      {/* Important Notice */}
      <div className="card bg-yellow-50 border-2 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-yellow-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-yellow-900 mb-2">Important</h3>
            <p className="text-sm text-yellow-800">
              Une fois soumis, votre dossier sera envoyé à l'administrateur pour révision. 
              Assurez-vous que toutes les informations sont correctes avant de continuer.
            </p>
          </div>
        </div>
      </div>

      {/* Terms and Conditions */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <FileSignature className="text-blue-600" size={24} />
          Conditions Générales
        </h3>

        <div className="bg-gray-50 rounded-lg p-6 max-h-64 overflow-y-auto border border-gray-200 mb-4">
          <h4 className="font-bold text-gray-800 mb-3">Conditions d'utilisation du service de financement</h4>
          
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <strong>1. Acceptation des conditions</strong><br />
              En soumettant ce dossier, vous acceptez les conditions générales de Fcilite Electre et vous engagez à fournir des informations exactes et véridiques.
            </p>

            <p>
              <strong>2. Vérification des documents</strong><br />
              Tous les documents fournis seront vérifiés par notre équipe. Toute falsification entraînera le rejet automatique du dossier et des poursuites légales.
            </p>

            <p>
              <strong>3. Engagement de paiement</strong><br />
              Vous vous engagez à payer les mensualités convenues dans les délais impartis. Tout retard de paiement peut entraîner des pénalités.
            </p>

            <p>
              <strong>4. Protection des données</strong><br />
              Vos données personnelles sont protégées conformément à la loi sur la protection des données. Elles ne seront utilisées que dans le cadre de votre demande de financement.
            </p>

            <p>
              <strong>5. Délai de traitement</strong><br />
              Le traitement de votre dossier peut prendre de 2 à 5 jours ouvrables. Vous serez notifié par email et SMS de l'évolution de votre demande.
            </p>

            <p>
              <strong>6. Droit de rétractation</strong><br />
              Vous disposez d'un délai de 14 jours pour vous rétracter après acceptation du financement, conformément à la législation en vigueur.
            </p>

            <p>
              <strong>7. Clause de garantie</strong><br />
              Les produits financés restent la propriété de Fcilite Electre jusqu'au paiement intégral de toutes les mensualités.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasReadTerms}
              onChange={(e) => {
                setHasReadTerms(e.target.checked);
                if (errors.terms) {
                  const newErrors = { ...errors };
                  delete newErrors.terms;
                  setErrors(newErrors);
                }
              }}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500&quot;
            />
            <span className="text-gray-700">J'ai lu et compris les conditions générales</span>
          </label>
          {errors.terms && (
            <p className="text-red-600 text-sm ml-8">{errors.terms}</p>
          )}

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => {
                setAcceptTerms(e.target.checked);
                if (errors.accept) {
                  const newErrors = { ...errors };
                  delete newErrors.accept;
                  setErrors(newErrors);
                }
              }}
              className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500&quot;
            />
            <span className="text-gray-700 font-medium">J'accepte les conditions générales et je m'engage à respecter mes obligations</span>
          </label>
          {errors.accept && (
            <p className="text-red-600 text-sm ml-8">{errors.accept}</p>
          )}
        </div>
      </div>

      {/* Signature */}
      <div className="card">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Signature Électronique</h3>
        <p className="text-sm text-gray-600 mb-4">
          Veuillez saisir votre nom complet ci-dessous comme signature électronique.
        </p>

        <div className="space-y-2">
          <label className="block text-gray-700 font-medium">
            Signature * (Nom complet)
          </label>
          <input
            type="text"
            value={signature}
            onChange={(e) => {
              setSignature(e.target.value);
              if (errors.signature) {
                const newErrors = { ...errors };
                delete newErrors.signature;
                setErrors(newErrors);
              }
            }}
            placeholder="Ex: Mohamed Khelili"
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-signature&quot;
            style={{ fontFamily: 'cursive' }}
          />
          {errors.signature && (
            <p className="text-red-600 text-sm">{errors.signature}</p>
          )}
          <p className="text-xs text-gray-500">
            En signant électroniquement, vous certifiez que toutes les informations fournies sont exactes et complètes.
          </p>
        </div>

        {signature && (
          <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Aperçu de votre signature :</p>
            <p className="text-2xl font-signature text-blue-900" style={{ fontFamily: 'cursive' }}>
              {signature}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Date: {new Date().toLocaleDateString('fr-FR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        )}
      </div>

      {/* Final Confirmation */}
      <div className="card bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200">
        <div className="flex items-start gap-3">
          <CheckCircle className="text-green-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-bold text-green-900 mb-2">Prêt à soumettre ?</h3>
            <p className="text-sm text-green-800 mb-3">
              Votre dossier est complet et prêt à être envoyé à l'administrateur pour révision.
              Une fois soumis, vous recevrez une notification de confirmation.
            </p>
            <ul className="text-sm text-green-700 space-y-1 list-disc list-inside">
              <li>Vos informations personnelles ont été vérifiées</li>
              <li>Tous les documents requis ont été téléchargés</li>
              <li>L'extraction automatique a été effectuée</li>
              <li>Vous avez accepté les conditions générales</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={20} />
          Précédent
        </button>

        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-bold rounded-lg hover:from-green-700 hover:to-blue-700 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Soumission en cours...</span>
            </>
          ) : (
            <>
              <Send size={20} />
              <span>Soumettre le Dossier</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

