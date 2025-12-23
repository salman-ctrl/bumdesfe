import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';

// Import pages (will be created later)
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import UsersPage from '../pages/UsersPage';
import AnggotaPage from '../pages/AnggotaPage';
import ProdukPage from '../pages/ProdukPage';
import PenjualanPage from '../pages/PenjualanPage';
import PinjamanPage from '../pages/PinjamanPage';
import CicilanPage from '../pages/CicilanPage';
import KeuanganPage from '../pages/KeuanganPage';

// ============================================
// PROTECTED ROUTE WRAPPER
// ============================================
const ProtectedRoute = ({ children, roles = [], divisi = [] }) => {
  const { user, loading } = useAuth();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.includes(user.role)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">Anda tidak memiliki akses ke halaman ini.</p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kembali
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check division-based access (admin bypass)
  if (divisi.length > 0 && user.role !== 'admin' && !divisi.includes(user.divisi)) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h2>
            <p className="text-gray-600">
              Halaman ini hanya untuk divisi {divisi.join(', ')}.
            </p>
            <button
              onClick={() => window.history.back()}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Kembali
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return children;
};

// ============================================
// PUBLIC ROUTE (Redirect if already logged in)
// ============================================
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to dashboard if already logged in
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// ============================================
// MAIN APP ROUTES
// ============================================
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      {/* Protected Routes with DashboardLayout */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={['admin', 'pengurus', 'karyawan']}>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* User Management - Admin Only */}
      <Route
        path="/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <DashboardLayout>
              <UsersPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Member Management - All roles except masyarakat */}
      <Route
        path="/anggota"
        element={
          <ProtectedRoute roles={['admin', 'pengurus', 'karyawan']}>
            <DashboardLayout>
              <AnggotaPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Product Management - Perdagangan & Administrasi */}
      <Route
        path="/produk"
        element={
          <ProtectedRoute
            roles={['admin', 'pengurus', 'karyawan']}
            divisi={['perdagangan', 'administrasi']}
          >
            <DashboardLayout>
              <ProdukPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Sales Management - Perdagangan & Administrasi */}
      <Route
        path="/penjualan"
        element={
          <ProtectedRoute
            roles={['admin', 'pengurus', 'karyawan']}
            divisi={['perdagangan', 'administrasi']}
          >
            <DashboardLayout>
              <PenjualanPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Loan Management - Simpan Pinjam & Administrasi */}
      <Route
        path="/pinjaman"
        element={
          <ProtectedRoute
            roles={['admin', 'pengurus', 'karyawan']}
            divisi={['simpan_pinjam', 'administrasi']}
          >
            <DashboardLayout>
              <PinjamanPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Installment Payment - Simpan Pinjam & Administrasi */}
      <Route
        path="/cicilan"
        element={
          <ProtectedRoute
            roles={['admin', 'pengurus', 'karyawan']}
            divisi={['simpan_pinjam', 'administrasi']}
          >
            <DashboardLayout>
              <CicilanPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Financial Management - Admin & Pengurus Only, Administrasi Division */}
      <Route
        path="/keuangan"
        element={
          <ProtectedRoute
            roles={['admin', 'pengurus']}
            divisi={['administrasi']}
          >
            <DashboardLayout>
              <KeuanganPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* 404 Not Found */}
      <Route
        path="*"
        element={
          <DashboardLayout>
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  404 - Halaman Tidak Ditemukan
                </h2>
                <p className="text-gray-600 mb-4">
                  Halaman yang Anda cari tidak ditemukan.
                </p>
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Kembali
                </button>
              </div>
            </div>
          </DashboardLayout>
        }
      />
    </Routes>
  );
};

export default AppRoutes;