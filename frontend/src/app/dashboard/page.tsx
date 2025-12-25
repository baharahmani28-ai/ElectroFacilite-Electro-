'use client';

import { useEffect, useState } from 'react';
import { filesAPI, customersAPI, branchesAPI } from '@/lib/api';
import { Users, FileText, TrendingUp, Clock, CheckCircle, XCircle, Upload, Settings, Building2, Package, BarChart3, Activity } from 'lucide-react';
import Link from 'next/link';
import { getUser } from '@/lib/utils';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [branches, setBranches] = useState<any[]>([]);
  const user = getUser();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const requests = [
        filesAPI.getStats(),
        customersAPI.getAll(),
      ];
      
      // Only fetch branches if user is admin
      if (user?.role === 'admin') {
        requests.push(branchesAPI.getAll());
      }
      
      const responses = await Promise.all(requests);
      const [fileStatsRes, customersRes, branchesRes] = responses;

      // Filter customers by status for branches
      const customers = customersRes.data || [];
      const pendingCustomers = customers.filter((c: any) => c.status === 'pending').length;
      const approvedCustomers = customers.filter((c: any) => c.status === 'approved').length;

      setStats({
        files: fileStatsRes.data || {},
        totalCustomers: customers.length,
        pendingCustomers,
        approvedCustomers,
      });
      
      if (branchesRes) {
        setBranches(branchesRes.data || []);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
      // Set default empty stats to prevent undefined errors
      setStats({
        files: { total: 0, under_review: 0, accepted: 0, rejected: 0, completed: 0 },
        totalCustomers: 0,
        pendingCustomers: 0,
        approvedCustomers: 0,
      });
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement du tableau de bord...</div>;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {isAdmin ? 'Tableau de Bord Admin' : 'Mon Tableau de Bord'}
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Clients - Only for branches */}
        {!isAdmin && (
          <Link href="/dashboard/clients">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <Users size={32} className="opacity-90" />
                <div className="bg-white/20 rounded-full px-3 py-1">
                  <TrendingUp size={16} />
                </div>
              </div>
              <p className="text-white/80 text-sm font-semibold mb-1">Total Clients</p>
              <h3 className="text-4xl font-bold">{stats?.totalCustomers || 0}</h3>
            </div>
          </Link>
        )}

        {/* Total Files */}
        <Link href="/dashboard/files">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <FileText size={32} className="opacity-90" />
              <div className="bg-white/20 rounded-full px-3 py-1">
                <BarChart3 size={16} />
              </div>
            </div>
            <p className="text-white/80 text-sm font-semibold mb-1">Dossiers de Financement</p>
            <h3 className="text-4xl font-bold">{stats?.files?.total || 0}</h3>
          </div>
        </Link>

        {/* Files Under Review */}
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <Clock size={32} className="opacity-90" />
            <div className="bg-white/20 rounded-full px-3 py-1">
              <Activity size={16} />
            </div>
          </div>
          <p className="text-white/80 text-sm font-semibold mb-1">En Révision</p>
          <h3 className="text-4xl font-bold">{stats?.files?.under_review || 0}</h3>
        </div>

        {/* Accepted Files */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={32} className="opacity-90" />
            <div className="bg-white/20 rounded-full px-3 py-1">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-white/80 text-sm font-semibold mb-1">Acceptés</p>
          <h3 className="text-4xl font-bold">{stats?.files?.accepted || 0}</h3>
        </div>

        {/* Rejected Files */}
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-4">
            <XCircle size={32} className="opacity-90" />
            <div className="bg-white/20 rounded-full px-3 py-1">
              <Settings size={16} />
            </div>
          </div>
          <p className="text-white/80 text-sm font-semibold mb-1">Rejetés</p>
          <h3 className="text-4xl font-bold">{stats?.files?.rejected || 0}</h3>
        </div>

        {/* Pending Customers - Only for branches */}
        {!isAdmin && (
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <Clock size={32} className="opacity-90" />
              <div className="bg-white/20 rounded-full px-3 py-1">
                <Activity size={16} />
              </div>
            </div>
            <p className="text-white/80 text-sm font-semibold mb-1">Clients en Attente</p>
            <h3 className="text-4xl font-bold">{stats?.pendingCustomers || 0}</h3>
          </div>
        )}

        {/* Products Link */}
        {!isAdmin && (
          <Link href="/dashboard/products">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-lg p-6 text-white hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <Package size={32} className="opacity-90" />
                <div className="bg-white/20 rounded-full px-3 py-1">
                  <Upload size={16} />
                </div>
              </div>
              <p className="text-white/80 text-sm font-semibold mb-1">Catalogue Produits</p>
              <h3 className="text-2xl font-bold">Gérer</h3>
            </div>
          </Link>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity className="text-indigo-600" size={24} />
          Actions Rapides
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {!isAdmin && (
            <>
              <Link href="/dashboard/clients">
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                  <Users size={20} />
                  Nouveau Client
                </button>
              </Link>
              <Link href="/dashboard/files">
                <button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                  <FileText size={20} />
                  Nouveau Dossier
                </button>
              </Link>
              <Link href="/dashboard/products">
                <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                  <Package size={20} />
                  Ajouter Produit
                </button>
              </Link>
            </>
          )}
          {isAdmin && (
            <Link href="/dashboard/branches">
              <button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                <Building2 size={20} />
                Gérer les Branches
              </button>
            </Link>
          )}
        </div>
      </div>

      {/* Branch Overview for Admin */}
      {isAdmin && branches.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Building2 className="text-indigo-600" size={24} />
                Vue d'ensemble des Branches
              </h3>
              <Link href="/dashboard/branches">
                <button className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1">
                  Gérer tout
                  <Activity size={16} />
                </button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch: any) => (
                <div
                  key={branch.id}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-indigo-100 p-2 rounded-lg">
                        <Building2 className="text-indigo-600" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">{branch.name}</h4>
                        <p className="text-xs text-gray-500">{branch.city}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      branch.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {branch.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        Clients
                      </span>
                      <span className="font-semibold text-gray-800">{branch.customer_count || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        Dossiers
                      </span>
                      <span className="font-semibold text-gray-800">{branch.file_count || 0}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-300">
                      <p className="text-xs text-gray-500">
                        <span className="font-semibold">Contact:</span> {branch.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


