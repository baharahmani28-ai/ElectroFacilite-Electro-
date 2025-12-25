'use client';

import { useEffect, useState } from 'react';
import { filesAPI, customersAPI, productsAPI } from '@/lib/api';
import { Plus, Edit, CheckCircle, XCircle, FileText, Filter, Image as ImageIcon, Download, Eye } from 'lucide-react';
import { getUser } from '@/lib/utils';
import DocumentCard from './DocumentCard';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'under_review', label: 'Under Review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
];

export default function FilesPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedFileDocuments, setSelectedFileDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    product_id: '',
    total_amount: '',
    down_payment: '',
    installment_period: '',
    notes: '',
  });
  const [statusData, setStatusData] = useState({
    status: '',
    rejection_reason: '',
  });

  const user = getUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadFiles();
    loadCustomers();
    loadProducts();
  }, [statusFilter]);

  const loadFiles = async () => {
    try {
      console.log('Loading files with status filter:', statusFilter);
      const response = await filesAPI.getAll(statusFilter);
      console.log('Files loaded:', response.data);
      console.log('Files count:', response.data?.length || 0);
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to load files:', error);
      alert('Error loading files: ' + (error as any)?.response?.data?.message || (error as any)?.message);
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
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!formData.customer_id) {
        alert('Please select a customer');
        return;
      }
      if (!formData.total_amount || parseFloat(formData.total_amount) <= 0) {
        alert('Please enter a valid total amount greater than 0');
        return;
      }
      if (!formData.installment_period || parseInt(formData.installment_period) <= 0) {
        alert('Please enter a valid installment period greater than 0');
        return;
      }

      const data = {
        ...formData,
        total_amount: parseFloat(formData.total_amount),
        down_payment: parseFloat(formData.down_payment) || 0,
        installment_period: parseInt(formData.installment_period),
      };
      console.log('Submitting file creation with data:', data);
      await filesAPI.create(data);
      setShowModal(false);
      resetForm();
      loadFiles();
      alert('File created successfully!');
    } catch (error: any) {
      console.error('Failed to create file:', error);
      const errorMessage = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Unknown error';
      const errorDetail = error?.response?.data?.detail || '';
      alert(`Error creating file: ${errorMessage}\n${errorDetail}`);
    }
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await filesAPI.updateStatus(selectedFile.id, statusData.status, statusData.rejection_reason);
      setShowStatusModal(false);
      setSelectedFile(null);
      setStatusData({ status: '', rejection_reason: '' });
      loadFiles();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: '',
      product_id: '',
      total_amount: '',
      down_payment: '',
      installment_period: '',
      notes: '',
    });
  };

  const loadDocuments = async (fileId: string) => {
    setLoadingDocuments(true);
    try {
      const response = await filesAPI.getById(fileId);
      const documents = response.data.documents || [];
      const fileData = response.data;
      setSelectedFile(fileData); // Store complete file data
      setSelectedFileDocuments(documents);
      setShowDocumentsModal(true);
    } catch (error) {
      console.error('Failed to load documents:', error);
      alert('Erreur lors du chargement des documents');
    } finally {
      setLoadingDocuments(false);
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    const types: any = {
      carte_identite: 'Carte d\'Identité',
      photo_client: 'Photo du Client',
      fiche_familiale: 'Fiche Familiale',
      justificatif_domicile: 'Justificatif de Domicile',
      bulletin_salaire: 'Bulletin de Salaire',
      releve_bancaire: 'Relevé Bancaire',
      attestation_travail: 'Attestation de Travail',
      autre: 'Autre Document'
    };
    return types[type] || type;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    const option = STATUS_OPTIONS.find(opt => opt.value === status);
    return option?.label || status;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Financing Files</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>New File</span>
        </button>
      </div>

      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Filter size={20} className="text-gray-600" />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {files.map((file) => (
          <div key={file.id} className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  {/* Product Image or Default Icon */}
                  {file.product_image_url ? (
                    <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img 
                        src={file.product_image_url} 
                        alt={file.product_name || 'Product'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          (e.target as HTMLImageElement).style.display = 'none';
                          const parent = (e.target as HTMLImageElement).parentElement;
                          if (parent) {
                            parent.innerHTML = '<div class="w-full h-full bg-blue-100 flex items-center justify-center"><svg class="text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg></div>';
                          }
                        }}
                      />
                    </div>
                  ) : (
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <FileText className="text-primary" size={24} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">File #{file.file_number}</h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm ${getStatusColor(file.status)}`}>
                      {getStatusText(file.status)}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Customer</p>
                    <p className="font-semibold">{file.customer_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Product</p>
                    <p className="font-semibold">{file.product_name || 'N/A'}</p>
                    {file.product_brand && (
                      <p className="text-xs text-gray-500">{file.product_brand}</p>
                    )}
                    {file.product_color && (
                      <p className="text-xs text-gray-500">{file.product_color}</p>
                    )}
                  </div>
                  <div>
                    <p className="text-gray-600">Total Amount</p>
                    <p className="font-semibold">{file.total_amount} DZD</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Monthly Payment</p>
                    <p className="font-semibold">{parseFloat(file.monthly_installment).toFixed(2)} DZD</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Period</p>
                    <p className="font-semibold">{file.installment_period} months</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Created By</p>
                    <p className="font-semibold">{file.created_by_name}</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col space-y-2 ml-4">
                {/* View Documents Button */}
                <button
                  onClick={() => loadDocuments(file.id)}
                  disabled={loadingDocuments}
                  className="bg-purple-100 text-purple-600 p-2 rounded-lg hover:bg-purple-200 flex items-center space-x-2"
                  title="Voir les documents"
                >
                  <Eye size={20} />
                  <span className="text-sm">Documents</span>
                </button>
                
                {isAdmin && file.status === 'under_review' && (
                  <>
                    <button
                      onClick={() => {
                        setSelectedFile(file);
                        setStatusData({ status: 'accepted', rejection_reason: '' });
                        setShowStatusModal(true);
                      }}
                      className="bg-green-100 text-green-600 p-2 rounded-lg hover:bg-green-200"
                    >
                      <CheckCircle size={20} />
                    </button>
                    <button
                    onClick={() => {
                      setSelectedFile(file);
                      setStatusData({ status: 'rejected', rejection_reason: '' });
                      setShowStatusModal(true);
                    }}
                    className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200"
                  >
                    <XCircle size={20} />
                  </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create File Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Financing File</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Customer *</label>
                <select
                  className="input"
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  required
                >
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Product (Optional)</label>
                <select
                  className="input"
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                >
                  <option value="">Select product</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {product.price} DZD
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Total Amount (DZD) *</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.total_amount}
                    onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                    required
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="label">Down Payment (DZD)</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.down_payment}
                    onChange={(e) => setFormData({ ...formData, down_payment: e.target.value })}
                    step="0.01"
                  />
                </div>
              </div>
              <div>
                <label className="label">Installment Period (Months) *</label>
                <input
                  type="number"
                  className="input"
                  value={formData.installment_period}
                  onChange={(e) => setFormData({ ...formData, installment_period: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Create</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn-danger flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6">Update File Status</h2>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="label">Status</label>
                <select
                  className="input"
                  value={statusData.status}
                  onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                  required
                >
                  <option value="">Select status</option>
                  <option value="accepted">Accept</option>
                  <option value="rejected">Reject</option>
                  <option value="completed">Complete</option>
                </select>
              </div>
              {statusData.status === 'rejected' && (
                <div>
                  <label className="label">Rejection Reason *</label>
                  <textarea
                    className="input"
                    rows={3}
                    value={statusData.rejection_reason}
                    onChange={(e) => setStatusData({ ...statusData, rejection_reason: e.target.value })}
                    required
                  />
                </div>
              )}
              <div className="flex space-x-3">
                <button type="submit" className="btn-primary flex-1">Update</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowStatusModal(false);
                    setSelectedFile(null);
                    setStatusData({ status: '', rejection_reason: '' });
                  }}
                  className="btn-danger flex-1"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentsModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Documents du Dossier #{selectedFile.file_number}</h2>
                
                {/* Product Info Card */}
                {selectedFile.product_name && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center space-x-4">
                      {selectedFile.product_image_url && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-md flex-shrink-0">
                          <img 
                            src={selectedFile.product_image_url} 
                            alt={selectedFile.product_name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Produit financé</p>
                        <h3 className="font-bold text-gray-800 text-lg">{selectedFile.product_name}</h3>
                        <div className="flex items-center space-x-4 mt-1">
                          {selectedFile.product_brand && (
                            <span className="text-sm text-gray-600">
                              <strong>Marque:</strong> {selectedFile.product_brand}
                            </span>
                          )}
                          {selectedFile.product_color && (
                            <span className="text-sm text-gray-600">
                              <strong>Couleur:</strong> {selectedFile.product_color}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-blue-600 font-semibold mt-1">
                          {selectedFile.total_amount} DZD - {selectedFile.installment_period} mois
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  setShowDocumentsModal(false);
                  setSelectedFileDocuments([]);
                  setSelectedFile(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl ml-4"
              >
                ×
              </button>
            </div>

            {selectedFileDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">Aucun document trouvé pour ce dossier</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedFileDocuments.map((doc: any) => (
                  <DocumentCard 
                    key={doc.id} 
                    doc={doc} 
                    getDocumentTypeLabel={getDocumentTypeLabel}
                  />
                ))}
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  setShowDocumentsModal(false);
                  setSelectedFileDocuments([]);
                }}
                className="btn-primary"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

