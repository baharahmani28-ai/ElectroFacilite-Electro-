'use client';

import { useEffect, useState } from 'react';
import { statsAPI } from '@/lib/api/stats';
import { Users, Package, Building2, CheckCircle, XCircle, Clock } from 'lucide-react';

interface AdminStats {
  customersByBranch: Array<{
    branch_name: string;
    branch_code: string;
    total_customers: number;
    pending: number;
    approved: number;
    rejected: number;
  }>;
  productsByBranch: Array<{
    branch_name: string;
    branch_code: string;
    total_products: number;
    total_stock: number;
  }>;
  overall: {
    total_customers: number;
    pending_requests: number;
    approved_requests: number;
    rejected_requests: number;
    total_products: number;
    total_stock: number;
    active_branches: number;
  };
  recentActivity: Array<{
    id: string;
    full_name: string;
    status: string;
    submitted_at: string;
    branch_name: string;
    submitted_by: string;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await statsAPI.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  if (!stats) {
    return <div className="p-8">Erreur de chargement des statistiques</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">Tableau de Bord Administrateur</h1>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-blue-600">{stats.overall.total_customers}</p>
            </div>
            <Users className="w-12 h-12 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">En Attente</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.overall.pending_requests}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approuvés</p>
              <p className="text-3xl font-bold text-green-600">{stats.overall.approved_requests}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rejetés</p>
              <p className="text-3xl font-bold text-red-600">{stats.overall.rejected_requests}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Produits</p>
              <p className="text-3xl font-bold text-purple-600">{stats.overall.total_products}</p>
            </div>
            <Package className="w-12 h-12 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Total</p>
              <p className="text-3xl font-bold text-indigo-600">{stats.overall.total_stock}</p>
            </div>
            <Package className="w-12 h-12 text-indigo-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Branches Actives</p>
              <p className="text-3xl font-bold text-cyan-600">{stats.overall.active_branches}</p>
            </div>
            <Building2 className="w-12 h-12 text-cyan-500" />
          </div>
        </div>
      </div>

      {/* Customers by Branch */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Clients par Branche</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Branche</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">En Attente</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Approuvés</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Rejetés</th>
              </tr>
            </thead>
            <tbody>
              {stats.customersByBranch.map((branch, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{branch.branch_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{branch.branch_code}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold">{branch.total_customers}</td>
                  <td className="px-4 py-3 text-sm text-center text-yellow-600">{branch.pending}</td>
                  <td className="px-4 py-3 text-sm text-center text-green-600">{branch.approved}</td>
                  <td className="px-4 py-3 text-sm text-center text-red-600">{branch.rejected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Products by Branch */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Produits par Branche</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Branche</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Code</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Produits</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Stock</th>
              </tr>
            </thead>
            <tbody>
              {stats.productsByBranch.map((branch, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{branch.branch_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{branch.branch_code}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold">{branch.total_products}</td>
                  <td className="px-4 py-3 text-sm text-center font-semibold">{branch.total_stock || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Activité Récente</h2>
        <div className="space-y-3">
          {stats.recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{activity.full_name}</p>
                <p className="text-sm text-gray-600">
                  {activity.branch_name} • Soumis par {activity.submitted_by}
                </p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                  ${activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                  ${activity.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                  ${activity.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                `}>
                  {activity.status === 'pending' && 'En Attente'}
                  {activity.status === 'approved' && 'Approuvé'}
                  {activity.status === 'rejected' && 'Rejeté'}
                </span>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(activity.submitted_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

