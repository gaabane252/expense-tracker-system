import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { Users, Receipt, TrendingUp, TrendingDown } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalTransactions: 0,
        totalIncome: 0,
        totalExpense: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Fetch all users
                const usersSnap = await getDocs(collection(db, 'users'));
                const usersCount = usersSnap.size;

                // Fetch all transactions
                const transSnap = await getDocs(collection(db, 'transactions'));
                const transactions = [];
                transSnap.forEach(doc => transactions.push(doc.data()));

                const income = transactions
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);

                const expense = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);

                setStats({
                    totalUsers: usersCount,
                    totalTransactions: transactions.length,
                    totalIncome: income,
                    totalExpense: expense
                });
            } catch (error) {
                console.error('Error fetching admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Platform overview and performance</p>
                    </div>
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                        <p>Fetching platform statistics...</p>
                    </div>
                ) : (
                    <>
                        <div className="stats-grid stats-grid-4">
                            <StatCard
                                label="Total Users"
                                value={stats.totalUsers}
                                icon={Users}
                                type="primary"
                            />
                            <StatCard
                                label="Total Transactions"
                                value={stats.totalTransactions}
                                icon={Receipt}
                                type="default"
                            />
                            <StatCard
                                label="Net Income"
                                value={formatCurrency(stats.totalIncome)}
                                icon={TrendingUp}
                                type="success"
                            />
                            <StatCard
                                label="Net Expenses"
                                value={formatCurrency(stats.totalExpense)}
                                icon={TrendingDown}
                                type="danger"
                            />
                        </div>

                        <div className="dashboard-section" style={{ marginTop: '2rem' }}>
                            <h2>Platform Health</h2>
                            <div className="stat-card" style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Platform Balance</h3>
                                        <h1 style={{ fontSize: '2.5rem', color: stats.totalIncome - stats.totalExpense >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                                            {formatCurrency(stats.totalIncome - stats.totalExpense)}
                                        </h1>
                                    </div>
                                    <div className="transaction-icon" data-type={stats.totalIncome - stats.totalExpense >= 0 ? 'income' : 'expense'} style={{ width: '80px', height: '80px' }}>
                                        <TrendingUp size={40} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
