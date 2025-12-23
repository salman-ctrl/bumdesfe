import { useState, useEffect } from 'react';
import api from '../api/api';
import { formatDate, validateNIK, validatePhone } from '../utils/helpers';

const AnggotaPage = () => {
  // State management
  const [anggota, setAnggota] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAnggota, setSelectedAnggota] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    nik: '',
    nama_lengkap: '',
    alamat: '',
    no_hp: '',
    status_keanggotaan: 'aktif'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAnggota();
  }, []);

  const fetchAnggota = async () => {
    setLoading(true);
    try {
      const response = await api.anggota.getAll();
      setAnggota(response.data);
    } catch (err) {
      console.error('Error fetching anggota:', err);
      setError('Gagal memuat data anggota');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchAnggota();
      return;
    }

    setSearching(true);
    try {
      const response = await api.anggota.search(searchKeyword);
      setAnggota(response.data);
    } catch (err) {
      console.error('Error searching anggota:', err);
      setError('Gagal mencari data anggota');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    fetchAnggota();
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      // Edit mode
      setEditMode(true);
      setSelectedAnggota(member);
      setFormData({
        nik: member.nik,
        nama_lengkap: member.nama_lengkap,
        alamat: member.alamat || '',
        no_hp: member.no_hp || '',
        status_keanggotaan: member.status_keanggotaan
      });
    } else {
      // Create mode
      setEditMode(false);
      setSelectedAnggota(null);
      setFormData({
        nik: '',
        nama_lengkap: '',
        alamat: '',
        no_hp: '',
        status_keanggotaan: 'aktif'
      });
    }
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setSelectedAnggota(null);
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
    if (!formData.nik.trim()) {
      setError('NIK tidak boleh kosong');
      return;
    }

    if (!validateNIK(formData.nik)) {
      setError('NIK harus 16 digit angka');
      return;
    }

    if (!formData.nama_lengkap.trim()) {
      setError('Nama lengkap tidak boleh kosong');
      return;
    }

    if (formData.no_hp && !validatePhone(formData.no_hp)) {
      setError('Format nomor HP tidak valid');
      return;
    }

    try {
      if (editMode) {
        // Update anggota
        await api.anggota.update(selectedAnggota.id, formData);
        setSuccess('Data anggota berhasil diperbarui');
      } else {
        // Create new anggota
        await api.anggota.create(formData);
        setSuccess('Anggota baru berhasil ditambahkan');
      }

      // Refresh list and close modal after 1 second
      setTimeout(() => {
        fetchAnggota();
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error('Error saving anggota:', err);
      setError(err.message || 'Gagal menyimpan data anggota');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus anggota ini?')) {
      return;
    }

    try {
      await api.anggota.delete(id);
      setSuccess('Anggota berhasil dihapus');
      fetchAnggota();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting anggota:', err);
      setError(err.message || 'Gagal menghapus anggota');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data anggota...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Data Anggota BUMDes</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola data anggota BUMDes Kepulauan Mentawai</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium w-full md:w-auto justify-center"
        >
          <span className="text-xl">➕</span>
          Tambah Anggota
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

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari berdasarkan nama, NIK, atau nomor HP..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {searching ? 'Mencari...' : 'Cari'}
          </button>
          {searchKeyword && (
            <button
              onClick={handleClearSearch}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Anggota</p>
              <p className="text-2xl font-bold text-gray-800">{anggota.length}</p>
            </div>
            <span className="text-4xl">👥</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Anggota Aktif</p>
              <p className="text-2xl font-bold text-gray-800">
                {anggota.filter(a => a.status_keanggotaan === 'aktif').length}
              </p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Anggota Tidak Aktif</p>
              <p className="text-2xl font-bold text-gray-800">
                {anggota.filter(a => a.status_keanggotaan === 'nonaktif').length}
              </p>
            </div>
            <span className="text-4xl">⏸️</span>
          </div>
        </div>
      </div>

      {/* Anggota Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  NIK
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Nama Lengkap
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Alamat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  No. HP
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
              {anggota.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                    {searchKeyword ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data anggota'}
                  </td>
                </tr>
              ) : (
                anggota.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm text-gray-700">{member.nik}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 text-sm">👤</span>
                        </div>
                        <span className="font-medium text-gray-800">{member.nama_lengkap}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm max-w-xs truncate">
                      {member.alamat || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {member.no_hp || '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 text-xs rounded-full ${
                        member.status_keanggotaan === 'aktif'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {member.status_keanggotaan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(member.id)}
                          className="text-red-600 hover:text-red-800 px-3 py-1 rounded hover:bg-red-50 transition"
                          title="Hapus"
                        >
                          🗑️
                        </button>
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
                {editMode ? '✏️ Edit Anggota' : '➕ Tambah Anggota Baru'}
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

              <div className="space-y-4">
                {/* NIK */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIK (16 Digit) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nik"
                    value={formData.nik}
                    onChange={handleChange}
                    maxLength="16"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    placeholder="1371010101850001"
                  />
                  <p className="text-xs text-gray-500 mt-1">Masukkan 16 digit NIK KTP</p>
                </div>

                {/* Nama Lengkap */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_lengkap"
                    value={formData.nama_lengkap}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nama lengkap sesuai KTP"
                  />
                </div>

                {/* Alamat */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    name="alamat"
                    value={formData.alamat}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Alamat lengkap (Desa, Kecamatan)"
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
                  <p className="text-xs text-gray-500 mt-1">Format: 08xxxxxxxxxx atau 62xxxxxxxxxx</p>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status Keanggotaan
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status_keanggotaan"
                        value="aktif"
                        checked={formData.status_keanggotaan === 'aktif'}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="text-sm">Aktif</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="status_keanggotaan"
                        value="nonaktif"
                        checked={formData.status_keanggotaan === 'nonaktif'}
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
                  {editMode ? '💾 Simpan Perubahan' : '➕ Tambah Anggota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnggotaPage;