import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { formatDate, getRoleName, getDivisiName } from '../utils/helpers';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  
  // State management
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    nama_lengkap: '',
    email: '',
    no_hp: '',
    role: 'karyawan',
    divisi: 'perdagangan',
    status: 'aktif'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.users.getAll();
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Gagal memuat data pengguna');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      // Edit mode
      setEditMode(true);
      setSelectedUser(user);
      setFormData({
        username: user.username,
        password: '', // Don't show password
        nama_lengkap: user.nama_lengkap,
        email: user.email || '',
        no_hp: user.no_hp || '',
        role: user.role,
        divisi: user.divisi,
        status: user.status
      });
    } else {
      // Create mode
      setEditMode(false);
      setSelectedUser(null);
      setFormData({
        username: '',
        password: '',
        nama_lengkap: '',
        email: '',
        no_hp: '',
        role: 'karyawan',
        divisi: 'perdagangan',
        status: 'aktif'
      });
    }
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedUser(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.username.trim()) {
      setError('Username tidak boleh kosong');
      return;
    }

    if (!editMode && !formData.password) {
      setError('Password tidak boleh kosong');
      return;
    }

    if (!formData.nama_lengkap.trim()) {
      setError('Nama lengkap tidak boleh kosong');
      return;
    }

    try {
      if (editMode) {
        // Update user
        const updateData = { ...formData };
        // Remove password if empty (don't update password)
        if (!updateData.password) {
          delete updateData.password;
        }
        delete updateData.username; // Can't update username
        
        await api.users.update(selectedUser.id, updateData);
        setSuccess('Data pengguna berhasil diperbarui');
      } else {
        // Create new user
        await api.users.create(formData);
        setSuccess('Pengguna baru berhasil ditambahkan');
      }

      // Refresh list and close modal after 1 second
      setTimeout(() => {
        fetchUsers();
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.message || 'Gagal menyimpan data pengguna');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      return;
    }

    try {
      await api.users.delete(id);
      setSuccess('Pengguna berhasil dihapus');
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.message || 'Gagal menghapus pengguna');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengguna</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola akun pengguna sistem BUMDes</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium"
        >
          <span className="text-xl">➕</span>
          Tambah Pengguna
        </button>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
          <p className="text-green-700 flex items-center">
            <span className="mr-2">✅</span>
            {success}
          </p>
        </div>
      )}

      {error && !showModal && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-red-700 flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  No. HP
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Divisi
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                    Belum ada data pengguna
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm">👤</span>
                        </div>
                        <span className="font-medium text-gray-800">{user.username}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{user.nama_lengkap}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email || '-'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.no_hp || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        user.role === 'pengurus' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {getRoleName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm capitalize">
                      {getDivisiName(user.divisi)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        user.status === 'aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(user)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        {currentUser.id !== user.id && (
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">
                {editMode ? '✏️ Edit Pengguna' : '➕ Tambah Pengguna Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-4">
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    disabled={editMode}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                    placeholder="Username"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password {!editMode && <span className="text-red-500">*</span>}
                    {editMode && <span className="text-gray-500 text-xs">(Kosongkan jika tidak diubah)</span>}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={editMode ? "Biarkan kosong jika tidak diubah" : "Minimal 6 karakter"}
                  />
                </div>

                {/* Nama Lengkap */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nama lengkap"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="email@example.com"
                  />
                </div>

                {/* No HP */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    No. HP
                  </label>
                  <input
                    type="text"
                    name="no_hp"
                    value={formData.no_hp}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="admin">Administrator</option>
                    <option value="pengurus">Pengurus</option>
                    <option value="karyawan">Karyawan</option>
                    <option value="masyarakat">Masyarakat</option>
                  </select>
                </div>

                {/* Divisi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Divisi <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="divisi"
                    value={formData.divisi}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="perdagangan">Perdagangan</option>
                    <option value="simpan_pinjam">Simpan Pinjam</option>
                    <option value="pariwisata">Pariwisata</option>
                    <option value="produksi">Produksi</option>
                    <option value="administrasi">Administrasi</option>
                  </select>
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="aktif"
                        checked={formData.status === 'aktif'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Aktif</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value="nonaktif"
                        checked={formData.status === 'nonaktif'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Tidak Aktif</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editMode ? '💾 Simpan Perubahan' : '➕ Tambah Pengguna'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;