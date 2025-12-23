import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api';
import { formatCurrency, formatDate, getTodayDate } from '../utils/helpers';

// 1. Import Chart Components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// 2. Import Icons from Heroicons
import { 
  BanknotesIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon, 
  CreditCardIcon, 
  ShoppingBagIcon, 
  UsersIcon, 
  CubeIcon, 
  DocumentTextIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const DashboardPage = () => {
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    todaySales: { total: 0, count: 0 },
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    activeLoans: { count: 0, total: 0 },
    lowStockProducts: [],
    recentTransactions: [],
    recentLoans: []
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const today = getTodayDate();
      
      const [
        todaySalesRes,
        financeSummaryRes,
        activeLoansRes,
        lowStockRes,
        recentSalesRes,
        recentLoansRes
      ] = await Promise.all([
        // Today's sales
        api.penjualan.getAll({ start_date: today, end_date: today }).catch(() => ({ data: [] })),
        // Finance summary (this month)
        api.keuangan.getSummary({ start_date: `${today.substring(0, 7)}-01`, end_date: today }).catch(() => ({ data: { pemasukan: 0, pengeluaran: 0, saldo: 0 } })),
        // Active loans
        api.pinjaman.getAll({ status: 'berjalan' }).catch(() => ({ data: [] })),
        // Low stock products
        api.produk.getLowStock().catch(() => ({ data: [] })),
        // Recent sales (last 5)
        api.penjualan.getAll().catch(() => ({ data: [] })),
        // Recent loans (last 5)
        api.pinjaman.getAll().catch(() => ({ data: [] }))
      ]);

      // --- PERBAIKAN DI SINI (Mencegah NaN) ---
      // Kita gunakan Number() dan isNaN() untuk memastikan nilai valid sebelum dijumlahkan
      const todayTotal = todaySalesRes.data.reduce((sum, sale) => {
        const harga = Number(sale.total_harga); // Paksa ubah ke angka
        return sum + (isNaN(harga) ? 0 : harga); // Jika hasil konversi NaN, anggap 0
      }, 0);

      const activeLoansTotal = activeLoansRes.data.reduce((sum, loan) => {
        const sisa = Number(loan.sisa_pinjaman); // Paksa ubah ke angka
        return sum + (isNaN(sisa) ? 0 : sisa);
      }, 0);

      // Kita juga pastikan data keuangan dikonversi ke Number agar Chart tidak error
      const income = Number(financeSummaryRes.data.pemasukan) || 0;
      const expense = Number(financeSummaryRes.data.pengeluaran) || 0;
      const currentBalance = Number(financeSummaryRes.data.saldo) || 0;

      setDashboardData({
        todaySales: { total: todayTotal, count: todaySalesRes.data.length },
        totalIncome: income,
        totalExpense: expense,
        balance: currentBalance,
        activeLoans: { count: activeLoansRes.data.length, total: activeLoansTotal },
        lowStockProducts: lowStockRes.data.slice(0, 5),
        recentTransactions: recentSalesRes.data.slice(0, 5),
        recentLoans: recentLoansRes.data.slice(0, 5)
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- Chart Configuration ---
  const financeChartData = {
    labels: ['Pemasukan', 'Pengeluaran'],
    datasets: [
      {
        label: 'Keuangan Bulan Ini',
        data: [dashboardData.totalIncome, dashboardData.totalExpense],
        backgroundColor: [
          'rgba(34, 197, 94, 0.7)', // Green
          'rgba(239, 68, 68, 0.7)', // Red
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }, // Hide legend for cleaner look
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { display: true, borderDash: [2, 4] }
      },
      x: { grid: { display: false } }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-500 font-medium">Memuat data dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Selamat datang kembali, <span className="font-semibold text-blue-600">{user?.nama_lengkap}</span>
          </p>
        </div>
        <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm border border-gray-200 text-sm text-gray-600">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          {user?.role === 'admin' ? 'Administrator' : user?.role === 'pengurus' ? 'Pengurus BUMDes' : 'Staff Operasional'}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Penjualan Hari Ini"
          value={formatCurrency(dashboardData.todaySales.total)}
          subValue={`${dashboardData.todaySales.count} Transaksi`}
          icon={<ShoppingBagIcon className="w-6 h-6 text-blue-600" />}
          color="blue"
        />
        
        <StatCard 
          title="Pemasukan Bulan Ini"
          value={formatCurrency(dashboardData.totalIncome)}
          subValue="Total pendapatan"
          icon={<ArrowTrendingUpIcon className="w-6 h-6 text-green-600" />}
          color="green"
        />

        <StatCard 
          title="Pengeluaran Bulan Ini"
          value={formatCurrency(dashboardData.totalExpense)}
          subValue="Total biaya"
          icon={<ArrowTrendingDownIcon className="w-6 h-6 text-red-600" />}
          color="red"
        />

        <StatCard 
          title="Pinjaman Aktif"
          value={dashboardData.activeLoans.count.toString()}
          subValue={`Sisa: ${formatCurrency(dashboardData.activeLoans.total)}`}
          icon={<CreditCardIcon className="w-6 h-6 text-orange-600" />}
          color="orange"
        />
      </div>

      {/* Charts & Finance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800">Analisis Keuangan Bulan Ini</h3>
          </div>
          <div className="h-64 w-full">
            <Bar data={financeChartData} options={chartOptions} />
          </div>
        </div>

        {/* Balance Summary Card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
          
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-slate-700/50 rounded-lg">
                <BanknotesIcon className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-slate-300 font-medium">Saldo Kas</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              {formatCurrency(dashboardData.balance)}
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              Akumulasi saldo bulan berjalan
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <Link to="/keuangan" className="flex items-center justify-between text-sm text-emerald-400 hover:text-emerald-300 transition-colors group">
              Lihat Laporan Detail
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-gray-500" />
              Transaksi Terakhir
            </h3>
            <Link to="/penjualan" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Lihat Semua
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-100">
                <tr>
                  <th className="px-5 py-3">No. Transaksi</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.recentTransactions.length === 0 ? (
                  <tr><td colSpan="4" className="text-center py-8 text-gray-500">Belum ada transaksi</td></tr>
                ) : (
                  dashboardData.recentTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-900">{trx.no_transaksi}</td>
                      <td className="px-5 py-3 text-gray-600">
                        <div className="flex flex-col">
                          <span>{trx.nama_anggota || 'Umum'}</span>
                          <span className="text-xs text-gray-400">{formatDate(trx.tanggal)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-gray-900">
                        {formatCurrency(trx.total_harga)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <StatusBadge status={trx.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-500" />
              Stok Menipis
            </h3>
            <Link to="/produk" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Kelola Stok
            </Link>
          </div>
          <div className="flex-1">
            {dashboardData.lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                 <CubeIcon className="w-12 h-12 text-gray-200 mb-2" />
                 <p className="text-gray-500">Semua stok aman</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {dashboardData.lowStockProducts.map((product) => (
                  <div key={product.id} className="p-4 flex items-center justify-between hover:bg-red-50/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shrink-0">
                        {product.stok}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[150px]">{product.nama_produk}</p>
                        <p className="text-xs text-gray-500">Min: {product.stok_minimum} {product.satuan}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-red-600 bg-red-100 px-2 py-1 rounded-full whitespace-nowrap">
                      Restock!
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-800 mb-4 ml-1">Akses Cepat</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionLink 
            to="/penjualan" 
            label="Transaksi Baru" 
            icon={<ShoppingBagIcon className="w-6 h-6" />} 
            color="bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md" 
          />
          <QuickActionLink 
            to="/anggota" 
            label="Data Anggota" 
            icon={<UsersIcon className="w-6 h-6" />} 
            color="bg-purple-50 text-purple-600 hover:bg-purple-100 hover:shadow-md" 
          />
          <QuickActionLink 
            to="/produk" 
            label="Kelola Produk" 
            icon={<CubeIcon className="w-6 h-6" />} 
            color="bg-orange-50 text-orange-600 hover:bg-orange-100 hover:shadow-md" 
          />
          <QuickActionLink 
            to="/keuangan" 
            label="Laporan" 
            icon={<DocumentTextIcon className="w-6 h-6" />} 
            color="bg-teal-50 text-teal-600 hover:bg-teal-100 hover:shadow-md" 
          />
        </div>
      </div>
    </div>
  );
};


const StatCard = ({ title, value, subValue, icon, color }) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-100",
    green: "bg-green-50 border-green-100",
    red: "bg-red-50 border-red-100",
    orange: "bg-orange-50 border-orange-100"
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4 flex items-center text-sm">
        <span className="text-gray-500">{subValue}</span>
      </div>
    </div>
  );
};

const QuickActionLink = ({ to, label, icon, color }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center p-6 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 ${color}`}
  >
    <div className="mb-3">{icon}</div>
    <span className="font-medium text-sm">{label}</span>
  </Link>
);

const StatusBadge = ({ status }) => {
  const styles = {
    selesai: 'bg-green-100 text-green-700',
    lunas: 'bg-green-100 text-green-700',
    berjalan: 'bg-blue-100 text-blue-700',
    pending: 'bg-yellow-100 text-yellow-700',
    batal: 'bg-red-100 text-red-700'
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default DashboardPage;