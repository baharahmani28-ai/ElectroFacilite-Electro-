'use client';

import { useEffect, useState } from 'react';
import { filesAPI, customersAPI, productsAPI, branchesAPI } from '@/lib/api';
import { Plus, Eye, CheckCircle, XCircle, FileText, Filter, Clock, Search, User, Package, Building2, BarChart, Trash2 } from 'lucide-react';
import { getUser } from '@/lib/utils';
import Link from 'next/link';
import Cookies from 'js-cookie';

const STATUS_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'under_review', label: 'En Révision' },
  { value: 'accepted', label: 'Accepté' },
  { value: 'rejected', label: 'Rejeté' },
  { value: 'completed', label: 'Complété' },
];

export default function DossiersPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupByBranch, setGroupByBranch] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [statusData, setStatusData] = useState({
    status: '',
    rejection_reason: '',
  });

  const user = getUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadFiles();
    if (isAdmin) {
      loadBranches();
    }
  }, [statusFilter, branchFilter]);

  const loadFiles = async () => {
    try {
      const response = await filesAPI.getAll(statusFilter);
      setFiles(response.data);
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const loadBranches = async () => {
    try {
      const response = await branchesAPI.getAll();
      setBranches(response.data);
    } catch (error) {
      console.error('Failed to load branches:', error);
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

  const openStatusModal = (file: any) => {
    setSelectedFile(file);
    setStatusData({ status: file.status, rejection_reason: file.rejection_reason || '' });
    setShowStatusModal(true);
  };

  const openViewModal = async (file: any) => {
    try {
      // Fetch full file details including documents
      const response = await filesAPI.getById(file.id);
      setSelectedFile(response.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to load file details:', error);
      // Fallback to basic file data
      setSelectedFile(file);
      setShowViewModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce dossier ? Cette action est irréversible.')) {
      try {
        await filesAPI.delete(id);
        loadFiles();
      } catch (error) {
        console.error('Failed to delete file:', error);
        alert('Erreur lors de la suppression du dossier. Veuillez réessayer.');
      }
    }
  };

  const filteredFiles = files.filter((file) =>
    (file.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.file_number?.includes(searchQuery)) &&
    (branchFilter === '' || file.branch_id === branchFilter)
  );

  // Group files by branch if enabled
  const groupedFiles: { [key: string]: any[] } = {};
  if (groupByBranch && isAdmin) {
    filteredFiles.forEach((file) => {
      const branchName = file.branch_name || 'Sans branche';
      if (!groupedFiles[branchName]) {
        groupedFiles[branchName] = [];
      }
      groupedFiles[branchName].push(file);
    });
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      'under_review': { icon: Clock, color: 'yellow', label: 'En Révision' },
      'accepted': { icon: CheckCircle, color: 'green', label: 'Accepté' },
      'rejected': { icon: XCircle, color: 'red', label: 'Rejeté' },
      'completed': { icon: CheckCircle, color: 'blue', label: 'Complété' },
    };
    const config = statusConfig[status] || { icon: FileText, color: 'gray', label: status };
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 bg-${config.color}-100 text-${config.color}-800 rounded-full text-xs font-medium`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isAdmin ? 'Tous les Dossiers' : 'Mes Dossiers'}
        </h1>
        {!isAdmin && (
          <Link href="/dashboard/dossiers/create">
            <button className="btn-primary flex items-center space-x-2">
              <Plus size={20} />
              <span>Créer un Dossier</span>
            </button>
          </Link>
        )}
      </div>

      {/* Admin Info Banner */}
      {isAdmin && (
        <div className="card mb-6 bg-purple-50 border-l-4 border-purple-500">
          <div className="flex items-start gap-3">
            <FileText className="text-purple-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-purple-900 mb-1">Centre de Gestion des Dossiers</h3>
              <p className="text-sm text-purple-700">
                Ici arrivent tous les dossiers envoyés par les branches. Vous pouvez les réviser, approuver ou rejeter.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              className="input pl-10"
              placeholder="Rechercher par client, produit ou numéro..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
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

          {/* Branch Filter (Admin Only) */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Building2 className="text-gray-400" size={20} />
              <select
                className="input"
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
              >
                <option value="">Toutes les branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Group by Branch Toggle (Admin Only) */}
        {isAdmin && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={groupByBranch}
                onChange={(e) => setGroupByBranch(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <BarChart size={16} />
                Grouper par branche
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Statistics Summary (Admin Only) */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-purple-50 to-white border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-purple-600">{filteredFiles.length}</p>
          </div>
          <div className="card bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
            <p className="text-sm text-gray-600 mb-1">En Révision</p>
            <p className="text-2xl font-bold text-yellow-600">
              {filteredFiles.filter(f => f.status === 'under_review').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Acceptés</p>
            <p className="text-2xl font-bold text-green-600">
              {filteredFiles.filter(f => f.status === 'accepted').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-red-50 to-white border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-1">Rejetés</p>
            <p className="text-2xl font-bold text-red-600">
              {filteredFiles.filter(f => f.status === 'rejected').length}
            </p>
          </div>
          <div className="card bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Complétés</p>
            <p className="text-2xl font-bold text-blue-600">
              {filteredFiles.filter(f => f.status === 'completed').length}
            </p>
          </div>
        </div>
      )}

      {/* Files Display - Grouped or List View */}
      {groupByBranch && isAdmin ? (
        // Grouped by Branch View
        <div className="space-y-6">
          {Object.keys(groupedFiles).length === 0 ? (
            <div className="card text-center py-12">
              <FileText className="mx-auto mb-3 text-gray-300" size={48} />
              <p className="text-lg font-medium text-gray-500">Aucun dossier trouvé</p>
            </div>
          ) : (
            Object.entries(groupedFiles).map(([branchName, branchFiles]) => (
              <div key={branchName} className="card">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Building2 className="text-indigo-600" size={20} />
                    {branchName}
                  </h3>
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-full">
                    {branchFiles.length} dossier{branchFiles.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Dossier</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {branchFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 text-sm font-mono text-gray-900">{file.file_number}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{file.customer_name}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">{file.product_name}</td>
                          <td className="px-4 py-4 text-sm font-semibold text-gray-900">
                            {parseFloat(file.total_amount).toLocaleString()} DA
                          </td>
                          <td className="px-4 py-4">{getStatusBadge(file.status)}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {new Date(file.created_at).toLocaleDateString('fr-FR')}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openViewModal(file)}
                                className="text-blue-600 hover:text-blue-800"
                                title="Voir détails"
                              >
                                <Eye size={18} />
                              </button>
                              {isAdmin && (
                                <>
                                  <button
                                    onClick={() => openStatusModal(file)}
                                    className="text-purple-600 hover:text-purple-800"
                                    title="Modifier statut"
                                  >
                                    <CheckCircle size={18} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(file.id)}
                                    className="text-red-600 hover:text-red-800"
                                    title="Supprimer"
                                  >
                                    <Trash2 size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        // Standard List View
        <div className="card overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Dossier</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branche</th>}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 8 : 7} className="px-6 py-12 text-center text-gray-500">
                  <FileText className="mx-auto mb-3 text-gray-300" size={48} />
                  <p className="text-lg font-medium">Aucun dossier trouvé</p>
                  <p className="text-sm mt-1">
                    {isAdmin 
                      ? "Les dossiers envoyés par les branches apparaîtront ici"
                      : "Créez votre premier dossier en cliquant sur le bouton ci-dessus"
                    }
                  </p>
                </td>
              </tr>
            ) : (
              filteredFiles.map((file) => (
                <tr key={file.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{file.file_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-gray-400" />
                      {file.customer_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-gray-400" />
                      {file.product_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-semibold">
                    {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(file.total_amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(file.status)}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {file.branch_name || 'N/A'}
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(file.created_at).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openViewModal(file)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Voir les détails"
                      >
                        <Eye size={18} />
                      </button>
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => openStatusModal(file)}
                            className="text-purple-600 hover:text-purple-800"
                            title="Modifier le statut"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Supprimer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      )}

      {/* View File Modal */}
      {showViewModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Détails du Dossier</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Image Section */}
                {selectedFile.product_image_url && (
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border border-purple-200">
                    <label className="text-sm font-semibold text-purple-700 flex items-center gap-2 mb-3">
                      <Package size={18} />
                      Image du Produit
                    </label>
                    <div className="flex justify-center bg-white rounded-lg p-4">
                      <img 
                        src={selectedFile.product_image_url} 
                        alt={selectedFile.product_name}
                        className="max-h-64 object-contain rounded-lg"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                    <div className="mt-2 text-center">
                      <p className="text-sm font-semibold text-gray-700">{selectedFile.product_name}</p>
                      {selectedFile.product_brand && (
                        <p className="text-xs text-gray-500">Marque: {selectedFile.product_brand}</p>
                      )}
                      {selectedFile.product_color && (
                        <p className="text-xs text-gray-500">Couleur: {selectedFile.product_color}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600">N° Dossier</label>
                    <p className="text-lg font-mono font-bold text-gray-900">{selectedFile.file_number}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600">Statut</label>
                    <div className="mt-2">{getStatusBadge(selectedFile.status)}</div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-blue-700">Client</label>
                  <p className="text-xl font-bold text-blue-900">{selectedFile.customer_name}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-purple-700">Produit</label>
                  <p className="text-xl font-bold text-purple-900">{selectedFile.product_name}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600">Montant Total</label>
                    <p className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(selectedFile.total_amount)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600">Acompte</label>
                    <p className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(selectedFile.down_payment || 0)}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600">Période</label>
                    <p className="text-lg font-bold text-gray-900">{selectedFile.installment_period} mois</p>
                  </div>
                </div>

                {isAdmin && selectedFile.branch_name && (
                  <div className="bg-indigo-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-indigo-700">Branche</label>
                    <p className="text-lg font-bold text-indigo-900">{selectedFile.branch_name}</p>
                  </div>
                )}

                {selectedFile.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600">Notes</label>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedFile.notes}</p>
                  </div>
                )}

                {/* Documents Section */}
                {selectedFile.documents && selectedFile.documents.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                    <label className="text-sm font-semibold text-blue-700 flex items-center gap-2 mb-3">
                      <FileText size={18} />
                      Documents Téléchargés ({selectedFile.documents.length})
                    </label>
                    <div className="space-y-2">
                      {selectedFile.documents.map((doc: any) => {
                        // Extract filename from path
                        const filename = doc.file_path.split(/[/\\]/).pop();
                        return (
                          <div key={doc.id} className="bg-white p-3 rounded-lg flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <FileText className="text-blue-600" size={20} />
                              <div>
                                <p className="font-medium text-gray-900">{doc.file_name}</p>
                                <p className="text-xs text-gray-500">
                                  {doc.document_type} • {(doc.file_size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={async () => {
                                try {
                                  const token = Cookies.get('token');
                                  const response = await fetch(`http://localhost:5000/api/secure/documents/${filename}`, {
                                    headers: { 'Authorization': `Bearer ${token}` }
                                  });
                                  if (!response.ok) throw new Error('Failed to fetch');
                                  const blob = await response.blob();
                                  const url = window.URL.createObjectURL(blob);
                                  window.open(url, '_blank');
                                  setTimeout(() => window.URL.revokeObjectURL(url), 100);
                                } catch (err) {
                                  console.error('Error opening document:', err);
                                  alert('Erreur lors de l\'ouverture du document');
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              Voir
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {selectedFile.rejection_reason && (
                  <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <label className="text-sm font-semibold text-red-700">Raison du Rejet</label>
                    <p className="text-red-900 mt-1">{selectedFile.rejection_reason}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-gray-600">Date de création</label>
                  <p className="text-gray-900">{new Date(selectedFile.created_at).toLocaleString('fr-FR')}</p>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="btn-primary w-full"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal - Admin Only */}
      {showStatusModal && selectedFile && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Modifier le Statut</h2>
              <form onSubmit={handleStatusUpdate}>
                <div className="space-y-4">
                  <div>
                    <label className="label">Statut</label>
                    <select
                      className="input"
                      value={statusData.status}
                      onChange={(e) => setStatusData({ ...statusData, status: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      <option value="under_review">En Révision</option>
                      <option value="accepted">Accepté</option>
                      <option value="rejected">Rejeté</option>
                      <option value="completed">Complété</option>
                    </select>
                  </div>
                  {statusData.status === 'rejected' && (
                    <div>
                      <label className="label">Raison du Rejet</label>
                      <textarea
                        className="input"
                        rows={3}
                        value={statusData.rejection_reason}
                        onChange={(e) => setStatusData({ ...statusData, rejection_reason: e.target.value })}
                        placeholder="Expliquez pourquoi le dossier est rejeté..."
                        required
                      />
                    </div>
                  )}
                  <div className="flex space-x-3">
                    <button type="submit" className="btn-primary flex-1">
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStatusModal(false);
                        setSelectedFile(null);
                        setStatusData({ status: '', rejection_reason: '' });
                      }}
                      className="btn-danger flex-1"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

