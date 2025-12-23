/**
 * Utility Helper Functions
 * Contains reusable functions for formatting, validation, and calculations
 */

// ============================================
// FORMATTING FUNCTIONS
// ============================================

/**
 * Format number to Indonesian Rupiah currency
 * @param {Number} amount - Amount to format
 * @returns {String} - Formatted currency string (e.g., "Rp 12.000")
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return 'Rp 0';
  
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param {Number} num - Number to format
 * @returns {String} - Formatted number (e.g., "1.234.567")
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Format date to Indonesian format
 * @param {String|Date} date - Date to format
 * @param {Boolean} includeTime - Include time in format
 * @returns {String} - Formatted date (e.g., "21 Desember 2024")
 */
export const formatDate = (date, includeTime = false) => {
  if (!date) return '-';
  
  const dateObj = new Date(date);
  const options = {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  };
  
  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('id-ID', options);
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param {String|Date} date - Date to format
 * @returns {String} - Formatted date for input
 */
export const formatDateInput = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toISOString().split('T')[0];
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {String}
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Format phone number to Indonesian format
 * @param {String} phone - Phone number
 * @returns {String} - Formatted phone (e.g., "0821-8765-4321")
 */
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // Remove non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  // Format as 0XXX-XXXX-XXXX
  if (cleaned.length >= 10) {
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})/, '$1-$2-$3');
  }
  return phone;
};

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate Indonesian NIK (16 digits)
 * @param {String} nik - NIK to validate
 * @returns {Boolean}
 */
export const validateNIK = (nik) => {
  if (!nik) return false;
  const cleaned = nik.replace(/\D/g, '');
  return cleaned.length === 16;
};

/**
 * Validate email format
 * @param {String} email - Email to validate
 * @returns {Boolean}
 */
export const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate Indonesian phone number
 * @param {String} phone - Phone number to validate
 * @returns {Boolean}
 */
export const validatePhone = (phone) => {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  // Indonesian phone: 10-13 digits, starts with 0 or 62
  return /^(0|62)\d{9,12}$/.test(cleaned);
};

/**
 * Validate password strength
 * @param {String} password - Password to validate
 * @returns {Object} - { valid: Boolean, message: String }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: 'Password tidak boleh kosong' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter' };
  }
  
  return { valid: true, message: 'Password valid' };
};

/**
 * Check if form data is empty
 * @param {Object} data - Form data object
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object} - { valid: Boolean, message: String, field: String }
 */
export const validateRequired = (data, requiredFields) => {
  for (const field of requiredFields) {
    if (!data[field] || data[field].toString().trim() === '') {
      return {
        valid: false,
        message: `Field ${field} wajib diisi`,
        field
      };
    }
  }
  return { valid: true };
};

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate loan payment details
 * @param {Number} principal - Loan amount
 * @param {Number} interestRate - Interest rate in percentage
 * @param {Number} months - Loan duration in months
 * @returns {Object} - { interest, total, monthly }
 */
export const calculateLoan = (principal, interestRate, months) => {
  const interest = (principal * interestRate) / 100;
  const total = principal + interest;
  const monthly = Math.ceil(total / months);
  
  return {
    interest,
    total,
    monthly
  };
};

/**
 * Calculate loan due date (add months to date)
 * @param {String|Date} startDate - Loan start date
 * @param {Number} months - Duration in months
 * @returns {String} - Due date in YYYY-MM-DD format
 */
export const calculateDueDate = (startDate, months) => {
  const date = new Date(startDate);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().split('T')[0];
};

/**
 * Calculate sales total from items
 * @param {Array} items - Array of { jumlah, harga_satuan }
 * @returns {Number} - Total amount
 */
export const calculateSalesTotal = (items) => {
  if (!items || items.length === 0) return 0;
  
  return items.reduce((total, item) => {
    const subtotal = (item.jumlah || 0) * (item.harga_satuan || 0);
    return total + subtotal;
  }, 0);
};

/**
 * Calculate item subtotal
 * @param {Number} quantity - Quantity
 * @param {Number} price - Unit price
 * @returns {Number} - Subtotal
 */
export const calculateSubtotal = (quantity, price) => {
  return (quantity || 0) * (price || 0);
};

// ============================================
// STATUS & BADGE HELPERS
// ============================================

/**
 * Get badge color class based on status
 * @param {String} status - Status value
 * @returns {String} - Tailwind CSS classes
 */
export const getStatusColor = (status) => {
  const statusColors = {
    // General statuses
    'aktif': 'bg-green-100 text-green-800',
    'nonaktif': 'bg-gray-100 text-gray-800',
    'selesai': 'bg-blue-100 text-blue-800',
    'batal': 'bg-red-100 text-red-800',
    
    // Loan statuses
    'berjalan': 'bg-yellow-100 text-yellow-800',
    'lunas': 'bg-green-100 text-green-800',
    'menunggak': 'bg-red-100 text-red-800',
    
    // Transaction types
    'pemasukan': 'bg-green-100 text-green-800',
    'pengeluaran': 'bg-red-100 text-red-800'
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

/**
 * Get readable status text
 * @param {String} status - Status value
 * @returns {String} - Readable status
 */
export const getStatusText = (status) => {
  const statusTexts = {
    'aktif': 'Aktif',
    'nonaktif': 'Tidak Aktif',
    'selesai': 'Selesai',
    'batal': 'Dibatalkan',
    'berjalan': 'Berjalan',
    'lunas': 'Lunas',
    'menunggak': 'Menunggak',
    'pemasukan': 'Pemasukan',
    'pengeluaran': 'Pengeluaran'
  };
  
  return statusTexts[status] || status;
};

/**
 * Get role display name
 * @param {String} role - Role code
 * @returns {String} - Display name
 */
export const getRoleName = (role) => {
  const roleNames = {
    'admin': 'Administrator',
    'pengurus': 'Pengurus',
    'karyawan': 'Karyawan',
    'masyarakat': 'Masyarakat'
  };
  
  return roleNames[role] || role;
};

/**
 * Get division display name
 * @param {String} divisi - Division code
 * @returns {String} - Display name
 */
export const getDivisiName = (divisi) => {
  const divisiNames = {
    'perdagangan': 'Perdagangan',
    'simpan_pinjam': 'Simpan Pinjam',
    'pariwisata': 'Pariwisata',
    'produksi': 'Produksi',
    'administrasi': 'Administrasi'
  };
  
  return divisiNames[divisi] || divisi;
};

/**
 * Get category display name
 * @param {String} kategori - Category code
 * @returns {String} - Display name
 */
export const getKategoriName = (kategori) => {
  const kategoriNames = {
    'pertanian': 'Pertanian',
    'perikanan': 'Perikanan',
    'olahan': 'Olahan',
    'kebutuhan_pokok': 'Kebutuhan Pokok',
    'penjualan': 'Penjualan',
    'pinjaman': 'Pinjaman',
    'operasional': 'Operasional',
    'modal': 'Modal',
    'lainnya': 'Lainnya'
  };
  
  return kategoriNames[kategori] || kategori;
};

// ============================================
// DATA MANIPULATION HELPERS
// ============================================

/**
 * Sort array of objects by field
 * @param {Array} array - Array to sort
 * @param {String} field - Field name to sort by
 * @param {String} order - 'asc' or 'desc'
 * @returns {Array} - Sorted array
 */
export const sortBy = (array, field, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[field] > b[field] ? 1 : -1;
    } else {
      return a[field] < b[field] ? 1 : -1;
    }
  });
};

/**
 * Filter array by search keyword
 * @param {Array} array - Array to filter
 * @param {String} keyword - Search keyword
 * @param {Array} fields - Fields to search in
 * @returns {Array} - Filtered array
 */
export const filterByKeyword = (array, keyword, fields) => {
  if (!keyword) return array;
  
  const lowerKeyword = keyword.toLowerCase();
  
  return array.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) return false;
      return value.toString().toLowerCase().includes(lowerKeyword);
    });
  });
};

/**
 * Group array by field
 * @param {Array} array - Array to group
 * @param {String} field - Field to group by
 * @returns {Object} - Grouped object
 */
export const groupBy = (array, field) => {
  return array.reduce((groups, item) => {
    const key = item[field];
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Show success toast notification (requires toast library)
 * @param {String} message - Success message
 */
export const showSuccess = (message) => {
  // This will be used with react-toastify or similar library
  console.log('SUCCESS:', message);
};

/**
 * Show error toast notification
 * @param {String} message - Error message
 */
export const showError = (message) => {
  console.error('ERROR:', message);
};

// ============================================
// EXPORT ALL
// ============================================

export default {
  // Formatting
  formatCurrency,
  formatNumber,
  formatDate,
  formatDateInput,
  getTodayDate,
  formatPhone,
  
  // Validation
  validateNIK,
  validateEmail,
  validatePhone,
  validatePassword,
  validateRequired,
  
  // Calculation
  calculateLoan,
  calculateDueDate,
  calculateSalesTotal,
  calculateSubtotal,
  
  // Status & Badge
  getStatusColor,
  getStatusText,
  getRoleName,
  getDivisiName,
  getKategoriName,
  
  // Data Manipulation
  sortBy,
  filterByKeyword,
  groupBy,
  
  // Notifications
  showSuccess,
  showError
};