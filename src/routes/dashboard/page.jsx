import { useState, useEffect } from "react";
import { Area, AreaChart, Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "@/hooks/use-theme";
import { Footer } from "@/layouts/footer";
import { CreditCard, DollarSign, Package, Users, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";
import { db } from "../db/firebase";
import { collection, getDocs, query, where, orderBy, limit, Timestamp } from "firebase/firestore";

const DashboardPage = () => {
    const { theme } = useTheme();
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalCustomers: 0,
        pendingTransactions: 0,
        successTransactions: 0,
        pendingTransactionsPercentage: 0,
        successTransactionsPercentage: 0,
        totalProductsPercentage: 0,
        totalCustomersPercentage: 0
    });
    const [recentTransactions, setRecentTransactions] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [paymentMethodData, setPaymentMethodData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Colors for pie chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch total products
                const productsRef = collection(db, "products");
                const productsSnapshot = await getDocs(productsRef);
                const totalProducts = productsSnapshot.size;

                // Fetch total customers
                const usersRef = collection(db, "users");
                const usersSnapshot = await getDocs(usersRef);
                const totalCustomers = usersSnapshot.size;

                // Fetch all transactions
                const transactionsRef = collection(db, "transactions");
                const transactionsSnapshot = await getDocs(transactionsRef);
                
                const allTransactions = transactionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                // Count pending and success transactions
                let pendingTransactions = 0;
                let successTransactions = 0;
                
                // Payment methods object
                const paymentMethods = {};
                
                // Monthly sales data
                const monthlySales = {};
                
                // Current date for percentage calculations
                const currentDate = new Date();
                const oneMonthAgo = new Date();
                oneMonthAgo.setMonth(currentDate.getMonth() - 1);
                
                // Count previous month stats for percentage calculations
                let prevMonthPendingTransactions = 0;
                let prevMonthSuccessTransactions = 0;
                let prevMonthCustomers = new Set();
                
                allTransactions.forEach((transaction) => {
                    const transactionDate = transaction.createdAt?.toDate() || new Date();
                    
                    // Count by status
                    if (transaction.status === "pending") {
                        pendingTransactions++;
                        
                        // Check if from previous month
                        if (transactionDate < oneMonthAgo) {
                            prevMonthPendingTransactions++;
                        }
                    } else if (transaction.status === "success") {
                        successTransactions++;
                        
                        // Count payment methods
                        const paymentType = transaction.paymentType || "unknown";
                        paymentMethods[paymentType] = (paymentMethods[paymentType] || 0) + 1;
                        
                        // Add to monthly sales
                        const monthKey = `${transactionDate.getFullYear()}-${transactionDate.getMonth() + 1}`;
                        monthlySales[monthKey] = (monthlySales[monthKey] || 0) + (transaction.totalAmount || 0);
                        
                        // Check if from previous month
                        if (transactionDate < oneMonthAgo) {
                            prevMonthSuccessTransactions++;
                        }
                    }
                    
                    // Track unique customers for previous month
                    if (transaction.userId && transactionDate < oneMonthAgo) {
                        prevMonthCustomers.add(transaction.userId);
                    }
                });

                // Calculate percentage changes
                const pendingTransactionsPercentage = prevMonthPendingTransactions === 0 
                    ? 100 
                    : ((pendingTransactions - prevMonthPendingTransactions) / prevMonthPendingTransactions) * 100;
                
                const successTransactionsPercentage = prevMonthSuccessTransactions === 0 
                    ? 100 
                    : ((successTransactions - prevMonthSuccessTransactions) / prevMonthSuccessTransactions) * 100;
                
                const totalCustomersPercentage = prevMonthCustomers.size === 0 
                    ? 100 
                    : ((totalCustomers - prevMonthCustomers.size) / prevMonthCustomers.size) * 100;
                
                // For products, assume 5% growth as we don't have historical data
                const totalProductsPercentage = 5;

                setStats({
                    totalProducts,
                    totalCustomers,
                    pendingTransactions,
                    successTransactions,
                    pendingTransactionsPercentage: Math.round(pendingTransactionsPercentage),
                    successTransactionsPercentage: Math.round(successTransactionsPercentage),
                    totalProductsPercentage: Math.round(totalProductsPercentage),
                    totalCustomersPercentage: Math.round(totalCustomersPercentage)
                });

                // Fetch recent transactions
                const recentTransactionsQuery = query(
                    collection(db, "transactions"),
                    orderBy("createdAt", "desc"),
                    limit(10)
                );
                
                const recentTransactionsSnapshot = await getDocs(recentTransactionsQuery);
                const transactionsList = recentTransactionsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        formattedDate: data.createdAt ? formatDate(data.createdAt.toDate()) : 'N/A'
                    };
                });
                
                setRecentTransactions(transactionsList);

                // Prepare sales data for chart - last 6 months
                const last6Months = [];
                for (let i = 5; i >= 0; i--) {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    
                    last6Months.push({
                        name: date.toLocaleString('default', { month: 'short' }),
                        total: monthlySales[monthKey] || 0
                    });
                }
                
                setSalesData(last6Months);
                
                // Format payment method data for pie chart
                const paymentMethodsArray = Object.entries(paymentMethods).map(([name, value]) => ({
                    name,
                    value
                }));
                
                setPaymentMethodData(paymentMethodsArray);
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data: ", error);
                setError("Gagal memuat data dari Firebase");
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (date) => {
        return new Intl.DateTimeFormat('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (error) {
        return (
            <div className="flex flex-col gap-y-4">
                <h1 className="title">Dashboard</h1>
                <div className="p-4 bg-red-100 text-red-700 rounded-md">
                    {error}
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-y-4">
            <h1 className="title">Dashboard</h1>
            {loading ? (
                <div className="text-center py-10">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
                    <p className="mt-2">Loading data...</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="card">
                            <div className="card-header">
                                <div className="w-fit rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                    <Package size={26} />
                                </div>
                                <p className="card-title">Total Produk</p>
                            </div>
                            <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                                <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                                    {stats.totalProducts.toLocaleString()}
                                </p>
                                <span className={`flex w-fit items-center gap-x-2 rounded-full px-2 py-1 font-medium ${
                                    stats.totalProductsPercentage >= 0 
                                    ? "border border-green-500 text-green-500" 
                                    : "border border-red-500 text-red-500"
                                }`}>
                                    {stats.totalProductsPercentage >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                    {Math.abs(stats.totalProductsPercentage)}%
                                </span>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                    <Users size={26} />
                                </div>
                                <p className="card-title">Total Customer</p>
                            </div>
                            <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                                <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                                    {stats.totalCustomers.toLocaleString()}
                                </p>
                                <span className={`flex w-fit items-center gap-x-2 rounded-full px-2 py-1 font-medium ${
                                    stats.totalCustomersPercentage >= 0 
                                    ? "border border-green-500 text-green-500" 
                                    : "border border-red-500 text-red-500"
                                }`}>
                                    {stats.totalCustomersPercentage >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                    {Math.abs(stats.totalCustomersPercentage)}%
                                </span>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                    <TrendingUp size={26} />
                                </div>
                                <p className="card-title">Transaksi Pending</p>
                            </div>
                            <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                                <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                                    {stats.pendingTransactions.toLocaleString()}
                                </p>
                                <span className={`flex w-fit items-center gap-x-2 rounded-full px-2 py-1 font-medium ${
                                    stats.pendingTransactionsPercentage >= 0 
                                    ? "border border-blue-500 text-blue-500" 
                                    : "border border-green-500 text-green-500"
                                }`}>
                                    {stats.pendingTransactionsPercentage >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                    {Math.abs(stats.pendingTransactionsPercentage)}%
                                </span>
                            </div>
                        </div>
                        <div className="card">
                            <div className="card-header">
                                <div className="rounded-lg bg-blue-500/20 p-2 text-blue-500 transition-colors dark:bg-blue-600/20 dark:text-blue-600">
                                    <CreditCard size={26} />
                                </div>
                                <p className="card-title">Transaksi Success</p>
                            </div>
                            <div className="card-body bg-slate-100 transition-colors dark:bg-slate-950">
                                <p className="text-3xl font-bold text-slate-900 transition-colors dark:text-slate-50">
                                    {stats.successTransactions.toLocaleString()}
                                </p>
                                <span className={`flex w-fit items-center gap-x-2 rounded-full px-2 py-1 font-medium ${
                                    stats.successTransactionsPercentage >= 0 
                                    ? "border border-green-500 text-green-500" 
                                    : "border border-red-500 text-red-500"
                                }`}>
                                    {stats.successTransactionsPercentage >= 0 ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                                    {Math.abs(stats.successTransactionsPercentage)}%
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <div className="card col-span-1 md:col-span-2 lg:col-span-4">
                            <div className="card-header">
                                <p className="card-title">Grafik Penjualan (6 Bulan Terakhir)</p>
                            </div>
                            <div className="card-body p-0">
                                <ResponsiveContainer width="100%" height={300}>
                                    <AreaChart
                                        data={salesData}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            left: 20,
                                            bottom: 5,
                                        }}
                                    >
                                        <defs>
                                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis 
                                            dataKey="name"
                                            strokeWidth={0}
                                            stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                            tickMargin={10}
                                        />
                                        <YAxis
                                            strokeWidth={0}
                                            stroke={theme === "light" ? "#475569" : "#94a3b8"}
                                            tickFormatter={(value) => `Rp${(value/1000000).toFixed(1)}M`}
                                            tickMargin={10}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`Rp${value.toLocaleString()}`, "Penjualan"]}
                                            labelFormatter={(label) => `Bulan: ${label}`}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="total"
                                            stroke="#2563eb"
                                            fillOpacity={1}
                                            fill="url(#colorTotal)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="card col-span-1 md:col-span-2 lg:col-span-3">
                            <div className="card-header">
                                <p className="card-title">Riwayat Transaksi</p>
                            </div>
                            <div className="card-body h-[300px] overflow-auto p-0">
                                {recentTransactions.length === 0 ? (
                                    <div className="text-center py-4">Tidak ada transaksi terbaru</div>
                                ) : (
                                    recentTransactions.map((transaction) => (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between gap-x-4 py-3 px-4 border-b border-slate-200 dark:border-slate-800"
                                        >
                                            <div className="flex flex-col gap-y-1">
                                                <p className="font-medium text-slate-900 dark:text-slate-50">
                                                    {transaction.customerDetails?.name || transaction.customerDetails?.phone || "Customer"}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                                    {transaction.customerDetails?.email || "No email"}
                                                </p>
                                                <div className="flex items-center gap-x-2">
                                                    <span 
                                                        className={`px-2 py-1 text-xs rounded-full ${
                                                            transaction.status === "success" 
                                                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                        }`}
                                                    >
                                                        {transaction.status}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {transaction.formattedDate}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="font-medium text-slate-900 dark:text-slate-50">
                                                Rp{transaction.totalAmount?.toLocaleString() || 0}
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title">Metode Pembayaran</p>
                            </div>
                            <div className="card-body flex justify-center items-center">
                                {paymentMethodData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie
                                                data={paymentMethodData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="value"
                                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            >
                                                {paymentMethodData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip 
                                                formatter={(value) => [`${value} transaksi`, "Jumlah"]}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="text-center py-10">Tidak ada data pembayaran</div>
                                )}
                            </div>
                        </div>
                        
                        <div className="card">
                            <div className="card-header">
                                <p className="card-title">Ringkasan Pesanan</p>
                            </div>
                            <div className="card-body p-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Total Penjualan</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                                            Rp{salesData.reduce((sum, item) => sum + item.total, 0).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Transaksi Sukses</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                                            {stats.successTransactions.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Transaksi Pending</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                                            {stats.pendingTransactions.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Rata-rata Pesanan</span>
                                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-50 mt-1">
                                            {stats.successTransactions > 0 ? 
                                                `Rp${Math.round(salesData.reduce((sum, item) => sum + item.total, 0) / stats.successTransactions).toLocaleString()}` : 
                                                'Rp0'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="card">
                        <div className="card-header">
                            <p className="card-title">Detail Transaksi</p>
                        </div>
                        <div className="card-body overflow-x-auto">
                            <table className="w-full min-w-[800px] text-left">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-800">
                                        <th className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">ID Pesanan</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Customer</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Tanggal</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Metode Pembayaran</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Total</th>
                                        <th className="px-4 py-3 text-sm font-medium text-slate-500 dark:text-slate-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="border-b border-slate-200 dark:border-slate-800">
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300 truncate max-w-xs">
                                                {transaction.orderId || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {transaction.customerDetails?.name || transaction.customerDetails?.phone || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {transaction.formattedDate}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                {transaction.paymentType || 'N/A'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                                                Rp{transaction.totalAmount?.toLocaleString() || 0}
                                            </td>
                                            <td className="px-4 py-3">
                                                <span 
                                                    className={`px-2 py-1 text-xs rounded-full ${
                                                        transaction.status === "success" 
                                                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                                                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                                    }`}
                                                >
                                                    {transaction.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {recentTransactions.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-4 py-6 text-center text-slate-500">
                                                Tidak ada data transaksi
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}
            <Footer />
        </div>
    );
};

export default DashboardPage;