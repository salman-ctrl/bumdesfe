import { useState, useEffect } from 'react';
import api from '../api/api';
import { formatCurrency, formatDate, getTodayDate } from '../utils/helpers';

const PenjualanPage = () => {
  // State management
  const [view, setView] = useState('list'); // 'list' or 'create'
  const [penjualan, setPenjualan] = useState([]);
  const [produkList, setProdukList] = useState([]);
  const [anggotaList, setAnggotaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPenjualan, setSelectedPenjualan] = useState(null);
  
  // Filter state
  const [dateFilter, setDateFilter] = useState({
    start_date: '',
    end_date: ''
  });

  // Form state for creating new sale
  const [formData, setFormData] = useState({
    tanggal: getTodayDate(),
    anggota_id: '',
    items: []
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchPenjualan();
    fetchProdukList();
    fetchAnggotaList();
  }, []);

  const fetchPenjualan = async (filters = {}) => {
    setLoading(true);
    try {
      const response = await api.penjualan.getAll(filters);
      setPenjualan(response.data);
    } catch (err) {
      console.error('Error fetching penjualan:', err);
      setError('Gagal memuat data penjualan');
    } finally {
      setLoading(false);
    }
  };

  const fetchProdukList = async () => {
    try {
      const response = await api.produk.getAll();
      setProdukList(response.data);
    } catch (err) {
      console.error('Error fetching produk:', err);
    }
  };

  const fetchAnggotaList = async () => {
    try {
      const response = await api.anggota.getAll();
      setAnggotaList(response.data);
    } catch (err) {
      console.error('Error fetching anggota:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setDateFilter(prev => ({ ...prev, [name]: value }));
  };

  const handleApplyFilter = () => {
    const filters = {};
    if (dateFilter.start_date) filters.start_date = dateFilter.start_date;
    if (dateFilter.end_date) filters.end_date = dateFilter.end_date;
    fetchPenjualan(filters);
  };

  const handleClearFilter = () => {
    setDateFilter({ start_date: '', end_date: '' });
    fetchPenjualan();
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await api.penjualan.getById(id);
      setSelectedPenjualan(response.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching detail:', err);
      setError('Gagal memuat detail transaksi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Apakah Anda yakin ingin menghapus transaksi ini? Stok produk akan dikembalikan.')) {
      return;
    }

    try {
      await api.penjualan.delete(id);
      setSuccess('Transaksi berhasil dihapus');
      fetchPenjualan();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting penjualan:', err);
      setError(err.message || 'Gagal menghapus transaksi');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ============================================
  // CREATE FORM HANDLERS
  // ============================================

  const handleStartCreate = () => {
    setFormData({
      tanggal: getTodayDate(),
      anggota_id: '',
      items: [{ produk_id: '', jumlah: 1, harga_satuan: 0 }]
    });
    setError('');
    setSuccess('');
    setView('create');
  };

  const handleCancelCreate = () => {
    if (confirm('Batalkan transaksi? Data yang sudah diinput akan hilang.')) {
      setView('list');
      setFormData({ tanggal: getTodayDate(), anggota_id: '', items: [] });
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { produk_id: '', jumlah: 1, harga_satuan: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    // Auto-fill price when product selected
    if (field === 'produk_id') {
      const produk = produkList.find(p => p.id === parseInt(value));
      if (produk) {
        newItems[index].harga_satuan = produk.harga_jual;
      }
    }

    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => {
      return sum + (parseInt(item.jumlah || 0) * parseFloat(item.harga_satuan || 0));
    }, 0);
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    // Validation
    if (formData.items.length === 0) {
      setError('Minimal harus ada 1 item produk');
      setSaving(false);
      return;
    }

    for (let i = 0; i < formData.items.length; i++) {
      const item = formData.items[i];
      if (!item.produk_id) {
        setError(`Item ke-${i + 1}: Pilih produk terlebih dahulu`);
        setSaving(false);
        return;
      }
      if (!item.jumlah || item.jumlah <= 0) {
        setError(`Item ke-${i + 1}: Jumlah harus lebih dari 0`);
        setSaving(false);
        return;
      }

      // Check stock availability
      const produk = produkList.find(p => p.id === parseInt(item.produk_id));
      if (produk && parseInt(item.jumlah) > produk.stok) {
        setError(`Item ke-${i + 1}: Stok ${produk.nama_produk} tidak mencukupi (tersedia: ${produk.stok})`);
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        tanggal: formData.tanggal,
        anggota_id: formData.anggota_id || null,
        items: formData.items.map(item => ({
          produk_id: parseInt(item.produk_id),
          jumlah: parseInt(item.jumlah),
          harga_satuan: parseFloat(item.harga_satuan)
        }))
      };

      await api.penjualan.create(payload);
      setSuccess('Transaksi penjualan berhasil dibuat!');
      
      setTimeout(() => {
        setView('list');
        fetchPenjualan();
        fetchProdukList(); // Refresh product list for updated stock
        setSuccess('');
      }, 1500);

    } catch (err) {
      console.error('Error creating penjualan:', err);
      setError(err.message || 'Gagal membuat transaksi');
    } finally {
      setSaving(false);
    }
  };

  // ============================================
  // RENDER: LIST VIEW
  // ============================================

  if (view === 'list') {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data penjualan...</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Transaksi Penjualan</h1>
            <p className="text-gray-600 text-sm mt-1">Kelola transaksi penjualan produk</p>
          </div>
          <button
            onClick={handleStartCreate}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition flex items-center gap-2 font-medium w-full md:w-auto justify-center"
          >
            <span className="text-xl">🛒</span>
            Transaksi Baru
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

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-4">
            <p className="text-red-700 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </p>
          </div>
        )}

        {/* Filter Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Dari Tanggal</label>
              <input
                type="date"
                name="start_date"
                value={dateFilter.start_date}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                name="end_date"
                value={dateFilter.end_date}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 items-end">
              <button
                onClick={handleApplyFilter}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Filter
              </button>
              {(dateFilter.start_date || dateFilter.end_date) && (
                <button
                  onClick={handleClearFilter}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
       {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Transaksi</p>
                <p className="text-2xl font-bold text-gray-800">{penjualan.length}</p>
              </div>
              <span className="text-4xl">📝</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Penjualan</p>
                {/* PERBAIKAN DI SINI: Menambahkan parseFloat */}
                <p className="text-xl font-bold text-gray-800">
                  {formatCurrency(penjualan.reduce((sum, p) => sum + parseFloat(p.total_harga || 0), 0))}
                </p>
              </div>
              <span className="text-4xl">💰</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Transaksi Selesai</p>
                <p className="text-2xl font-bold text-gray-800">
                  {penjualan.filter(p => p.status === 'selesai').length}
                </p>
              </div>
              <span className="text-4xl">✅</span>
            </div>
          </div>
        </div>
        {/* Penjualan Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    No. Transaksi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Anggota
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                    Kasir
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
                {penjualan.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      Belum ada data transaksi penjualan
                    </td>
                  </tr>
                ) : (
                  penjualan.map((sale) => (
                    <tr key={sale.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-blue-600">
                          {sale.no_transaksi}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-700 text-sm">
                        {formatDate(sale.tanggal)}
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {sale.nama_anggota || 'Umum'}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">
                        {formatCurrency(sale.total_harga)}
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {sale.nama_kasir}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 text-xs rounded-full ${
                          sale.status === 'selesai'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sale.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(sale.id)}
                            className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded hover:bg-blue-50 transition"
                            title="Detail"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
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

        {/* Detail Modal */}
        {showDetailModal && selectedPenjualan && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="text-xl font-bold text-gray-800">
                  Detail Transaksi
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {/* Transaction Info */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600">No. Transaksi</p>
                      <p className="font-mono font-bold text-blue-600">{selectedPenjualan.no_transaksi}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Tanggal</p>
                      <p className="font-medium">{formatDate(selectedPenjualan.tanggal)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Anggota</p>
                      <p className="font-medium">{selectedPenjualan.nama_anggota || 'Umum'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Status</p>
                      <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                        selectedPenjualan.status === 'selesai'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {selectedPenjualan.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Item Produk</h4>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-gray-600">Produk</th>
                          <th className="px-4 py-2 text-center text-gray-600">Jumlah</th>
                          <th className="px-4 py-2 text-right text-gray-600">Harga Satuan</th>
                          <th className="px-4 py-2 text-right text-gray-600">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedPenjualan.items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-3">
                              <p className="font-medium">{item.nama_produk}</p>
                              <p className="text-xs text-gray-500">{item.satuan}</p>
                            </td>
                            <td className="px-4 py-3 text-center">{item.jumlah}</td>
                            <td className="px-4 py-3 text-right">{formatCurrency(item.harga_satuan)}</td>
                            <td className="px-4 py-3 text-right font-medium">{formatCurrency(item.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total */}
                <div className="border-t-2 border-gray-300 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">TOTAL PEMBAYARAN</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(selectedPenjualan.total_harga)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // RENDER: CREATE VIEW (POS)
  // ============================================

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🛒 Transaksi Penjualan Baru</h1>
          <p className="text-gray-600 text-sm mt-1">Point of Sale (POS)</p>
        </div>
        <button
          onClick={handleCancelCreate}
          className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition"
        >
          ← Kembali
        </button>
      </div>

      {/* Messages */}
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

      <form onSubmit={handleSubmitCreate}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Form Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Informasi Transaksi</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    value={formData.tanggal}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anggota (Opsional)
                  </label>
                  <select
                    name="anggota_id"
                    value={formData.anggota_id}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Umum / Non-Member</option>
                    {anggotaList.map(anggota => (
                      <option key={anggota.id} value={anggota.id}>
                        {anggota.nama_lengkap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-800">Item Produk</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition text-sm"
                >
                  ➕ Tambah Item
                </button>
              </div>

              <div className="space-y-3">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-12 gap-3 items-end">
                      <div className="col-span-5">
                        <label className="block text-xs text-gray-600 mb-1">Produk</label>
                        <select
                          value={item.produk_id}
                          onChange={(e) => handleItemChange(index, 'produk_id', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          required
                        >
                          <option value="">Pilih Produk</option>
                          {produkList.map(produk => (
                            <option key={produk.id} value={produk.id} disabled={produk.stok <= 0}>
                              {produk.nama_produk} (Stok: {produk.stok})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Jumlah</label>
                        <input
                          type="number"
                          value={item.jumlah}
                          onChange={(e) => handleItemChange(index, 'jumlah', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs text-gray-600 mb-1">Harga</label>
                        <input
                          type="number"
                          value={item.harga_satuan}
                          onChange={(e) => handleItemChange(index, 'harga_satuan', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                          min="0"
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="w-full px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm"
                          disabled={formData.items.length === 1}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-xs text-gray-600">Subtotal: </span>
                      <span className="font-bold text-blue-600">
                        {formatCurrency(item.jumlah * item.harga_satuan)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="font-semibold text-gray-800 mb-4">Ringkasan</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Jumlah Item:</span>
                  <span className="font-medium">{formData.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Produk:</span>
                  <span className="font-medium">
                    {formData.items.reduce((sum, item) => sum + parseInt(item.jumlah || 0), 0)}
                  </span>
                </div>
              </div>

              <div className="border-t-2 border-gray-300 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(calculateTotal())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">TOTAL:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(calculateTotal())}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving || formData.items.length === 0}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Memproses...
                  </>
                ) : (
                  <>💾 Simpan Transaksi</>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancelCreate}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition mt-2"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PenjualanPage;