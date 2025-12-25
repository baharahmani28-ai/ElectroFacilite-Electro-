'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { filesAPI, customersAPI, productsAPI } from '@/lib/api';
import { ArrowLeft, ArrowRight, Plus, Minus, MoreVertical, Trash2, Search, X } from 'lucide-react';
import Link from 'next/link';
import Step2_DocumentsPersonnels from './Step2_DocumentsPersonnels';
import Step3_DocumentsRevenus from './Step3_DocumentsRevenus';
import Step4_Recapitulatif from './Step4_Recapitulatif';
import Step5_SignatureEtSoumission from './Step5_SignatureEtSoumission';

const TOTAL_STAGES = 5;

interface ProductLine {
  id: string;
  product_id: string;
  stock_location: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  monthly_payment: number;
}

export default function CreateDossierPage() {
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(1);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showActionMenu, setShowActionMenu] = useState<string | null>(null);
  const [showProductSelector, setShowProductSelector] = useState<string | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showClientSelector, setShowClientSelector] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  
  // Product lines for "La commande" section
  const [productLines, setProductLines] = useState<ProductLine[]>([
    {
      id: Date.now().toString(),
      product_id: '',
      stock_location: '',
      quantity: 1,
      unit_price: 0,
      total_price: 0,
      monthly_payment: 0,
    }
  ]);
  
  // Stage 1: Simulation Information
  const [simulationData, setSimulationData] = useState({
    nom: '',
    prenom: '',
    dateNaissance: '',
    situationPersonnelle: '',
    telephone: '',
    email: '',
    situationProfessionnelle: '',
    salaire: '',
    periodicite: '',
  });

  // Stage 2: Documents Personnels data
  const [step2Data, setStep2Data] = useState<any>(null);

  // Stage 3: Documents Revenus data
  const [step3Data, setStep3Data] = useState<any>(null);

  // Stage 4: Recap data
  const [step4Data, setStep4Data] = useState<any>(null);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    total_amount: '',
    down_payment: '',
    installment_period: '',
    notes: '',
  });

  useEffect(() => {
    loadCustomers();
    loadProducts();

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.product-selector-container')) {
        setShowProductSelector(null);
        setProductSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get installment markup percentage based on period
  const getInstallmentMarkup = (months: number): number => {
    switch (months) {
      case 6: return 35;
      case 15: return 65;
      case 24: return 115;
      case 36: return 165;
      default: return 0;
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customersAPI.getAll();
      setCustomers(response.data);
    } catch (error) {
      console.error('Failed to load customers:', error);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      console.log('Loaded products:', response.data.length, 'products');
      console.log('First product:', response.data[0]);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleSimulationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSimulationData({
      ...simulationData,
      [e.target.name]: e.target.value,
    });
  };

  // Recalculate monthly payments when periodicite changes
  useEffect(() => {
    if (simulationData.periodicite && productLines.length > 0) {
      const months = parseInt(simulationData.periodicite);
      const markup = getInstallmentMarkup(months);
      
      setProductLines(productLines.map(line => {
        if (line.product_id) {
          const basePrice = line.unit_price * line.quantity;
          const installmentPrice = basePrice * (1 + markup / 100);
          return {
            ...line,
            total_price: installmentPrice,
            monthly_payment: installmentPrice / months
          };
        }
        return line;
      }));
    }
  }, [simulationData.periodicite]);

  const selectExistingClient = (customer: any) => {
    console.log('Selected customer:', customer);
    
    // Format date properly for input type="date" (YYYY-MM-DD)
    let formattedDate = '';
    if (customer.date_of_birth) {
      const date = new Date(customer.date_of_birth);
      if (!isNaN(date.getTime())) {
        formattedDate = date.toISOString().split('T')[0];
      }
    }
    
    const newSimulationData = {
      nom: customer.last_name || '',
      prenom: customer.first_name || '',
      dateNaissance: formattedDate,
      situationPersonnelle: customer.marital_status || '',
      telephone: customer.phone || '',
      email: customer.email || '',
      situationProfessionnelle: customer.employment_status || '',
      salaire: customer.monthly_income?.toString() || '',
      periodicite: '',
    };
    
    console.log('New simulation data:', newSimulationData);
    
    setSimulationData(newSimulationData);
    setFormData({
      ...formData,
      customer_id: customer.id,
    });
    setShowClientSelector(false);
    setClientSearchQuery('');
    
    // Show confirmation alert
    alert(`✅ Client sélectionné: ${customer.first_name} ${customer.last_name}\n\nLes informations seront pré-remplies dans les champs.`);
  };

  const getFilteredClients = () => {
    if (!clientSearchQuery.trim()) return customers;
    const query = clientSearchQuery.toLowerCase();
    return customers.filter(c => 
      c.first_name?.toLowerCase().includes(query) ||
      c.last_name?.toLowerCase().includes(query) ||
      c.phone?.includes(query) ||
      c.national_id?.includes(query)
    );
  };

  const handleNext = () => {
    if (currentStage < TOTAL_STAGES) {
      setCurrentStage(currentStage + 1);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) {
      setCurrentStage(currentStage - 1);
    }
  };

  // Product line management functions
  const addProductLine = () => {
    setProductLines([
      ...productLines,
      {
        id: Date.now().toString(),
        product_id: '',
        stock_location: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0,
        monthly_payment: 0,
      }
    ]);
  };

  const removeProductLine = (id: string) => {
    if (productLines.length > 1) {
      setProductLines(productLines.filter(line => line.id !== id));
    }
  };

  const updateProductLine = (id: string, field: keyof ProductLine, value: any) => {
    console.log('updateProductLine called:', { id, field, value });
    
    setProductLines(prevLines => {
      const newLines = prevLines.map(line => {
        if (line.id === id) {
          const updatedLine = { ...line, [field]: value };
          
          // If product changed, update price
          if (field === 'product_id' && value) {
            const selectedProduct = products.find(p => p.id === value);
            console.log('Selected product:', selectedProduct);
            
            // Use cash_sale_price as the base price (not purchase_price)
            if (selectedProduct && (selectedProduct.cash_sale_price || selectedProduct.price)) {
              const unitPrice = Number(selectedProduct.cash_sale_price || selectedProduct.price);
              const months = parseInt(simulationData.periodicite) || 6;
              const markup = getInstallmentMarkup(months);
              const basePrice = unitPrice * updatedLine.quantity;
              const installmentPrice = basePrice * (1 + markup / 100);
              
              updatedLine.unit_price = unitPrice;
              updatedLine.total_price = installmentPrice;
              updatedLine.monthly_payment = installmentPrice / months;
              
              console.log('Price calculation:', {
                unitPrice,
                quantity: updatedLine.quantity,
                months,
                markup,
                basePrice,
                installmentPrice,
                monthly_payment: updatedLine.monthly_payment,
                updatedLine
              });
            } else {
              console.warn('Product not found or has no price:', value, selectedProduct);
            }
          }
          
          // If quantity changed, recalculate total
          if (field === 'quantity' && updatedLine.unit_price > 0) {
            const months = parseInt(simulationData.periodicite) || 6;
            const markup = getInstallmentMarkup(months);
            const basePrice = updatedLine.unit_price * Number(value);
            const installmentPrice = basePrice * (1 + markup / 100);
            updatedLine.total_price = installmentPrice;
            updatedLine.monthly_payment = installmentPrice / months;
          }
          
          return updatedLine;
        }
        return line;
      });
      
      console.log('Updated product lines:', newLines);
      return newLines;
    });
  };

  const getProductImage = (productId: string) => {
    const product = products.find(p => p.id === productId);
    return product?.image_url || '/placeholder-product.png';
  };

  const getProductDetails = (productId: string) => {
    return products.find(p => p.id === productId);
  };

  const getFilteredProducts = () => {
    if (!productSearchQuery.trim()) return products;
    const query = productSearchQuery.toLowerCase();
    return products.filter(p => 
      p.name?.toLowerCase().includes(query) ||
      p.brand?.toLowerCase().includes(query) ||
      p.code?.toLowerCase().includes(query)
    );
  };

  const selectProduct = (lineId: string, productId: string) => {
    updateProductLine(lineId, 'product_id', productId);
    setShowProductSelector(null);
    setProductSearchQuery('');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Step 1: Upload all documents first if they exist
      let uploadedFiles: any = {};
      
      if (step2Data?.formData || step3Data?.formData) {
        console.log('Uploading documents...');
        const allFormData = new FormData();
        
        // Add Step 2 files (Personal documents)
        if (step2Data?.formData) {
          for (let pair of step2Data.formData.entries()) {
            allFormData.append(pair[0], pair[1]);
          }
        }
        
        // Add Step 3 files (Income documents)
        if (step3Data?.formData) {
          for (let pair of step3Data.formData.entries()) {
            allFormData.append(pair[0], pair[1]);
          }
        }

        try {
          // Upload files to server
          const uploadResponse = await fetch('http://localhost:5000/api/files/upload-documents', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${document.cookie.split('token=')[1]?.split(';')[0]}`
            },
            body: allFormData
          });
          
          if (uploadResponse.ok) {
            uploadedFiles = await uploadResponse.json();
            console.log('Files uploaded:', uploadedFiles);
          } else {
            console.error('File upload failed:', await uploadResponse.text());
          }
        } catch (uploadError) {
          console.error('Error uploading files:', uploadError);
        }
      }

      // Step 2: Calculate total from product lines
      const totalAmount = productLines.reduce((sum, line) => 
        sum + (line.total_price || 0), 0
      );

      // ========================================
      // CRITICAL: Notes = TEXT ONLY (No File Paths!)
      // ========================================
      // Documents are stored SEPARATELY in the documents table
      // NEVER include file names, paths, or extensions in notes
      // This section contains ONLY customer and order information
      // ========================================
      const detailedNotes = `
=== INFORMATIONS CLIENT ===
Nom: ${simulationData.nom}
Prénom: ${simulationData.prenom}
Date de naissance: ${simulationData.dateNaissance || 'N/A'}
Téléphone: ${simulationData.telephone}
Email: ${simulationData.email || 'N/A'}
Situation personnelle: ${simulationData.situationPersonnelle || 'N/A'}
Situation professionnelle: ${simulationData.situationProfessionnelle || 'N/A'}
Salaire mensuel: ${simulationData.salaire ? parseFloat(simulationData.salaire).toLocaleString('fr-DZ') : 'N/A'} DA

=== DÉTAILS DE LA COMMANDE ===
Période d'installation: ${simulationData.periodicite} mois
Nombre de produits: ${productLines.length}

--- Produits commandés ---
${productLines.map((line, index) => {
  const product = getProductDetails(line.product_id);
  return `${index + 1}. ${product?.name || 'Produit non sélectionné'}
   - Stock: ${line.stock_location || 'Non spécifié'}
   - Quantité: ${line.quantity}
   - Prix unitaire: ${line.unit_price.toLocaleString('fr-DZ')} DA
   - Prix total: ${line.total_price.toLocaleString('fr-DZ')} DA
   - Mensualité: ${line.monthly_payment.toLocaleString('fr-DZ', { maximumFractionDigits: 2 })} DA`;
}).join('\n\n')}

=== MONTANTS ===
Total général: ${totalAmount.toLocaleString('fr-DZ')} DA
Mensualité totale: ${(totalAmount / parseInt(simulationData.periodicite || '12')).toLocaleString('fr-DZ', { maximumFractionDigits: 2 })} DA
      `.trim();

      // ⚠️ REMOVED: Document sections from notes
      // Documents are now stored ONLY in the documents table
      // Notes field contains ONLY text information (no file paths)

      // ⚠️ CRITICAL: Do NOT JSON.stringify uploaded files!
      // Files are already uploaded to the server and saved to the database.
      // We only need to pass the file IDs or references, NOT the file content as text.
      const data: any = {
        product_id: productLines[0]?.product_id || null,
        total_amount: totalAmount,
        down_payment: 0,
        installment_period: parseInt(simulationData.periodicite) || 12,
        notes: detailedNotes,
        product_lines: JSON.stringify(productLines),
        // Store only file metadata (paths, names), NOT stringified files
        uploaded_files_info: uploadedFiles.files ? JSON.stringify({
          count: uploadedFiles.files.length,
          files: uploadedFiles.files.map((f: any) => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            filename: f.filename,
            size: f.size,
            mimetype: f.mimetype
          }))
        }) : null,
      };

      // If existing customer selected, use customer_id
      if (formData.customer_id) {
        data.customer_id = formData.customer_id;
      } else {
        // Otherwise, send customer data to create new customer
        data.customer_data = {
          nom: simulationData.nom,
          prenom: simulationData.prenom,
          dateNaissance: simulationData.dateNaissance,
          telephone: simulationData.telephone,
          email: simulationData.email,
          situationPersonnelle: simulationData.situationPersonnelle,
          situationProfessionnelle: simulationData.situationProfessionnelle,
          salaire: simulationData.salaire,
        };
      }

      console.log('Submitting dossier:', data);
      
      await filesAPI.create(data);
      
      alert('✅ Dossier soumis avec succès!\n\nVotre dossier a été envoyé à l\'administrateur pour révision. Vous recevrez une notification dès qu\'il sera traité.');
      
      router.push('/dashboard/dossiers');
    } catch (error: any) {
      console.error('Failed to create file:', error);
      alert(`❌ Erreur lors de la création du dossier:\n${error.response?.data?.message || error.message || 'Erreur inconnue'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard/dossiers">
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2">
              <ArrowLeft size={20} />
              Retour
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Créer un Nouveau Dossier</h1>
            <p className="text-gray-600">Étape {currentStage} sur {TOTAL_STAGES}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStage / TOTAL_STAGES) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={(e) => { e.preventDefault(); handleNext(); }}>
            
            {/* Stage 1: Simulation Information */}
            {currentStage === 1 && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold text-gray-800">Informations de Simulation</h2>
                  <button
                    type="button"
                    onClick={() => setShowClientSelector(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                  >
                    <Search size={18} />
                    Sélectionner un client existant
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Client Name */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="nom"
                      value={simulationData.nom}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Benali"
                      required
                    />
                  </div>

                  {/* First Name */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      name="prenom"
                      value={simulationData.prenom}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: Ahmed"
                      required
                    />
                  </div>

                  {/* Date of Birth */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Date de naissance *
                    </label>
                    <input
                      type="date"
                      name="dateNaissance"
                      value={simulationData.dateNaissance}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Personal Status */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Situation personnelle *
                    </label>
                    <select
                      name="situationPersonnelle"
                      value={simulationData.situationPersonnelle}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="Célibataire">Célibataire</option>
                      <option value="Marié(e)">Marié(e)</option>
                      <option value="Divorcé(e)">Divorcé(e)</option>
                    </select>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Numéro de téléphone *
                    </label>
                    <input
                      type="tel"
                      name="telephone"
                      value={simulationData.telephone}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ex: 0555123456"
                      required
                    />
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Adresse email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={simulationData.email}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="exemple@email.com"
                      required
                    />
                  </div>

                  {/* Professional Status */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Situation professionnelle *
                    </label>
                    <select
                      name="situationProfessionnelle"
                      value={simulationData.situationProfessionnelle}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="Employé">Employé</option>
                      <option value="Retraité">Retraité</option>
                      <option value="Retraité militaire">Retraité militaire</option>
                      <option value="Militaire">Militaire</option>
                      <option value="Autres">Autres</option>
                    </select>
                  </div>

                  {/* Salary */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Salaire *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="salaire"
                        value={simulationData.salaire}
                        onChange={handleSimulationChange}
                        className="w-full px-4 py-2 pr-16 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ex: 50000"
                        required
                      />
                      <span className="absolute right-4 top-2.5 text-gray-500 font-semibold">
                        DZD
                      </span>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Périodicité *
                    </label>
                    <select
                      name="periodicite"
                      value={simulationData.periodicite}
                      onChange={handleSimulationChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionnez...</option>
                      <option value="6">6 mois</option>
                      <option value="15">15 mois</option>
                      <option value="24">24 mois</option>
                      <option value="36">36 mois</option>
                    </select>
                  </div>
                </div>

                {/* La commande Section */}
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">La commande</h3>
                  
                  {/* Product Table */}
                  <div className="overflow-x-auto shadow-lg rounded-lg">
                    <table className="w-full bg-white text-sm">
                      <thead>
                        <tr style={{ backgroundColor: '#4db6ac' }}>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-white">Produit</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-white">Stock</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-white">Prix unitaire</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-white">Qté</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-white">Prix total</th>
                          <th className="px-3 py-2 text-left text-xs font-semibold text-white">Mensualité</th>
                          <th className="px-3 py-2 text-center text-xs font-semibold text-white w-20">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productLines.map((line, index) => (
                          <tr key={line.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            {/* Product Select with Image */}
                            <td className="px-3 py-2">
                              <div className="relative product-selector-container">
                                {line.product_id ? (
                                  // Selected Product Display
                                  <div 
                                    onClick={() => setShowProductSelector(line.id)}
                                    className="flex items-center gap-2 px-2 py-1.5 border border-gray-300 rounded-lg cursor-pointer hover:border-teal-500 transition-colors bg-white"
                                  >
                                    <img
                                      src={getProductImage(line.product_id)}
                                      alt="Product"
                                      className="w-8 h-8 object-cover rounded"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                                      }}
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-gray-900 truncate">
                                        {getProductDetails(line.product_id)?.name}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">
                                        {getProductDetails(line.product_id)?.brand}
                                      </p>
                                    </div>
                                    <X 
                                      size={16} 
                                      className="text-gray-400 hover:text-red-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateProductLine(line.id, 'product_id', '');
                                      }}
                                    />
                                  </div>
                                ) : (
                                  // Select Button
                                  <button
                                    type="button"
                                    onClick={() => setShowProductSelector(line.id)}
                                    className="w-full min-w-[200px] px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-teal-500 hover:text-teal-600 transition-colors flex items-center justify-center gap-2"
                                  >
                                    <Search size={16} />
                                    Sélectionner un produit
                                  </button>
                                )}

                                {/* Product Selector Dropdown */}
                                {showProductSelector === line.id && (
                                  <div className="absolute top-full left-0 mt-2 w-[700px] bg-white border border-gray-300 rounded-lg shadow-xl z-50 max-h-[450px] overflow-hidden">
                                    {/* Search Input */}
                                    <div className="p-3 border-b border-gray-200 bg-gray-50">
                                      <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                                        <input
                                          type="text"
                                          placeholder="Rechercher un produit..."
                                          value={productSearchQuery}
                                          onChange={(e) => setProductSearchQuery(e.target.value)}
                                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                                          autoFocus
                                        />
                                      </div>
                                    </div>

                                    {/* Product List */}
                                    <div className="max-h-[370px] overflow-y-auto">
                                      {getFilteredProducts().length === 0 ? (
                                        <div className="p-6 text-center text-gray-500">
                                          <p className="text-sm">Aucun produit trouvé</p>
                                        </div>
                                      ) : (
                                        getFilteredProducts().map((product) => (
                                          <div
                                            key={product.id}
                                            onClick={() => selectProduct(line.id, product.id)}
                                            className="flex items-center gap-3 p-3 hover:bg-teal-50 cursor-pointer transition-colors border-b border-gray-100"
                                          >
                                            <img
                                              src={product.image_url || '/placeholder-product.png'}
                                              alt={product.name}
                                              className="w-14 h-14 object-cover rounded border border-gray-200"
                                              onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23ccc" stroke-width="2"%3E%3Crect x="3" y="3" width="18" height="18" rx="2"/%3E%3Ccircle cx="8.5" cy="8.5" r="1.5"/%3E%3Cpath d="M21 15l-5-5L5 21"/%3E%3C/svg%3E';
                                              }}
                                            />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-semibold text-gray-900 mb-0.5">
                                                {product.name}
                                              </p>
                                              <p className="text-xs text-gray-600 mb-0.5">
                                                {product.brand} • {product.code}
                                              </p>
                                              <p className="text-sm text-teal-600 font-bold">
                                                {(product.price || 0).toLocaleString('fr-DZ')} DA
                                              </p>
                                            </div>
                                          </div>
                                        ))
                                      )}
                                    </div>

                                    {/* Close Button */}
                                    <div className="p-2 border-t border-gray-200 bg-gray-50">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowProductSelector(null);
                                          setProductSearchQuery('');
                                        }}
                                        className="w-full px-3 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                                      >
                                        Fermer
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>

                            {/* Stock Location */}
                            <td className="px-3 py-2">
                              <select
                                value={line.stock_location}
                                onChange={(e) => updateProductLine(line.id, 'stock_location', e.target.value)}
                                className="w-full min-w-[120px] px-2 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                              >
                                <option value="">Sélectionner...</option>
                                <option value="I-yusr stock">I-yusr stock</option>
                                <option value="Magasin principal">Magasin principal</option>
                                <option value="Entrepôt A">Entrepôt A</option>
                                <option value="Entrepôt B">Entrepôt B</option>
                              </select>
                            </td>

                            {/* Unit Price */}
                            <td className="px-3 py-2">
                              <div className="px-2 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700">
                                {line.unit_price.toLocaleString('fr-DZ')} DA
                              </div>
                            </td>

                            {/* Quantity */}
                            <td className="px-3 py-2">
                              <div className="flex items-center space-x-1">
                                <button
                                  type="button"
                                  onClick={() => updateProductLine(line.id, 'quantity', Math.max(1, line.quantity - 1))}
                                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                                >
                                  <Minus size={14} />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={line.quantity}
                                  onChange={(e) => updateProductLine(line.id, 'quantity', parseInt(e.target.value) || 1)}
                                  className="w-12 px-1 py-1 border border-gray-300 rounded-md text-center text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateProductLine(line.id, 'quantity', line.quantity + 1)}
                                  className="p-1 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                            </td>

                            {/* Total Price */}
                            <td className="px-3 py-2">
                              <div className="px-2 py-1.5 bg-green-50 rounded-lg text-xs font-bold text-green-700">
                                {line.total_price.toLocaleString('fr-DZ')} DA
                              </div>
                            </td>

                            {/* Monthly Payment */}
                            <td className="px-3 py-2">
                              <div className="px-2 py-1.5 bg-blue-50 rounded-lg text-xs font-bold text-blue-700">
                                {line.monthly_payment.toLocaleString('fr-DZ', { maximumFractionDigits: 2 })} DA
                              </div>
                            </td>

                            {/* Action Menu */}
                            <td className="px-3 py-2">
                              <div className="relative">
                                <button
                                  type="button"
                                  onClick={() => setShowActionMenu(showActionMenu === line.id ? null : line.id)}
                                  className="p-1.5 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                  <MoreVertical size={18} className="text-gray-600" />
                                </button>
                                
                                {showActionMenu === line.id && (
                                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        removeProductLine(line.id);
                                        setShowActionMenu(null);
                                      }}
                                      className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                                    >
                                      <Trash2 size={16} />
                                      Supprimer
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Product Button */}
                  <button
                    type="button"
                    onClick={addProductLine}
                    className="mt-4 w-full py-3 border-2 border-dashed border-teal-400 text-teal-600 font-semibold rounded-lg hover:bg-teal-50 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={20} />
                    Ajouter un produit
                  </button>
                </div>
              </div>
            )}

            {/* Stage 2: Documents Personnels */}
            {currentStage === 2 && (
              <Step2_DocumentsPersonnels
                onNext={(data) => {
                  setStep2Data(data);
                  handleNext();
                }}
                onBack={handleBack}
                initialData={step2Data}
              />
            )}

            {/* Stage 3: Documents Revenus */}
            {currentStage === 3 && (
              <Step3_DocumentsRevenus
                onNext={(data) => {
                  setStep3Data(data);
                  handleNext();
                }}
                onBack={handleBack}
                initialData={step3Data}
                incomeType={simulationData.situationProfessionnelle}
              />
            )}

            {/* Stage 4: Récapitulatif et Extraction OCR */}
            {currentStage === 4 && (
              <Step4_Recapitulatif
                onNext={(data) => {
                  setStep4Data(data);
                  handleNext();
                }}
                onBack={handleBack}
                simulationData={simulationData}
                step2Data={step2Data}
                step3Data={step3Data}
                productLines={productLines}
              />
            )}

            {/* Stage 5: Signature et Soumission */}
            {currentStage === 5 && (
              <Step5_SignatureEtSoumission
                onSubmit={handleSubmit}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}

            {/* Navigation Buttons - Only show for Stage 1 */}
            {currentStage === 1 && (
              <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack}
                disabled={currentStage === 1}
                className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                  currentStage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
              >
                Précédent
              </button>

              <div className="text-sm font-medium text-gray-500">
                Étape {currentStage} / {TOTAL_STAGES}
              </div>

              <button
                type="submit"
                className="px-8 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
              >
                Suivant
                <ArrowRight size={20} />
              </button>
            </div>
            )}
          </form>
        </div>
      </div>

      {/* Client Selector Modal */}
      {showClientSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-gray-800">Sélectionner un client existant</h3>
                <button
                  onClick={() => {
                    setShowClientSelector(false);
                    setClientSearchQuery('');
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rechercher par nom, prénom, téléphone ou CIN..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto max-h-[60vh] p-6">
              {getFilteredClients().length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Aucun client trouvé</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {getFilteredClients().map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => selectExistingClient(customer)}
                      className="w-full p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-all text-left group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 group-hover:text-blue-600 mb-1">
                            {customer.first_name} {customer.last_name}
                          </h4>
                          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-400">📞</span>
                              <span>{customer.phone}</span>
                            </div>
                            {customer.email && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">📧</span>
                                <span>{customer.email}</span>
                              </div>
                            )}
                            {customer.national_id && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">🆔</span>
                                <span>{customer.national_id}</span>
                              </div>
                            )}
                            {customer.date_of_birth && (
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400">📅</span>
                                <span>{new Date(customer.date_of_birth).toLocaleDateString('fr-FR')}</span>
                              </div>
                            )}
                          </div>
                          {customer.marital_status && (
                            <div className="mt-2 text-xs">
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
                                {customer.marital_status}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            {customer.first_name?.charAt(0)}{customer.last_name?.charAt(0)}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-600 text-center">
                💡 Sélectionnez un client pour pré-remplir automatiquement les informations
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

