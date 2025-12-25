'use client';

import { useEffect, useState } from 'react';
import { productsAPI } from '@/lib/api';
import { Plus, Calculator } from 'lucide-react';

const FAMILIES = [
  'Réfrigérateurs',
  'Machines à Laver',
  'Téléviseurs',
  'Climatiseurs',
  'Téléphones',
  'Cuisinières',
  'Micro-ondes',
  'Autres'
];

const INSTALLMENT_PLANS = [
  { months: 6, markup: 35, label: '6 mois (+35%)' },
  { months: 15, markup: 65, label: '15 mois (+65%)' },
  { months: 24, markup: 115, label: '24 mois (+115%)' },
  { months: 36, markup: 165, label: '36 mois (+165%)' }
];

export default function AddProductPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    code: '',
    famille: '',
    name: '',
    brand: '',
    color: '',
    size: '',
    purchase_price: '',
    cash_sale_price: '',
    stock_quantity: '',
    branch_id: '',
    image_url: '',
    description: '',
  });

  const [installmentPrices, setInstallmentPrices] = useState({
    months_6: 0,
    months_15: 0,
    months_24: 0,
    months_36: 0,
  });

  const [selectedPlan, setSelectedPlan] = useState<number | null>(null);
  const [downPayment, setDownPayment] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState(0);

  useEffect(() => {
    loadBranches();
  }, []);

  useEffect(() => {
    calculateInstallments();
  }, [formData.purchase_price]);

  useEffect(() => {
    calculateMonthlyPayment();
  }, [selectedPlan, downPayment, installmentPrices]);

  const loadBranches = async () => {
    try {
      const { branchesAPI } = await import('@/lib/api');
      const response = await branchesAPI.getActive();
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  const calculateInstallments = () => {
    const purchasePrice = parseFloat(formData.purchase_price) || 0;
    
    setInstallmentPrices({
      months_6: purchasePrice * (1 + 35 / 100),
      months_15: purchasePrice * (1 + 65 / 100),
      months_24: purchasePrice * (1 + 115 / 100),
      months_36: purchasePrice * (1 + 165 / 100),
    });
  };

  const calculateMonthlyPayment = () => {
    if (!selectedPlan) return;

    const plan = INSTALLMENT_PLANS.find(p => p.months === selectedPlan);
    if (!plan) return;

    const installmentPrice = installmentPrices[`months_${selectedPlan}` as keyof typeof installmentPrices];
    const down = parseFloat(downPayment) || 0;
    const remaining = installmentPrice - down;
    const monthly = remaining / selectedPlan;

    setMonthlyPayment(monthly);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        branch_id: formData.branch_id || null, // null if empty = available to all branches
        purchase_price: parseFloat(formData.purchase_price),
        cash_sale_price: parseFloat(formData.cash_sale_price),
        stock_quantity: parseInt(formData.stock_quantity),
        installment_6_months: installmentPrices.months_6,
        installment_15_months: installmentPrices.months_15,
        installment_24_months: installmentPrices.months_24,
        installment_36_months: installmentPrices.months_36,
      };

      await productsAPI.create(productData);
      alert('Produit ajouté avec succès!');
      
      // Reset form
      setFormData({
        code: '',
        famille: '',
        name: '',
        brand: '',
        color: '',
        size: '',
        purchase_price: '',
        cash_sale_price: '',
        stock_quantity: '',
        branch_id: '',
        image_url: '',
        description: '',
      });
      setSelectedPlan(null);
      setDownPayment('');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Erreur lors de l\'ajout du produit');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Ajouter un Produit</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              placeholder="Ex: LG-WM-001&quot;
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Famille *</label>
            <select
              value={formData.famille}
              onChange={(e) => setFormData({ ...formData, famille: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary&quot;
              required
            >
              <option value="">Sélectionner...</option>
              {FAMILIES.map((family) => (
                <option key={family} value={family}>{family}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Marque *</label>
            <input
              type="text"
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              placeholder="Ex: LG, Samsung, Condor&quot;
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nom du Produit *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              placeholder="Ex: Machine à Laver 7kg&quot;
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mag2 (Branche)</label>
            <select
              value={formData.branch_id}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary&quot;
            >
              <option value="">Toutes les branches (Global)</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.code})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Laisser vide pour rendre le produit disponible à toutes les branches
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calculator className="w-5 h-5 mr-2" />
            Tarification
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix d'achat (DA) *</label>
              <input
                type="number"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="50000"
                step="0.01&quot;
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prix vente comptant (DA) *</label>
              <input
                type="number"
                value={formData.cash_sale_price}
                onChange={(e) => setFormData({ ...formData, cash_sale_price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="60000"
                step="0.01&quot;
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quantité *</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
                placeholder="10&quot;
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Couleur</label>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Blanc, Noir...&quot;
              />
            </div>
          </div>
        </div>

        {/* Installment Prices Display */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Prix à Tempérament (Calculés Automatiquement)</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {INSTALLMENT_PLANS.map((plan) => (
              <div key={plan.months} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600 mb-1">{plan.label}</div>
                <div className="text-2xl font-bold text-blue-600">
                  {installmentPrices[`months_${plan.months}` as keyof typeof installmentPrices].toLocaleString('fr-DZ')} DA
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Augmentation: {plan.markup}%
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Payment Calculator */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Calcul de Mensualité</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Choisir un plan</label>
              <select
                value={selectedPlan || ''}
                onChange={(e) => setSelectedPlan(e.target.value ? parseInt(e.target.value) : null)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary&quot;
              >
                <option value="">Sélectionner...</option>
                {INSTALLMENT_PLANS.map((plan) => (
                  <option key={plan.months} value={plan.months}>
                    {plan.months} mois
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Avance (DA)</label>
              <input
                type="number"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="10000"
                step="0.01&quot;
                disabled={!selectedPlan}
              />
            </div>

            <div className="flex items-end">
              <div className="w-full bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm text-gray-600 mb-1">Mensualité</div>
                <div className="text-2xl font-bold text-green-600">
                  {monthlyPayment.toLocaleString('fr-DZ', { maximumFractionDigits: 2 })} DA
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Taille/Dimensions</label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => setFormData({ ...formData, size: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: 7kg, 55 pouces...&quot;
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">URL Image</label>
            <input
              type="url"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://...&quot;
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            rows={3}
            placeholder="Description du produit...&quot;
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50&quot;
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex items-center space-x-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            <span>Ajouter le Produit</span>
          </button>
        </div>
      </form>
    </div>
  );
}

