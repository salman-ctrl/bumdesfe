import axios from './axios';

/**
 * API Service - All backend endpoints in one place
 * Organized by module for easy access and maintenance
 */
const api = {
  // ============================================
  // AUTHENTICATION ENDPOINTS
  // ============================================
  auth: {
    /**
     * Login user and get JWT token
     * @param {Object} credentials - { username, password }
     * @returns {Promise} - { user, token }
     */
    login: (credentials) => axios.post('/auth/login', credentials),

    /**
     * Register new user account
     * @param {Object} userData - { username, password, nama_lengkap, email, no_hp, role, divisi }
     * @returns {Promise} - { id }
     */
    register: (userData) => axios.post('/auth/register', userData),

    /**
     * Get current logged-in user profile
     * @returns {Promise} - User profile data
     */
    profile: () => axios.get('/auth/profile'),

    /**
     * Change user password
     * @param {Object} passwords - { old_password, new_password }
     * @returns {Promise}
     */
    changePassword: (passwords) => axios.put('/auth/change-password', passwords)
  },

  // ============================================
  // USER MANAGEMENT ENDPOINTS
  // ============================================
  users: {
    /**
     * Get all users (admin/pengurus only)
     * @returns {Promise} - Array of users
     */
    getAll: () => axios.get('/users'),

    /**
     * Get user by ID
     * @param {Number} id - User ID
     * @returns {Promise} - User data
     */
    getById: (id) => axios.get(`/users/${id}`),

    /**
     * Create new user (admin only)
     * @param {Object} userData - User data
     * @returns {Promise} - { id }
     */
    create: (userData) => axios.post('/users', userData),

    /**
     * Update user data (admin only)
     * @param {Number} id - User ID
     * @param {Object} userData - Updated user data
     * @returns {Promise}
     */
    update: (id, userData) => axios.put(`/users/${id}`, userData),

    /**
     * Delete user (admin only)
     * @param {Number} id - User ID
     * @returns {Promise}
     */
    delete: (id) => axios.delete(`/users/${id}`)
  },

  // ============================================
  // MEMBER (ANGGOTA) ENDPOINTS
  // ============================================
  anggota: {
    /**
     * Get all members
     * @returns {Promise} - Array of members
     */
    getAll: () => axios.get('/anggota'),

    /**
     * Get member by ID
     * @param {Number} id - Member ID
     * @returns {Promise} - Member data
     */
    getById: (id) => axios.get(`/anggota/${id}`),

    /**
     * Search members by keyword (name/NIK/phone)
     * @param {String} keyword - Search keyword
     * @returns {Promise} - Array of matching members
     */
    search: (keyword) => axios.get(`/anggota/search?keyword=${encodeURIComponent(keyword)}`),

    /**
     * Create new member
     * @param {Object} memberData - { nik, nama_lengkap, alamat, no_hp, status_keanggotaan }
     * @returns {Promise} - { id }
     */
    create: (memberData) => axios.post('/anggota', memberData),

    /**
     * Update member data
     * @param {Number} id - Member ID
     * @param {Object} memberData - Updated member data
     * @returns {Promise}
     */
    update: (id, memberData) => axios.put(`/anggota/${id}`, memberData),

    /**
     * Delete member (admin/pengurus only)
     * @param {Number} id - Member ID
     * @returns {Promise}
     */
    delete: (id) => axios.delete(`/anggota/${id}`)
  },

  // ============================================
  // PRODUCT (PRODUK) ENDPOINTS
  // ============================================
  produk: {
    /**
     * Get all products
     * @returns {Promise} - Array of products
     */
    getAll: () => axios.get('/produk'),

    /**
     * Get product by ID
     * @param {Number} id - Product ID
     * @returns {Promise} - Product data
     */
    getById: (id) => axios.get(`/produk/${id}`),

    /**
     * Search products by keyword (name/category)
     * @param {String} keyword - Search keyword
     * @returns {Promise} - Array of matching products
     */
    search: (keyword) => axios.get(`/produk/search?keyword=${encodeURIComponent(keyword)}`),

    /**
     * Get products with low stock (below minimum)
     * @returns {Promise} - Array of low stock products
     */
    getLowStock: () => axios.get('/produk/stok-minimum'),

    /**
     * Get products by category
     * @param {String} kategori - pertanian | perikanan | olahan | kebutuhan_pokok
     * @returns {Promise} - Array of products in category
     */
    getByCategory: (kategori) => axios.get(`/produk/kategori/${kategori}`),

    /**
     * Create new product
     * @param {Object} productData - Product data
     * @returns {Promise} - { id }
     */
    create: (productData) => axios.post('/produk', productData),

    /**
     * Update product data
     * @param {Number} id - Product ID
     * @param {Object} productData - Updated product data
     * @returns {Promise}
     */
    update: (id, productData) => axios.put(`/produk/${id}`, productData),

    /**
     * Update product stock only (add/subtract)
     * @param {Number} id - Product ID
     * @param {Number} jumlah - Amount to add (positive) or subtract (negative)
     * @returns {Promise}
     */
    updateStock: (id, jumlah) => axios.patch(`/produk/${id}/stok`, { jumlah }),

    /**
     * Delete product (admin/pengurus only)
     * @param {Number} id - Product ID
     * @returns {Promise}
     */
    delete: (id) => axios.delete(`/produk/${id}`)
  },

  // ============================================
  // SALES (PENJUALAN) ENDPOINTS
  // ============================================
  penjualan: {
    /**
     * Get all sales transactions with optional date filter
     * @param {Object} params - { start_date, end_date } (optional)
     * @returns {Promise} - Array of sales transactions
     */
    getAll: (params = {}) => axios.get('/penjualan', { params }),

    /**
     * Get sales transaction detail with items
     * @param {Number} id - Transaction ID
     * @returns {Promise} - Transaction data with items array
     */
    getById: (id) => axios.get(`/penjualan/${id}`),

    /**
     * Generate next transaction number
     * @returns {Promise} - { no_transaksi: "TRX-YYYYMMDD-XXXX" }
     */
    generateNo: () => axios.get('/penjualan/generate-no'),

    /**
     * Create new sales transaction
     * @param {Object} salesData - { tanggal, anggota_id, items: [{ produk_id, jumlah, harga_satuan }] }
     * @returns {Promise} - { id, no_transaksi }
     */
    create: (salesData) => axios.post('/penjualan', salesData),

    /**
     * Delete sales transaction (admin/pengurus only)
     * Stock will be returned automatically
     * @param {Number} id - Transaction ID
     * @returns {Promise}
     */
    delete: (id) => axios.delete(`/penjualan/${id}`)
  },

  // ============================================
  // LOAN (PINJAMAN) ENDPOINTS
  // ============================================
  pinjaman: {
    /**
     * Get all loans with optional status filter
     * @param {Object} params - { status: "berjalan" | "lunas" | "menunggak" } (optional)
     * @returns {Promise} - Array of loans
     */
    getAll: (params = {}) => axios.get('/pinjaman', { params }),

    /**
     * Get loan detail by ID
     * @param {Number} id - Loan ID
     * @returns {Promise} - Loan data
     */
    getById: (id) => axios.get(`/pinjaman/${id}`),

    /**
     * Get all loans by member ID
     * @param {Number} anggotaId - Member ID
     * @returns {Promise} - Array of member's loans
     */
    getByAnggota: (anggotaId) => axios.get(`/pinjaman/anggota/${anggotaId}`),

    /**
     * Generate next loan number
     * @returns {Promise} - { no_pinjaman: "PJM-YYYY-XXXX" }
     */
    generateNo: () => axios.get('/pinjaman/generate-no'),

    /**
     * Create new loan
     * @param {Object} loanData - { anggota_id, tanggal_pinjaman, jumlah_pinjaman, bunga_persen, lama_cicilan }
     * @returns {Promise} - { id, no_pinjaman }
     */
    create: (loanData) => axios.post('/pinjaman', loanData),

    /**
     * Update loan data (interest rate, duration, status)
     * @param {Number} id - Loan ID
     * @param {Object} loanData - Updated loan data
     * @returns {Promise}
     */
    update: (id, loanData) => axios.put(`/pinjaman/${id}`, loanData),

    /**
     * Delete loan (admin/pengurus only, only if no payments yet)
     * @param {Number} id - Loan ID
     * @returns {Promise}
     */
    delete: (id) => axios.delete(`/pinjaman/${id}`)
  },

  // ============================================
  // INSTALLMENT (CICILAN) ENDPOINTS
  // ============================================
  cicilan: {
    /**
     * Get all installment payments for a loan
     * @param {Number} pinjamanId - Loan ID
     * @returns {Promise} - Array of installment payments
     */
    getByPinjaman: (pinjamanId) => axios.get(`/cicilan/pinjaman/${pinjamanId}`),

    /**
     * Get next installment number for a loan
     * @param {Number} pinjamanId - Loan ID
     * @returns {Promise} - { cicilan_ke: number }
     */
    getNextCicilan: (pinjamanId) => axios.get(`/cicilan/pinjaman/${pinjamanId}/next-cicilan`),

    /**
     * Get installment payment detail by ID
     * @param {Number} id - Installment ID
     * @returns {Promise} - Payment detail
     */
    getById: (id) => axios.get(`/cicilan/${id}`),

    /**
     * Record new installment payment
     * @param {Object} paymentData - { pinjaman_id, tanggal_bayar, jumlah_bayar, denda, keterangan }
     * @returns {Promise} - { id }
     */
    create: (paymentData) => axios.post('/cicilan', paymentData),

    /**
     * Update installment payment
     * @param {Number} id - Installment ID
     * @param {Object} paymentData - Updated payment data
     * @returns {Promise}
     */
    update: (id, paymentData) => axios.put(`/cicilan/${id}`, paymentData),

    /**
     * Delete installment payment (admin/pengurus only)
     * Loan balance will be restored
     * @param {Number} id - Installment ID
     * @returns {Promise}
     */
    delete: (id) => axios.delete(`/cicilan/${id}`)
  },

  // ============================================
  // FINANCIAL (KEUANGAN) ENDPOINTS
  // ============================================
  keuangan: {
    /**
     * Get all financial transactions with optional filters
     * @param {Object} params - { start_date, end_date, jenis } (optional)
     * @returns {Promise} - Array of financial transactions
     */
    getAll: (params = {}) => axios.get('/keuangan', { params }),

    /**
     * Get financial transaction detail by ID
     * @param {Number} id - Transaction ID
     * @returns {Promise} - Transaction data
     */
    getById: (id) => axios.get(`/keuangan/${id}`),

    /**
     * Get financial summary (total income, expense, balance)
     * @param {Object} params - { start_date, end_date } (optional)
     * @returns {Promise} - { pemasukan, pengeluaran, saldo }
     */
    getSummary: (params = {}) => axios.get('/keuangan/summary', { params }),

    /**
     * Get financial data grouped by category
     * @param {Object} params - { start_date, end_date } (optional)
     * @returns {Promise} - Array of { jenis, kategori, total }
     */
    getByCategory: (params = {}) => axios.get('/keuangan/kategori', { params }),

    /**
     * Create manual financial transaction
     * @param {Object} transactionData - { tanggal, jenis, kategori, keterangan, jumlah }
     * @returns {Promise} - { id }
     */
    create: (transactionData) => axios.post('/keuangan', transactionData),

    /**
     * Update manual financial transaction
     * @param {Number} id - Transaction ID
     * @param {Object} transactionData - Updated transaction data
     * @returns {Promise}
     */
    update: (id, transactionData) => axios.put(`/keuangan/${id}`, transactionData),

    /**
     * Delete manual financial transaction (admin/pengurus only)
     * Cannot delete auto-generated transactions
     * @param {Number} id - Transaction ID
     * @returns {Promise}
     */
    delete: (id) => axios.delete(`/keuangan/${id}`)
  }
};

export default api;