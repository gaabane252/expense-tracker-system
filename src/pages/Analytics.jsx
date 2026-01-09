import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import { TrendingUp, TrendingDown, PieChart, Calendar } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Analytics = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState({
        income: 0,
        expenses: 0,
        savingsRate: 0,
        transactionCount: 0
    });
    const [monthlyData, setMonthlyData] = useState({});
    const [categoryData, setCategoryData] = useState({});

    useEffect(() => {
        if (currentUser) {
            fetchTransactions();
        }
    }, [currentUser]);

    const fetchTransactions = async () => {
        try {
            const q = query(
                collection(db, 'transactions'),
                where('userId', '==', currentUser.uid)
            );

            const querySnapshot = await getDocs(q);
            const transactionsData = [];
            querySnapshot.forEach((doc) => {
                transactionsData.push({ id: doc.id, ...doc.data() });
            });

            setTransactions(transactionsData);
            calculateAnalytics(transactionsData);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    };

    const calculateAnalytics = (data) => {
        let totalIncome = 0;
        let totalExpenses = 0;
        const monthlyStats = {};
        const categoryStats = {};

        data.forEach((transaction) => {
            const amount = parseFloat(transaction.amount);
            const date = new Date(transaction.date);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short' });

            if (transaction.type === 'income') {
                totalIncome += amount;
            } else {
                totalExpenses += amount;
                // Category breakdown for expenses only
                categoryStats[transaction.category] = (categoryStats[transaction.category] || 0) + amount;
            }

            // Monthly breakdown
            if (!monthlyStats[monthKey]) {
                monthlyStats[monthKey] = { income: 0, expense: 0 };
            }
            if (transaction.type === 'income') {
                monthlyStats[monthKey].income += amount;
            } else {
                monthlyStats[monthKey].expense += amount;
            }
        });

        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100) : 0;

        setStats({
            income: totalIncome,
            expenses: totalExpenses,
            savingsRate: savingsRate.toFixed(1),
            transactionCount: data.length
        });

        setMonthlyData(monthlyStats);
        setCategoryData(categoryStats);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Monthly Trend Chart Data
    const monthlyChartData = {
        labels: Object.keys(monthlyData),
        datasets: [
            {
                label: 'Income',
                data: Object.values(monthlyData).map(m => m.income),
                backgroundColor: '#10B981',
                borderRadius: 8
            },
            {
                label: 'Expense',
                data: Object.values(monthlyData).map(m => m.expense),
                backgroundColor: '#EF4444',
                borderRadius: 8
            }
        ]
    };

    const monthlyChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    usePointStyle: true,
                    padding: 20,
                    font: { size: 12 }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: '#f3f4f6' }
            },
            x: {
                grid: { display: false }
            }
        }
    };

    // Category Chart Data
    const categoryChartData = {
        labels: Object.keys(categoryData),
        datasets: [
            {
                data: Object.values(categoryData),
                backgroundColor: [
                    '#8B5CF6',
                    '#EC4899',
                    '#F59E0B',
                    '#10B981',
                    '#3B82F6',
                    '#6366F1'
                ],
                borderWidth: 0
            }
        ]
    };

    const categoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    usePointStyle: true,
                    padding: 15,
                    font: { size: 12 }
                }
            }
        },
        cutout: '70%'
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Analytics</h1>
                        <p>Insights into your spending habits</p>
                    </div>
                </div>

                <div className="stats-grid stats-grid-4">
                    <StatCard
                        icon={TrendingUp}
                        label="Income"
                        value={formatCurrency(stats.income)}
                        color="success"
                    />
                    <StatCard
                        icon={TrendingDown}
                        label="Expenses"
                        value={formatCurrency(stats.expenses)}
                        color="danger"
                    />
                    <StatCard
                        icon={PieChart}
                        label="Savings Rate"
                        value={`${stats.savingsRate}%`}
                        color="primary"
                    />
                    <StatCard
                        icon={Calendar}
                        label="Transactions"
                        value={stats.transactionCount}
                        color="default"
                    />
                </div>

                <div className="analytics-charts">
                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Monthly Trend</h3>
                        </div>
                        <div className="chart-container">
                            {Object.keys(monthlyData).length > 0 ? (
                                <Bar data={monthlyChartData} options={monthlyChartOptions} />
                            ) : (
                                <div className="empty-chart">No data available</div>
                            )}
                        </div>
                    </div>

                    <div className="chart-card">
                        <div className="chart-header">
                            <h3>Expense Categories</h3>
                        </div>
                        <div className="chart-container">
                            {Object.keys(categoryData).length > 0 ? (
                                <Doughnut data={categoryChartData} options={categoryChartOptions} />
                            ) : (
                                <div className="empty-chart">No expense data available</div>
                            )}
                        </div>
                    </div>
                </div>

                {Object.keys(categoryData).length > 0 && (
                    <div className="category-breakdown">
                        <h3>Category Breakdown</h3>
                        <div className="category-list">
                            {Object.entries(categoryData)
                                .sort((a, b) => b[1] - a[1])
                                .map(([category, amount]) => (
                                    <div key={category} className="category-item">
                                        <div className="category-info">
                                            <span className="category-name">{category}</span>
                                            <span className="category-amount">{formatCurrency(amount)}</span>
                                        </div>
                                        <div className="category-bar">
                                            <div
                                                className="category-bar-fill"
                                                style={{ width: `${(amount / stats.expenses) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Analytics;
