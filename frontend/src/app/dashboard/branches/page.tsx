'use client';

import { useEffect, useState } from 'react';
import { branchesAPI, filesAPI } from '@/lib/api';
import { Building2, MapPin, CheckCircle, XCircle, Edit, Trash2, Plus, FileText, Users, TrendingUp, Activity } from 'lucide-react';

interface Branch {
  id: string;
  code: string;
  name: string;
  address: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
}

interface BranchStats {
  [branchId: string]: {
    total_files: number;
    pending_files: number;
    accepted_files: number;
    rejected_files: number;
  };
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchStats, setBranchStats] = useState<BranchStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    address: '',
    phone: '',
    is_active: true,
  });

  // Safe calculation helpers
  const getTotalBranches = () => {
    try {
      return branches?.length || 0;
    } catch {
      return 0;
    }
  };

  const getActiveBranches = () => {
    try {
      return branches?.filter(b => b?.is_active)?.length || 0;
    } catch {
      return 0;
    }
  };

  const getTotalFiles = () => {
    try {
      if (!branchStats || Object.keys(branchStats).length === 0) return 0;
      return Object.values(branchStats).reduce((sum, stats) => sum + (stats?.total_files || 0), 0);
    } catch {
      return 0;
    }
  };

  const getAcceptanceRate = () => {
    try {
      if (!branchStats || Object.keys(branchStats).length === 0) return 0;
      const total = Object.values(branchStats).reduce((sum, stats) => sum + (stats?.total_files || 0), 0);
      const accepted = Object.values(branchStats).reduce((sum, stats) => sum + (stats?.accepted_files || 0), 0);
      return total > 0 ? Math.round((accepted / total) * 100) : 0;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchBranches();
        await fetchBranchStats();
      } catch (error) {
        console.error('Error in useEffect:', error);
      }
    };
    loadData();
  }, []);

  const fetchBranches = async () => {
    try {
      console.log('Fetching branches...');
      const response = await branchesAPI.getAll();
      console.log('Branches response:', response);
      const branchData = response.data || [];
      console.log('Branch data:', branchData);
      setBranches(branchData);
      setError(null);
    } catch (error: any) {
      const errorMsg = 'Erreur lors du chargement des branches: ' + (error.response?.data?.message || error.message);
      console.error('Error fetching branches:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(errorMsg);
      setBranches([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchBranchStats = async () => {
    try {
      console.log('Fetching files for stats...');
      const response = await filesAPI.getAll();
      console.log('Files response:', response);
      const files = response.data || [];
      console.log('Files data (first 2):', files.slice(0, 2));
      
      // Calculate stats per branch
      const stats: BranchStats = {};
      
      if (Array.isArray(files)) {
        files.forEach((file: any) => {
          const branchId = file.branch_id;
          console.log('Processing file:', { id: file.id, branch_id: branchId, status: file.status });
          
          if (!branchId) {
            console.warn('File without branch_id:', file.id);
            return; // Skip files without branch_id
          }
          
          if (!stats[branchId]) {
            stats[branchId] = {
              total_files: 0,
              pending_files: 0,
              accepted_files: 0,
              rejected_files: 0,
            };
          }
          
          stats[branchId].total_files++;
          if (file.status === 'under_review') stats[branchId].pending_files++;
          if (file.status === 'accepted') stats[branchId].accepted_files++;
          if (file.status === 'rejected') stats[branchId].rejected_files++;
        });
      }
      
      console.log('Calculated stats:', stats);
      setBranchStats(stats);
    } catch (error: any) {
      const errorMsg = 'Erreur lors du chargement des statistiques: ' + (error.response?.data?.message || error.message);
      console.error('Error fetching branch stats:', error);
      console.error('Error details:', error.response?.data || error.message);
      setError(errorMsg);
      // Set empty stats on error to prevent undefined issues
      setBranchStats({});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await branchesAPI.update(editingBranch.id, formData);
      } else {
        await branchesAPI.create(formData);
      }
      setShowForm(false);
      setEditingBranch(null);
      setFormData({ code: '', name: '', address: '', phone: '', is_active: true });
      fetchBranches();
      fetchBranchStats();
    } catch (error) {
      console.error('Error saving branch:', error);
      alert('Error saving branch');
    }
  };

  const handleEdit = (branch: Branch) => {
    setEditingBranch(branch);
    setFormData({
      code: branch.code,
      name: branch.name,
      address: branch.address,
      phone: branch.phone || '',
      is_active: branch.is_active,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      await branchesAPI.delete(id);
      fetchBranches();
    } catch (error) {
      console.error('Error deleting branch:', error);
      alert('Error deleting branch');
    }
  };

  const handleToggleActive = async (branch: Branch) => {
    try {
      await branchesAPI.update(branch.id, { ...branch, is_active: !branch.is_active });
      fetchBranches();
    } catch (error) {
      console.error('Error toggling branch status:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des branches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestion des Branches</h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingBranch(null);
            setFormData({ code: '', name: '', address: '', phone: '', is_active: true });
          }}
          className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          <Plus className="w-5 h-5" />
          <span>Nouvelle Branche</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start">
            <XCircle className="text-red-500 mr-3 mt-0.5" size={20} />
            <div>
              <h3 className="text-red-800 font-semibold">Erreur</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  fetchBranches();
                  fetchBranchStats();
                }}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingBranch ? 'Modifier la Branche' : 'Nouvelle Branche'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                  disabled={!!editingBranch}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Branche Active
              </label>
            </div>
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600"
              >
                {editingBranch ? 'Mettre à Jour' : 'Créer'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingBranch(null);
                }}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-indigo-50 to-white border-l-4 border-indigo-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Branches</p>
              <p className="text-3xl font-bold text-indigo-600">{getTotalBranches()}</p>
            </div>
            <Building2 className="text-indigo-600" size={32} />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-green-50 to-white border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Branches Actives</p>
              <p className="text-3xl font-bold text-green-600">{getActiveBranches()}</p>
            </div>
            <CheckCircle className="text-green-600" size={32} />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-yellow-50 to-white border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Total Dossiers</p>
              <p className="text-3xl font-bold text-yellow-600">{getTotalFiles()}</p>
            </div>
            <FileText className="text-yellow-600" size={32} />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-blue-50 to-white border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">Taux Acceptation</p>
              <p className="text-3xl font-bold text-blue-600">{getAcceptanceRate()}%</p>
            </div>
            <TrendingUp className="text-blue-600" size={32} />
          </div>
        </div>
      </div>

      {/* Branches Grid */}
      {branches.length === 0 ? (
        <div className="card text-center py-12">
          <Building2 className="mx-auto mb-4 text-gray-300" size={64} />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Aucune branche disponible</h3>
          <p className="text-gray-500 mb-6">Commencez par créer votre première branche</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center space-x-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            <span>Créer une branche</span>
          </button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => {
          const stats = branchStats[branch.id] || { total_files: 0, pending_files: 0, accepted_files: 0, rejected_files: 0 };
          
          return (
          <div key={branch.id} className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all p-6 border-t-4" style={{ borderTopColor: branch.is_active ? '#10b981' : '#6b7280' }}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-3 rounded-lg ${branch.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                  <Building2 className={`w-6 h-6 ${branch.is_active ? 'text-green-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{branch.name}</h3>
                  <p className="text-sm text-gray-500 font-mono">{branch.code}</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                {branch.is_active ? (
                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                    Inactive
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">{branch.address}</p>
              </div>
              {branch.phone && (
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-600">📞 {branch.phone}</p>
                </div>
              )}
            </div>

            {/* Branch Statistics */}
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Activity size={16} />
                  Performance
                </h4>
                <span className="text-xs text-gray-500">{stats.total_files} dossiers</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="text-center p-2 bg-yellow-50 rounded">
                  <p className="text-lg font-bold text-yellow-600">{stats.pending_files}</p>
                  <p className="text-xs text-gray-600">En attente</p>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <p className="text-lg font-bold text-green-600">{stats.accepted_files}</p>
                  <p className="text-xs text-gray-600">Acceptés</p>
                </div>
                <div className="text-center p-2 bg-red-50 rounded">
                  <p className="text-lg font-bold text-red-600">{stats.rejected_files}</p>
                  <p className="text-xs text-gray-600">Rejetés</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-2 border-t pt-4">
              <button
                onClick={() => handleEdit(branch)}
                className="flex-1 flex items-center justify-center space-x-2 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="text-sm">Modifier</span>
              </button>
              <button
                onClick={() => handleToggleActive(branch)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                  branch.is_active
                    ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                }`}
              >
                {branch.is_active ? 'Désactiver' : 'Activer'}
              </button>
              <button
                onClick={() => handleDelete(branch.id)}
                className="bg-red-50 text-red-600 p-2 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          );
        })}
      </div>
      )}
    </div>
  );
}

