import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import { PlusCircle, AlertCircle } from 'lucide-react';

const AddTransaction = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        type: 'expense',
        title: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const expenseCategories = ['Rent', 'Food', 'Shopping', 'Transport', 'Entertainment', 'Bills', 'Healthcare', 'Other'];
    const incomeCategories = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];

    const categories = formData.type === 'income' ? incomeCategories : expenseCategories;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset category when type changes
            ...(name === 'type' && { category: '' })
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.title || !formData.amount || !formData.category || !formData.date) {
            setError('Please fill in all fields');
            return;
        }

        if (parseFloat(formData.amount) <= 0) {
            setError('Amount must be greater than 0');
            return;
        }

        try {
            setLoading(true);
            await addDoc(collection(db, 'transactions'), {
                userId: currentUser.uid,
                type: formData.type,
                title: formData.title,
                amount: parseFloat(formData.amount),
                category: formData.category,
                date: formData.date,
                createdAt: new Date().toISOString()
            });

            navigate('/');
        } catch (err) {
            setError('Failed to add transaction. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Add Transaction</h1>
                        <p>Record a new income or expense</p>
                    </div>
                </div>

                <div className="form-container">
                    <div className="form-card">
                        <div className="form-card-header">
                            <PlusCircle size={24} />
                            <h2>New Transaction</h2>
                            <p>Fill in the details below</p>
                        </div>

                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Type</label>
                                <div className="type-toggle">
                                    <button
                                        type="button"
                                        className={`type-btn ${formData.type === 'income' ? 'active income' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'income', category: '' }))}
                                    >
                                        ↗ Income
                                    </button>
                                    <button
                                        type="button"
                                        className={`type-btn ${formData.type === 'expense' ? 'active expense' : ''}`}
                                        onClick={() => setFormData(prev => ({ ...prev, type: 'expense', category: '' }))}
                                    >
                                        ↙ Expense
                                    </button>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    placeholder="e.g., Grocery shopping"
                                    value={formData.title}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="amount">Amount</label>
                                <div className="input-with-prefix">
                                    <span className="input-prefix">$</span>
                                    <input
                                        id="amount"
                                        name="amount"
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={handleChange}
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    disabled={loading}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="date">Date</label>
                                <input
                                    id="date"
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                            </div>

                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddTransaction;
