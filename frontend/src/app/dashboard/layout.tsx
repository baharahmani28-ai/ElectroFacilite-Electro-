'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, getUser, logout } from '@/lib/utils';
import { LayoutDashboard, Users, FileText, Package, LogOut, Menu, X, Upload, Bell, CheckCircle, Building2 } from 'lucide-react';
import Link from 'next/link';
import { notificationsAPI } from '@/lib/notificationsApi';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else {
      setUser(getUser());
    }
  }, [router]);

  useEffect(() => {
    if (user) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const data = await notificationsAPI.getUnreadCount();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (!user) return null;

  const menuItems = [
    { icon: LayoutDashboard, label: user.role === 'admin' ? 'Tableau de Bord Admin' : 'Tableau de Bord', href: user.role === 'admin' ? '/dashboard/admin' : '/dashboard', roles: ['admin', 'pos'] },
    { icon: Users, label: 'Mes Clients', href: '/dashboard/clients', roles: ['pos'] },
    { icon: FileText, label: user.role === 'admin' ? 'Tous les Dossiers' : 'Mes Dossiers', href: '/dashboard/dossiers', roles: ['admin', 'pos'] },
    { icon: Bell, label: 'Notifications', href: '/dashboard/notifications', roles: ['pos'] },
    // Admin only items
    { icon: Package, label: 'Produits', href: '/dashboard/products', roles: ['admin'] },
    { icon: Building2, label: 'Branches', href: '/dashboard/branches', roles: ['admin'] },
    { icon: Upload, label: 'Import Excel', href: '/dashboard/import', roles: ['admin'] },
    { icon: CheckCircle, label: 'Demandes en Attente', href: '/dashboard/admin', roles: ['admin'] },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white shadow-lg transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden z-50`}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.jpg" 
                alt="Facilite ELECTRO" 
                className="w-28 h-28 object-cover rounded-lg"
              />
              <div>
                <h2 className="text-lg font-bold text-gray-800">Facilite ELECTRO</h2>
                <p className="text-xs text-gray-500">Paiements Échelonnés</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-semibold text-gray-800">{user.full_name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <span
              className={`inline-block mt-2 px-2 py-1 text-xs rounded ${
                user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {user.role === 'admin' ? 'Admin' : 'POS'}
            </span>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {menuItems
              .filter((item) => item.roles.includes(user.role))
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center justify-between space-x-3 px-4 py-3 rounded-lg hover:bg-primary hover:text-white transition-colors text-gray-700"
                >
                  <div className="flex items-center space-x-3">
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </div>
                  {item.label === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
          </nav>

          {/* Logout */}
          <button
            onClick={logout}
            className="mt-8 w-full flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/notifications" className="relative">
                <Bell size={24} className="text-gray-600 hover:text-primary cursor-pointer" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <img 
                src="/logo.jpg" 
                alt="Fcilite Electro" 
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="text-sm text-gray-600">
                Welcome back, <span className="font-semibold">{user.full_name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}

