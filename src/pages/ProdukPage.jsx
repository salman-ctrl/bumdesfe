import { useState, useEffect } from 'react';
import api from '../api/api';
import { formatCurrency, formatNumber, getKategoriName } from '../utils/helpers';

const ProdukPage = () => {
  // State management
  const [produk, setProduk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduk, setSelectedProduk] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [searching, setSearching] = useState(false);
  const [formData, setFormData] = useState({
    nama_produk: '',
    kategori: 'pertanian',
    satuan: '',
    harga_beli: '',
    harga_jual: '',
    stok: '',
    stok_minimum: '',
    deskripsi: ''
  });
  const [stockData, setStockData] = useState({
    jumlah: '',
    tipe: 'tambah'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProduk();
  }, []);

  const fetchProduk = async () => {
    setLoading(true);
    try {
      const response = await api.produk.getAll();
      setProduk(response.data);
    } catch (err) {
      console.error('Error fetching produk:', err);
      setError('Gagal memuat data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchProduk();
      return;
    }

    setSearching(true);
    try {
      const response = await api.produk.search(searchKeyword);
      setProduk(response.data);
    } catch (err) {
      console.error('Error searching produk:', err);
      setError('Gagal mencari data produk');
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchKeyword('');
    setCategoryFilter('');
    fetchProduk();
  };

  const handleCategoryFilter = async (kategori) => {
    setCategoryFilter(kategori);
    
    if (!kategori) {
      fetchProduk();
      return;
    }

    setLoading(true);
    try {
      const response = await api.produk.getByCategory(kategori);
      setProduk(response.data);
    } catch (err) {
      console.error('Error filtering produk:', err);
      setError('Gagal memfilter data produk');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      // Edit mode
      setEditMode(true);
      setSelectedProduk(product);
      setFormData({
        nama_produk: product.nama_produk,
        kategori: product.kategori,
        satuan: product.satuan,
        harga_beli: product.harga_beli,
        harga_jual: product.harga_jual,
        stok: product.stok,
        stok_minimum: product.stok_minimum,
        deskripsi: product.deskripsi || ''
      });
    } else {
      // Create mode
      setEditMode(false);
      setSelectedProduk(null);
      setFormData({
        nama_produk: '',
        kategori: 'pertanian',
        satuan: '',
        harga_beli: '',
        harga_jual: '',
        stok: '',
        stok_minimum: '',
        deskripsi: ''
      });
    }
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleOpenStockModal = (product) => {
    setSelectedProduk(product);
    setStockData({
      jumlah: '',
      tipe: 'tambah'
    });
    setError('');
    setSuccess('');
    setShowStockModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowStockModal(false);
    setEditMode(false);
    setSelectedProduk(null);
    setError('');
    setSuccess('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleStockChange = (e) => {
    const { name, value } = e.target;
    setStockData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.nama_produk.trim()) {
      setError('Nama produk tidak boleh kosong');
      return;
    }

    if (!formData.satuan.trim()) {
      setError('Satuan tidak boleh kosong');
      return;
    }

    if (!formData.harga_beli || formData.harga_beli <= 0) {
      setError('Harga beli harus lebih dari 0');
      return;
    }

    if (!formData.harga_jual || formData.harga_jual <= 0) {
      setError('Harga jual harus lebih dari 0');
      return;
    }

    if (parseFloat(formData.harga_jual) < parseFloat(formData.harga_beli)) {
      setError('Harga jual tidak boleh lebih rendah dari harga beli');
      return;
    }

    try {
      if (editMode) {
        // Update produk
        await api.produk.update(selectedProduk.id, formData);
        setSuccess('Data produk berhasil diperbarui');
      } else {
        // Create new produk
        await api.produk.create(formData);
        setSuccess('Produk baru berhasil ditambahkan');
      }

      // Refresh list and close modal after 1 second
      setTimeout(() => {
        fetchProduk();
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error('Error saving produk:', err);
      setError(err.message || 'Gagal menyimpan data produk');
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!stockData.jumlah || stockData.jumlah <= 0) {
      setError('Jumlah harus lebih dari 0');
      return;
    }

    try {
      const jumlah = stockData.tipe === 'tambah' 
        ? parseInt(stockData.jumlah) 
        : -parseInt(stockData.jumlah);
      
      await api.produk.updateStock(selectedProduk.id, jumlah);
      setSuccess(`Stok berhasil ${stockData.tipe === 'tambah' ? 'ditambah' : 'dikurangi'}`);

      // Refresh list and close modal after 1 second
      setTimeout(() => {
        fetchProduk();
        handleCloseModal();
      }, 1000);

    } catch (err) {
      console.error('Error updating stock:', err);
      setError(err.message || 'Gagal memperbarui stok');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
      return;
    }

    try {
      await api.produk.delete(id);
      setSuccess('Produk berhasil dihapus');
      fetchProduk();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting produk:', err);
      setError(err.message || 'Gagal menghapus produk');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Calculate profit margin
  const calculateMargin = (hargaJual, hargaBeli) => {
    if (!hargaJual || !hargaBeli) return 0;
    const margin = ((hargaJual - hargaBeli) / hargaBeli) * 100;
    return margin.toFixed(1);
  };

  // Loading state
  if (loading && !searching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Manajemen Produk</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola inventori produk BUMDes</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 font-medium w-full md:w-auto justify-center"
        >
          <span className="text-xl">➕</span>
          Tambah Produk
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

      {error && !showModal && !showStockModal && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
          <p className="text-red-700 flex items-center">
            <span className="mr-2">⚠️</span>
            {error}
          </p>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Cari produk berdasarkan nama..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Kategori</option>
            <option value="pertanian">Pertanian</option>
            <option value="perikanan">Perikanan</option>
            <option value="olahan">Olahan</option>
            <option value="kebutuhan_pokok">Kebutuhan Pokok</option>
          </select>
          <button
            onClick={handleSearch}
            disabled={searching}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400"
          >
            {searching ? 'Mencari...' : 'Cari'}
          </button>
          {(searchKeyword || categoryFilter) && (
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Produk</p>
              <p className="text-2xl font-bold text-gray-800">{produk.length}</p>
            </div>
            <span className="text-4xl">📦</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stok Aman</p>
              <p className="text-2xl font-bold text-gray-800">
                {produk.filter(p => p.stok >= p.stok_minimum).length}
              </p>
            </div>
            <span className="text-4xl">✅</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Stok Menipis</p>
              <p className="text-2xl font-bold text-gray-800">
                {produk.filter(p => p.stok < p.stok_minimum).length}
              </p>
            </div>
            <span className="text-4xl">⚠️</span>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Nilai Stok</p>
              <p className="text-lg font-bold text-gray-800">
                {formatCurrency(produk.reduce((sum, p) => sum + (p.stok * p.harga_beli), 0))}
              </p>
            </div>
            <span className="text-4xl">💰</span>
          </div>
        </div>
      </div>

      {/* Produk Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Nama Produk
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Stok
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Harga Beli
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Harga Jual
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Margin
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {produk.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchKeyword || categoryFilter ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data produk'}
                  </td>
                </tr>
              ) : (
                produk.map((product) => (
                  <tr key={product.id} className={`hover:bg-gray-50 transition ${
                    product.stok < product.stok_minimum ? 'bg-red-50' : ''
                  }`}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-800">{product.nama_produk}</p>
                        {product.deskripsi && (
                          <p className="text-xs text-gray-500 truncate max-w-xs">{product.deskripsi}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {getKategoriName(product.kategori)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div>
                        <p className={`font-bold ${
                          product.stok < product.stok_minimum ? 'text-red-600' : 'text-gray-800'
                        }`}>
                          {formatNumber(product.stok)} {product.satuan}
                        </p>
                        <p className="text-xs text-gray-500">Min: {product.stok_minimum}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-700">
                      {formatCurrency(product.harga_beli)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-800">
                      {formatCurrency(product.harga_jual)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        +{calculateMargin(product.harga_jual, product.harga_beli)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenStockModal(product)}
                          className="text-yellow-600 hover:text-yellow-800 px-3 py-1 rounded hover:bg-yellow-50 transition"
                          title="Kelola Stok"
                        >
                          📊
                        </button>
                        <button
                          onClick={() => handleOpenModal(product)}
                          className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
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

      {/* Modal Form Produk */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-bold text-gray-800">
                {editMode ? '✏️ Edit Produk' : '➕ Tambah Produk Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

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
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Produk <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama_produk"
                    value={formData.nama_produk}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nama produk"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kategori"
                    value={formData.kategori}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="pertanian">Pertanian</option>
                    <option value="perikanan">Perikanan</option>
                    <option value="olahan">Olahan</option>
                    <option value="kebutuhan_pokok">Kebutuhan Pokok</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Satuan <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="satuan"
                    value={formData.satuan}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="kg, pcs, liter, dll"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Beli <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="harga_beli"
                    value={formData.harga_beli}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Jual <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="harga_jual"
                    value={formData.harga_jual}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Awal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stok"
                    value={formData.stok}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stok Minimum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="stok_minimum"
                    value={formData.stok_minimum}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">Alert jika stok di bawah nilai ini</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Deskripsi produk (opsional)"
                  />
                </div>
              </div>

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
                  {editMode ? '💾 Simpan Perubahan' : '➕ Tambah Produk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Kelola Stok */}
      {showStockModal && selectedProduk && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">
                📊 Kelola Stok
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600 mb-1">Produk:</p>
                <p className="font-bold text-gray-800">{selectedProduk.nama_produk}</p>
                <p className="text-sm text-gray-600 mt-2">Stok Saat Ini:</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(selectedProduk.stok)} {selectedProduk.satuan}
                </p>
              </div>

              <form onSubmit={handleStockSubmit}>
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

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Perubahan
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tipe"
                        value="tambah"
                        checked={stockData.tipe === 'tambah'}
                        onChange={handleStockChange}
                        className="mr-2"
                      />
                      <span className="text-sm">➕ Tambah Stok</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="tipe"
                        value="kurangi"
                        checked={stockData.tipe === 'kurangi'}
                        onChange={handleStockChange}
                        className="mr-2"
                      />
                      <span className="text-sm">➖ Kurangi Stok</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="jumlah"
                    value={stockData.jumlah}
                    onChange={handleStockChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0"
                    min="1"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`px-6 py-2 text-white rounded-lg transition ${
                      stockData.tipe === 'tambah'
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {stockData.tipe === 'tambah' ? '➕ Tambah' : '➖ Kurangi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdukPage;