import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    if (confirm('Apakah Anda yakin ingin keluar?')) {
      logout();
      navigate('/login');
    }
  };

  // Check if current path matches menu item
  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Menu items configuration
  const menuItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: '📊',
      roles: ['admin', 'pengurus', 'karyawan']
    },
    {
      path: '/users',
      label: 'Pengguna',
      icon: '👤',
      roles: ['admin']
    },
    {
      path: '/anggota',
      label: 'Anggota',
      icon: '👥',
      roles: ['admin', 'pengurus', 'karyawan']
    },
    {
      path: '/produk',
      label: 'Produk',
      icon: '📦',
      roles: ['admin', 'pengurus', 'karyawan'],
      divisi: ['perdagangan', 'administrasi']
    },
    {
      path: '/penjualan',
      label: 'Penjualan',
      icon: '🛒',
      roles: ['admin', 'pengurus', 'karyawan'],
      divisi: ['perdagangan', 'administrasi']
    },
    {
      path: '/pinjaman',
      label: 'Pinjaman',
      icon: '💰',
      roles: ['admin', 'pengurus', 'karyawan'],
      divisi: ['simpan_pinjam', 'administrasi']
    },
    {
      path: '/cicilan',
      label: 'Pembayaran Cicilan',
      icon: '💳',
      roles: ['admin', 'pengurus', 'karyawan'],
      divisi: ['simpan_pinjam', 'administrasi']
    },
    {
      path: '/keuangan',
      label: 'Keuangan',
      icon: '💵',
      roles: ['admin', 'pengurus'],
      divisi: ['administrasi']
    }
  ];

  // Filter menu items based on user role and division
  const visibleMenuItems = menuItems.filter(item => {
    // Check role
    if (!item.roles.includes(user?.role)) return false;
    
    // Admin can see everything
    if (user?.role === 'admin') return true;
    
    // Check division if specified
    if (item.divisi) {
      return item.divisi.includes(user?.divisi);
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-blue-900 text-white transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold">BUMDes</h1>
              <p className="text-xs text-blue-300">Kepulauan Mentawai</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-blue-800 rounded"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4">
          <ul className="space-y-2">
            {visibleMenuItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-800'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info at Bottom */}
        <div className="absolute bottom-0 w-full border-t border-blue-800 p-4">
          {sidebarOpen ? (
            <div className="mb-2">
              <p className="text-sm font-semibold">{user?.nama_lengkap}</p>
              <p className="text-xs text-blue-300 capitalize">{user?.role}</p>
              {user?.divisi && (
                <p className="text-xs text-blue-300 capitalize">
                  {user.divisi.replace('_', ' ')}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center mb-2">
              <span className="text-2xl">👤</span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors text-sm"
          >
            {sidebarOpen ? 'Keluar' : '🚪'}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => isActive(item.path))?.label || 'BUMDes Mentawai'}
              </h2>
              <p className="text-sm text-gray-600">
                Sistem Informasi Manajemen BUMDes
              </p>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-4">
              {/* Current Date */}
              <div className="text-right">
                <p className="text-sm text-gray-600">
                  {new Date().toLocaleDateString('id-ID', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date().toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* Profile Dropdown */}
              <div className="relative group">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <span className="text-xl">👤</span>
                  <span className="text-sm font-medium">{user?.username}</span>
                  <span className="text-xs">▼</span>
                </button>

                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                  >
                    👤 Profile Saya
                  </Link>
                  <Link
                    to="/change-password"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🔒 Ubah Password
                  </Link>
                  <hr className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-b-lg"
                  >
                    🚪 Keluar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center text-sm text-gray-600">
          <p>
            © 2025 BUMDes Kepulauan Mentawai - Sistem Informasi Manajemen
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Developed by Inka Taruni Sastra (22346008)
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;