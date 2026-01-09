import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import { Search, Edit2, Trash2, ShoppingBag, Home as HomeIcon, TrendingUp, Filter } from 'lucide-react';

const ManageTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [users, setUsers] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
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
        // Fetch users to map userIds to names
        const fetchUsers = async () => {
            const usersSnap = await getDocs(collection(db, 'users'));
            const usersMap = {};
            usersSnap.forEach(doc => {
                usersMap[doc.id] = doc.data().fullName;
            });
            setUsers(usersMap);
        };

        fetchUsers();

        // Subscribe to all transactions
        const q = query(collection(db, 'transactions'), orderBy('date', 'desc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const transactionsData = [];
            querySnapshot.forEach((doc) => {
                transactionsData.push({ id: doc.id, ...doc.data() });
            });
            setTransactions(transactionsData);
        }, (error) => {
            console.error('Error fetching all transactions:', error);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let filtered = transactions.filter(t =>
            (t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (users[t.userId] || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
            (typeFilter === 'all' || t.type === typeFilter)
        );
        setFilteredTransactions(filtered);
    }, [searchTerm, typeFilter, transactions, users]);

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
        if (window.confirm('Are you sure you want to delete this transaction system-wide?')) {
            try {
                await deleteDoc(doc(db, 'transactions', id));
            } catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Failed to delete transaction');
            }
        }
    };

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
                        <h1>Global Transactions</h1>
                        <p>Total transactions across all users: {transactions.length}</p>
                    </div>
                </div>

                <div className="transactions-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by title or user..."
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
                    </div>
                </div>

                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Transaction</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">No transactions found</td>
                                </tr>
                            ) : (
                                filteredTransactions.map((t) => (
                                    <tr key={t.id}>
                                        <td style={{ fontWeight: 500 }}>{users[t.userId] || 'Unknown User'}</td>
                                        <td>{t.title}</td>
                                        <td>
                                            <span className="category-badge" data-type={t.type}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`amount ${t.type}`}>
                                                {t.type === 'income' ? '+' : '-'}
                                                {formatCurrency(t.amount)}
                                            </span>
                                        </td>
                                        <td>{new Date(t.date).toLocaleDateString()}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button className="action-btn edit" onClick={() => handleEditClick(t)}>
                                                    <Edit2 size={16} />
                                                </button>
                                                <button className="action-btn delete" onClick={() => handleDelete(t.id)}>
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {isEditModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-card">
                            <div className="modal-header">
                                <h2>Edit Global Transaction</h2>
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

export default ManageTransactions;
