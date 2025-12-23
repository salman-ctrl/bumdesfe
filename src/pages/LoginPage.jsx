import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }

    if (!formData.password) {
      setError('Password tidak boleh kosong');
      return;
    }

    setLoading(true);

    try {
      await login(formData);
      // Success - navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login gagal. Periksa username dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title Card */}
        <div className="bg-white rounded-t-2xl shadow-xl p-8 text-center border-b-4 border-blue-600">
          <div className="mb-4">
            <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🏢</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-800">BUMDes</h1>
            <p className="text-sm text-gray-600 mt-1">Kepulauan Mentawai</p>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">
            Sistem Informasi Manajemen
          </h2>
        </div>

        {/* Login Form Card */}
        <div className="bg-white rounded-b-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">👤</span>
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Masukkan username"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">🔒</span>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Memproses...
                </>
              ) : (
                <>
                  <span className="mr-2">🔓</span>
                  Masuk
                </>
              )}
            </button>
          </form>

          {/* Demo Credentials Info */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800 font-semibold mb-2">
              📝 Demo Credentials:
            </p>
            <div className="text-xs text-blue-700 space-y-1">
              <p>👑 <strong>Admin:</strong> admin / admin123</p>
              <p>👔 <strong>Pengurus:</strong> pengurus1 / pengurus123</p>
              <p>👤 <strong>Karyawan:</strong> karyawan1 / karyawan123</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>© 2024 BUMDes Kepulauan Mentawai</p>
          <p className="text-xs mt-1">Developed by Inka Taruni Sastra (22346008)</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;