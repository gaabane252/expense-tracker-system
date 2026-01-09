import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import { Search, Edit2, Trash2, ShoppingBag, Home as HomeIcon, TrendingUp } from 'lucide-react';

const Transactions = () => {
    const { currentUser } = useAuth();
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({
        title: '',
        amount: '',
        category: '',
        date: '',
        type: ''
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (!currentUser) return;

        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionsData = [];
            querySnapshot.forEach((doc) => {
                transactionsData.push({ id: doc.id, ...doc.data() });
            });

            // Sort client-side
            transactionsData.sort((a, b) => new Date(b.date) - new Date(a.date));
            setTransactions(transactionsData);
        }, (error) => {
            console.error('Error fetching transactions:', error);
        });

        return () => unsubscribe();
    }, [currentUser]);

    useEffect(() => {
        filterTransactions();
    }, [searchTerm, typeFilter, categoryFilter, transactions]);

    const filterTransactions = () => {
        let filtered = [...transactions];

        // Filter by search term
        if (searchTerm) {
            filtered = filtered.filter(t =>
                t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                t.category.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by type
        if (typeFilter !== 'all') {
            filtered = filtered.filter(t => t.type === typeFilter);
        }

        // Filter by category
        if (categoryFilter !== 'all') {
            filtered = filtered.filter(t => t.category === categoryFilter);
        }

        setFilteredTransactions(filtered);
    };

    const handleEditClick = (transaction) => {
        setEditingId(transaction.id);
        setEditData({
            title: transaction.title,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
            type: transaction.type
        });
        setIsEditModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const transactionRef = doc(db, 'transactions', editingId);
            await updateDoc(transactionRef, {
                title: editData.title,
                amount: parseFloat(editData.amount),
                category: editData.category,
                date: editData.date
            });
            setIsEditModalOpen(false);
            setEditingId(null);
        } catch (error) {
            console.error('Error updating transaction:', error);
            alert('Failed to update transaction');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteDoc(doc(db, 'transactions', id));
                fetchTransactions();
            } catch (error) {
                console.error('Error deleting transaction:', error);
            }
        }
    };

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
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const allCategories = [...new Set(transactions.map(t => t.category))];

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Transactions</h1>
                        <p>View and manage all your transactions</p>
                    </div>
                </div>

                <div className="transactions-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-group">
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                            <option value="all">All Types</option>
                            <option value="income">Income</option>
                            <option value="expense">Expense</option>
                        </select>

                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="all">All Categories</option>
                            {allCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Transaction</th>
                                <th>Category</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">
                                        No transactions found
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((transaction) => {
                                    const Icon = getCategoryIcon(transaction.category);
                                    return (
                                        <tr key={transaction.id}>
                                            <td>
                                                <div className="table-transaction">
                                                    <div className="transaction-icon" data-type={transaction.type}>
                                                        <Icon size={18} />
                                                    </div>
                                                    <span>{transaction.title}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="category-badge" data-type={transaction.type}>
                                                    {transaction.category}
                                                </span>
                                            </td>
                                            <td>{formatDate(transaction.date)}</td>
                                            <td>
                                                <span className={`amount ${transaction.type}`}>
                                                    {transaction.type === 'income' ? '+' : '-'}
                                                    {formatCurrency(transaction.amount)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="table-actions">
                                                    <button
                                                        className="action-btn edit"
                                                        onClick={() => handleEditClick(transaction)}
                                                        title="Edit"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        className="action-btn delete"
                                                        onClick={() => handleDelete(transaction.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <div className="modal-header">
                                <h2>Edit Transaction</h2>
                                <button className="close-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
                            </div>
                            <form onSubmit={handleUpdate} className="edit-form">
                                <div className="form-group">
                                    <label>Title</label>
                                    <input
                                        type="text"
                                        value={editData.title}
                                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Amount</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={editData.amount}
                                        onChange={(e) => setEditData({ ...editData, amount: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Category</label>
                                    <select
                                        value={editData.category}
                                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                        required
                                    >
                                        {(editData.type === 'income' ?
                                            ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'] :
                                            ['Rent', 'Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Healthcare', 'Other']
                                        ).map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Date</label>
                                    <input
                                        type="date"
                                        value={editData.date}
                                        onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Transactions;
