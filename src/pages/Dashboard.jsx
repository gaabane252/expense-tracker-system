import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { Wallet, TrendingUp, TrendingDown, ShoppingBag, Home as HomeIcon, ArrowUpRight, ArrowDownRight, PlusCircle } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        balance: 0,
        income: 0,
        expenses: 0
    });

    useEffect(() => {
        if (!currentUser) return;

        // Use onSnapshot for real-time updates
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', currentUser.uid)
            // Removed orderBy('date', 'desc') temporarily to avoid missing index error
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionsData = [];
            let totalIncome = 0;
            let totalExpenses = 0;

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                transactionsData.push({ id: doc.id, ...data });

                if (data.type === 'income') {
                    totalIncome += parseFloat(data.amount);
                } else {
                    totalExpenses += parseFloat(data.amount);
                }
            });

            // Sort transactions client-side for now
            transactionsData.sort((a, b) => new Date(b.date) - new Date(a.date));

            setTransactions(transactionsData.slice(0, 5));
            setStats({
                balance: totalIncome - totalExpenses,
                income: totalIncome,
                expenses: totalExpenses
            });
        }, (error) => {
            console.error('Error fetching transactions:', error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const getCategoryIcon = (category) => {
        const icons = {
            'Shopping': ShoppingBag,
            'Rent': HomeIcon,
            'Food': ShoppingBag,
            'Transport': ShoppingBag,
            'Salary': TrendingUp,
            'Freelance': TrendingUp,
            'Investment': TrendingUp
        };
        return icons[category] || ShoppingBag;
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Hello, {userProfile?.fullName.split(' ')[0] || 'there'}! 👋</h1>
                        <p>Here's what's happening with your money today.</p>
                    </div>
                    <NavLink to="/add" className="btn-primary">
                        <PlusCircle size={20} />
                        <span>Add Transaction</span>
                    </NavLink>
                </div>

                <div className="stats-grid">
                    <StatCard
                        icon={Wallet}
                        label="Total Balance"
                        value={formatCurrency(stats.balance)}
                        type="primary"
                    />
                    <StatCard
                        icon={TrendingUp}
                        label="Total Income"
                        value={formatCurrency(stats.income)}
                        type="success"
                    />
                    <StatCard
                        icon={TrendingDown}
                        label="Total Expenses"
                        value={formatCurrency(stats.expenses)}
                        type="danger"
                    />
                </div>

                <div className="dashboard-section">
                    <div className="dashboard-section-header">
                        <h2>Recent Transactions</h2>
                        <NavLink to="/transactions" className="view-all-link">View All</NavLink>
                    </div>
                    <div className="transactions-list">
                        {transactions.length === 0 ? (
                            <div className="empty-state">
                                <p>No transactions yet. Add your first transaction!</p>
                            </div>
                        ) : (
                            transactions.map((transaction) => {
                                const Icon = getCategoryIcon(transaction.category);
                                return (
                                    <div key={transaction.id} className="transaction-item">
                                        <div className="transaction-icon" data-type={transaction.type}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="transaction-details">
                                            <h4>{transaction.title}</h4>
                                            <p>{transaction.category} • {formatDate(transaction.date)}</p>
                                        </div>
                                        <div className={`transaction-amount ${transaction.type}`}>
                                            {transaction.type === 'income' ? '+' : '-'}
                                            {formatCurrency(transaction.amount)}
                                            {transaction.type === 'income' ?
                                                <ArrowUpRight size={16} /> :
                                                <ArrowDownRight size={16} />
                                            }
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
