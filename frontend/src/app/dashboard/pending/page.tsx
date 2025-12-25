'use client';

import { useEffect, useState } from 'react';
import { customersAPI } from '@/lib/notificationsApi';
import { CheckCircle, XCircle, Clock, MapPin, User, Phone, Mail, Calendar, CreditCard } from 'lucide-react';

interface PendingCustomer {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  address?: string;
  national_id?: string;
  date_of_birth?: string;
  notes?: string;
  status: string;
  submitted_at: string;
  branch_name?: string;
  submitted_by_name?: string;
}

export default function PendingRequestsPage() {
  const [requests, setRequests] = useState<PendingCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<PendingCustomer | null>(null);

  useEffect(() => {
    loadPendingRequests();
  }, []);

  const loadPendingRequests = async () => {
    try {
      const data = await customersAPI.getPending();
      setRequests(data);
    } catch (error) {
      console.error('Error loading pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir approuver cette demande?')) return;
    
    setProcessing(id);
    try {
      await customersAPI.approve(id);
      setRequests(requests.filter(r => r.id !== id));
      alert('Demande approuvée avec succès!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Erreur lors de l\'approbation');
    } finally {
      setProcessing(null);
    }
  };

  const openRejectModal = (request: PendingCustomer) => {
    setSelectedRequest(request);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectReason.trim()) {
      alert('Veuillez entrer une raison pour le rejet');
      return;
    }

    setProcessing(selectedRequest.id);
    try {
      await customersAPI.reject(selectedRequest.id, rejectReason);
      setRequests(requests.filter(r => r.id !== selectedRequest.id));
      setShowRejectModal(false);
      setSelectedRequest(null);
      alert('Demande rejetée avec succès!');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Erreur lors du rejet');
    } finally {
      setProcessing(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Demandes en Attente</h1>
        <p className="text-gray-600 mt-1">
          {requests.length} demande(s) de crédit à traiter
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Aucune demande en attente
          </h3>
          <p className="text-gray-500">
            Toutes les demandes ont été traitées
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-gray-800">{request.full_name}</h2>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm flex items-center gap-1">
                      <Clock size={14} />
                      En attente
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {request.branch_name && (
                      <span className="flex items-center gap-1">
                        <MapPin size={16} />
                        {request.branch_name}
                      </span>
                    )}
                    {request.submitted_by_name && (
                      <span className="flex items-center gap-1">
                        <User size={16} />
                        Soumis par: {request.submitted_by_name}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {formatDate(request.submitted_at)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processing === request.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                  >
                    <CheckCircle size={18} />
                    Approuver
                  </button>
                  <button
                    onClick={() => openRejectModal(request)}
                    disabled={processing === request.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <XCircle size={18} />
                    Rejeter
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4 pt-4 border-t">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-semibold">Téléphone:</span>
                    <span>{request.phone}</span>
                  </div>
                  {request.email && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail size={16} className="text-gray-400" />
                      <span className="font-semibold">Email:</span>
                      <span>{request.email}</span>
                    </div>
                  )}
                  {request.national_id && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <CreditCard size={16} className="text-gray-400" />
                      <span className="font-semibold">N° Carte:</span>
                      <span>{request.national_id}</span>
                    </div>
                  )}
                  {request.date_of_birth && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="font-semibold">Date de naissance:</span>
                      <span>{new Date(request.date_of_birth).toLocaleDateString('fr-FR')}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {request.address && (
                    <div className="text-gray-700">
                      <span className="font-semibold">Adresse:</span>
                      <p className="text-sm mt-1">{request.address}</p>
                    </div>
                  )}
                  {request.notes && (
                    <div className="text-gray-700">
                      <span className="font-semibold">Notes:</span>
                      <p className="text-sm mt-1">{request.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Rejeter la demande de {selectedRequest?.full_name}
            </h3>
            <p className="text-gray-600 mb-4">
              Veuillez indiquer la raison du rejet:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded-lg p-3 mb-4 h-32"
              placeholder="Ex: Documents incomplets, revenus insuffisants..."
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Annuler
              </button>
              <button
                onClick={handleReject}
                disabled={processing === selectedRequest?.id}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Confirmer le rejet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

