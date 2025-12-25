'use client';

import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

interface Step4Props {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData?: any;
}

export default function Step4_InfosComplementaires({ onNext, onBack, initialData }: Step4Props) {
  const [formData, setFormData] = useState({
    nombreEnfants: initialData?.nombreEnfants || '',
    personnesACharge: initialData?.personnesACharge || '',
    logement: initialData?.logement || '',
    loyerMensuel: initialData?.loyerMensuel || '',
    autresCharges: initialData?.autresCharges || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Informations Complémentaires
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre d'enfants */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Nombre d'enfants *
            </label>
            <input
              type="number"
              name="nombreEnfants"
              value={formData.nombreEnfants}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Personnes à charge */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Personnes à charge *
            </label>
            <input
              type="number"
              name="personnesACharge"
              value={formData.personnesACharge}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Type de logement */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Type de logement *
            </label>
            <select
              name="logement"
              value={formData.logement}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Sélectionnez...</option>
              <option value="Propriétaire">Propriétaire</option>
              <option value="Locataire">Locataire</option>
              <option value="Logement de fonction">Logement de fonction</option>
              <option value="Chez les parents">Chez les parents</option>
            </select>
          </div>

          {/* Loyer mensuel */}
          <div>
            <label className="block text-gray-700 font-bold mb-2">
              Loyer mensuel (DA) {formData.logement === 'Locataire' && '*'}
            </label>
            <input
              type="number"
              name="loyerMensuel"
              value={formData.loyerMensuel}
              onChange={handleChange}
              min="0"
              step="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={formData.logement === 'Locataire'}
              placeholder="Ex: 25000"
            />
          </div>

          {/* Autres charges mensuelles */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 font-bold mb-2">
              Autres charges mensuelles (DA)
            </label>
            <textarea
              name="autresCharges"
              value={formData.autresCharges}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Électricité: 5000 DA, Eau: 2000 DA..."
            />
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Précédent
          </button>

          <button
            type="submit"
            className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            Suivant
            <ArrowRight size={20} />
          </button>
        </div>
      </form>
    </div>
  );
}

