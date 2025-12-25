'use client';

import { useEffect, useState } from 'react';
import { customersAPI, filesAPI } from '@/lib/api';
import { Plus, Edit, Trash2, Search, Clock, CheckCircle, XCircle, Eye, FileText, EyeOff } from 'lucide-react';
import { getUser } from '@/lib/utils';
import Cookies from 'js-cookie';

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [viewingClient, setViewingClient] = useState<any>(null);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedCustomerForDocs, setSelectedCustomerForDocs] = useState<any>(null);
  const [customerFiles, setCustomerFiles] = useState<any[]>([]);
  const [customerDocuments, setCustomerDocuments] = useState<any[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    last_name: '',
    first_name: '',
    gender: '',
    email: '',
    phone: '',
    note: '',
    address: '',
    national_id: '',
  });

  const user = getUser();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await customersAPI.getAll();
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Prepare data with only fields that backend expects
      const submitData: any = {
        full_name: `${formData.first_name} ${formData.last_name}`.trim(),
        phone: formData.phone,
        email: formData.email || null,
        address: formData.address || null,
        national_id: formData.national_id || null,
        notes: formData.note || null,
        gender: formData.gender || null,
      };
      
      // Remove empty fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '' || submitData[key] === null) {
          delete submitData[key];
        }
      });

      // Ensure required fields are present
      if (!submitData.full_name || !submitData.phone) {
        alert('Le nom complet et le t?l?phone sont obligatoires');
        return;
      }
      
      if (editingClient) {
        await customersAPI.update(editingClient.id, submitData);
        alert('Client mis ? jour avec succ?s!');
      } else {
        await customersAPI.create(submitData);
        alert('Client ajout? avec succ?s!');
      }
      setShowModal(false);
      setEditingClient(null);
      resetForm();
      loadClients();
    } catch (error: any) {
      console.error('Failed to save client:', error);
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'enregistrement du client';
      alert(`Erreur: ${errorMsg}\n\nV?rifiez que tous les champs sont correctement remplis.`);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await customersAPI.delete(id);
        loadClients();
      } catch (error) {
        console.error('Failed to delete client:', error);
      }
    }
  };

  const openViewModal = (client: any) => {
    setViewingClient(client);
  };

  const openDocumentsModal = async (client: any) => {
    setSelectedCustomerForDocs(client);
    setShowDocumentsModal(true);
    setLoadingDocs(true);
    setCustomerFiles([]);
    setCustomerDocuments([]);
    
    try {
      // Fetch all financing files for this customer
      const response = await filesAPI.getAll();
      const allFiles = response.data;
      
      // Filter files for this customer
      const customerFilesData = allFiles.filter((file: any) => file.customer_id === client.id);
      setCustomerFiles(customerFilesData);
      
      // Fetch documents for each file
      const allDocuments: any[] = [];
      for (const file of customerFilesData) {
        try {
          const fileDetails = await filesAPI.getById(file.id);
          if (fileDetails.data.documents && fileDetails.data.documents.length > 0) {
            allDocuments.push(...fileDetails.data.documents.map((doc: any) => ({
              ...doc,
              file_number: file.file_number,
              file_id: file.id,
              product_name: file.product_name
            })));
          }
        } catch (err) {
          console.error(`Failed to load documents for file ${file.id}:`, err);
        }
      }
      
      setCustomerDocuments(allDocuments);
    } catch (error) {
      console.error('Failed to load customer files:', error);
    } finally {
      setLoadingDocs(false);
    }
  };

  const openEditModal = (client: any) => {
    setEditingClient(client);
    const nameParts = client.full_name.split(' ');
    setFormData({
      first_name: nameParts[0] || '',
      last_name: nameParts.slice(1).join(' ') || '',
      note: client.notes || '',
      gender: client.gender || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      national_id: client.national_id || '',
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      last_name: '',
      first_name: '',
      gender: '',
      email: '',
      phone: '',
      note: '',
      address: '',
      national_id: '',
    });
    setShowPassword(false);
  };

  const filteredClients = clients.filter((client) =>
    client.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.phone.includes(searchQuery) ||
    (client.email && client.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {isAdmin ? 'Tous les Clients' : 'Mes Clients'}
        </h1>
        {!isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setEditingClient(null);
              setShowModal(true);
            }}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Ajouter un Client</span>
          </button>
        )}
      </div>

      {/* Admin Info Banner */}
      {isAdmin && (
        <div className="card mb-6 bg-blue-50 border-l-4 border-blue-500">
          <div className="flex items-start gap-3">
            <Eye className="text-blue-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-blue-900 mb-1">Mode Consultation Administrateur</h3>
              <p className="text-sm text-blue-700">
                Vous pouvez consulter tous les clients et leurs dossiers. 
                Les branches sont responsables de l'ajout et de la modification des clients.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="card mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Clients Table */}
      <div className="card overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">T?l?phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Adresse</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Documents</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                {isAdmin ? 'Consultation' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap font-medium">{client.full_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.phone}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.email || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {client.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      <Clock size={12} />
                      En attente
                    </span>
                  )}
                  {client.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      <CheckCircle size={12} />
                      Approuv?
                    </span>
                  )}
                  {client.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                      <XCircle size={12} />
                      Rejet?
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">{client.address || '-'}</td>
                <td className="px-6 py-4 text-center">
                  <button
                      onClick={() => openDocumentsModal(client)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                      title="Voir les documents"
                    >
                      <FileText size={16} />
                      <span className="text-xs font-medium">Documents</span>
                    </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {isAdmin ? (
                    // Admin: View only
                   <button
                      onClick={() => openViewModal(client)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      title="Voir les détails"
                    >
                      <Eye size={18} />
                      <span className="text-sm">Voir</span>
                    </button>
                  ) : (
                    // Branch: Edit and Delete
                    <>
                      <button
                        onClick={() => openEditModal(client)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                        title="Modifier&quot;
                      >
                        <Edit size={18} />
                      </button>
                     <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <Trash2 size={18} />
                    </button>
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Client Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-white">
                {editingClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-8">
              {/* Row 1: Name and Gender */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Last Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du client <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="last_name"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Benali&quot;
                    required
                  />
                </div>

                {/* First Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pr?nom du client <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="first_name"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Ahmed&quot;
                    required
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Genre <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white&quot;
                    required
                  >
                    <option value="">S?lectionner...</option>
                    <option value="Homme">Homme</option>
                    <option value="Femme">Femme</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Email and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="ahmed@example.com&quot;
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    T?l?phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="0555123456&quot;
                    required
                  />
                </div>
              </div>

              {/* Row 3: Note and National ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Note */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Note
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    rows={3}
                    placeholder="Notes suppl?mentaires...&quot;
                  />
                </div>

                {/* National ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Num?ro de carte d'identit?
                  </label>
                  <input
                    type="text"
                    name="national_id"
                    value={formData.national_id}
                    onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="123456789&quot;
                  />
                </div>
              </div>

              {/* Row 4: Address (Full Width) */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="123 Rue de la Libert?, Alger&quot;
                  required
                />
              </div>

              {/* Modal Footer - Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingClient(null);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-all shadow-sm&quot;
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                >
                  {editingClient ? 'Mettre ? jour' : 'Ajouter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin View Modal - Read Only */}
      {viewingClient && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Eye className="text-blue-600" size={28} />
                  D?tails du Client
                </h2>
                <button
                  onClick={() => setViewingClient(null)}
                  className="text-gray-500 hover:text-gray-700&quot;
                >
                  ?
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Nom Complet</label>
                    <p className="text-lg font-medium text-gray-900">{viewingClient.full_name}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600 block mb-1">T?l?phone</label>
                    <p className="text-lg font-medium text-gray-900">{viewingClient.phone}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Email</label>
                  <p className="text-lg font-medium text-gray-900">{viewingClient.email || 'Non renseign?'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Adresse</label>
                  <p className="text-lg font-medium text-gray-900">{viewingClient.address || 'Non renseign?e'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Carte d'identit?</label>
                  <p className="text-lg font-medium text-gray-900">{viewingClient.national_id || 'Non renseign?'}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-gray-600 block mb-1">Statut</label>
                  <div className="mt-2">
                    {viewingClient.status === 'pending' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                        <Clock size={16} />
                        En attente
                      </span>
                    )}
                    {viewingClient.status === 'approved' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                        <CheckCircle size={16} />
                        Approuv?
                      </span>
                    )}
                    {viewingClient.status === 'rejected' && (
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-800 rounded-full">
                        <XCircle size={16} />
                        Rejet?
                      </span>
                    )}
                  </div>
                </div>

                {viewingClient.notes && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="text-sm font-semibold text-gray-600 block mb-1">Notes</label>
                    <p className="text-gray-900">{viewingClient.notes}</p>
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-semibold text-gray-600 block mb-2">Informations Syst?me</label>\n                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Branche: <span className="font-medium text-gray-900">{viewingClient.branch_name || 'Non sp?cifi?'}</span></p>
                    <p>Cr?? le: <span className="font-medium text-gray-900">{new Date(viewingClient.created_at).toLocaleDateString('fr-FR')}</span></p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setViewingClient(null)}
                  className="btn-primary flex-1&quot;
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Documents Modal */}
      {showDocumentsModal && selectedCustomerForDocs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="text-purple-600" size={28} />
                    Documents de {selectedCustomerForDocs.full_name}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    T?l?phone: {selectedCustomerForDocs.phone}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDocumentsModal(false);
                    setSelectedCustomerForDocs(null);
                    setCustomerFiles([]);
                    setCustomerDocuments([]);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl&quot;
                >
                  ?
                </button>
              </div>

              {loadingDocs ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
                  <p className="text-gray-600">Chargement des documents...</p>
                </div>
              ) : customerFiles.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-600 text-lg">Aucun dossier de cr?dit trouv?</p>
                  <p className="text-gray-500 text-sm mt-2">Ce client n'a pas encore de dossiers avec des documents</p>
                </div>
              ) : (
                <div>
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm font-semibold text-gray-700">
                      {customerFiles.length} dossier{customerFiles.length > 1 ? 's' : ''} trouv?{customerFiles.length > 1 ? 's' : ''} ? {customerDocuments.length} document{customerDocuments.length > 1 ? 's' : ''}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {customerFiles.map((file: any) => {
                      const fileDocuments = customerDocuments.filter((doc: any) => doc.file_id === file.id);
                      return (
                        <div key={file.id} className="border border-gray-200 rounded-lg p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-bold text-lg text-gray-800">
                                  Dossier #{file.file_number}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  file.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                  file.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  file.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {file.status === 'accepted' ? 'Accept?' :
                                   file.status === 'rejected' ? 'Rejet?' :
                                   file.status === 'completed' ? 'Termin?' : 'En r?vision'}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="text-gray-600">Produit:</span>
                                  <span className="ml-2 font-medium text-gray-900">{file.product_name}</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Montant:</span>
                                  <span className="ml-2 font-medium text-gray-900">{file.total_amount} DZD</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">P?riode:</span>
                                  <span className="ml-2 font-medium text-gray-900">{file.installment_period} mois</span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Cr?? le:</span>
                                  <span className="ml-2 font-medium text-gray-900">
                                    {new Date(file.created_at).toLocaleDateString('fr-FR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Documents Grid */}
                          {fileDocuments.length > 0 ? (
                            <div className="border-t pt-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                                Documents ({fileDocuments.length})
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                {fileDocuments.map((doc: any) => {
                                  const filename = doc.file_path.split(/[/\\]/).pop();
                                  const isImage = doc.mime_type && doc.mime_type.startsWith('image/');
                                  const isPDF = doc.mime_type === 'application/pdf';
                                  
                                  return (
                                    <button
                                      key={doc.id}
                                      onClick={async () => {
                                        const token = Cookies.get('token');
                                        try {
                                          const response = await fetch(
                                            `http://localhost:5000/api/secure/documents/${filename}`,
                                            { headers: { 'Authorization': `Bearer ${token}` } }
                                          );
                                          
                                          if (response.ok) {
                                            const blob = await response.blob();
                                            const url = window.URL.createObjectURL(blob);
                                            window.open(url, '_blank');
                                          } else {
                                            alert('Erreur lors du chargement du document');
                                          }
                                        } catch (err) {
                                          console.error('Failed to open document:', err);
                                          alert('Erreur lors de ouverture du document');
                                        }
                                      }}
                                      className="flex items-start gap-3 p-4 bg-gray-50 hover:bg-purple-50 rounded-lg border border-gray-200 hover:border-purple-300 transition-all group text-left&quot;
                                    >
                                      <div className={`p-2 rounded-lg ${isImage ? 'bg-blue-100' : isPDF ? 'bg-red-100' : 'bg-gray-100'}`}>
                                        <FileText 
                                          size={24} 
                                          className={isImage ? 'text-blue-600' : isPDF ? 'text-red-600' : 'text-gray-600'}
                                        />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-purple-700">
                                          {doc.file_name}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                          {(doc.file_size / 1024).toFixed(1)} KB
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {isImage ? '??? Image' : isPDF ? '?? PDF' : '?? Fichier'}
                                        </p>
                                      </div>
                                      <Eye size={18} className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="border-t pt-4 text-center text-gray-500 text-sm">
                              Aucun document pour ce dossier
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowDocumentsModal(false);
                    setSelectedCustomerForDocs(null);
                    setCustomerFiles([]);
                    setCustomerDocuments([]);
                  }}
                  className="btn-primary&quot;
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}






