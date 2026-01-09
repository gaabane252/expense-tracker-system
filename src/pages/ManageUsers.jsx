import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import Sidebar from '../components/Sidebar';
import { Search, Trash2, Shield, ShieldOff, AlertCircle } from 'lucide-react';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchUsers = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'users'));
            const usersData = [];
            querySnapshot.forEach((doc) => {
                usersData.push({ id: doc.id, ...doc.data() });
            });
            setUsers(usersData);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const toggleAdminStatus = async (user) => {
        if (!window.confirm(`Are you sure you want to ${user.isAdmin ? 'remove' : 'grant'} admin privileges for ${user.fullName}?`)) return;

        setActionLoading(user.id);
        try {
            const userRef = doc(db, 'users', user.id);
            await updateDoc(userRef, {
                isAdmin: !user.isAdmin
            });
            await fetchUsers();
        } catch (error) {
            console.error('Error updating admin status:', error);
            alert('Failed to update admin status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

        setActionLoading(userId);
        try {
            await deleteDoc(doc(db, 'users', userId));
            await fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="app-layout">
            <Sidebar />
            <div className="main-content">
                <div className="page-header">
                    <div>
                        <h1>Manage Users</h1>
                        <p>Total users: {users.length}</p>
                    </div>
                </div>

                <div className="transactions-filters">
                    <div className="search-box">
                        <Search size={20} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="transactions-table-container">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="empty-state">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="table-transaction">
                                                <div className="transaction-icon" data-type={user.isAdmin ? 'income' : 'default'} style={{ borderRadius: '50%' }}>
                                                    {user.fullName.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ fontWeight: 600 }}>{user.fullName}</span>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`category-badge`} data-type={user.isAdmin ? 'income' : 'expense'}>
                                                {user.isAdmin ? 'Admin' : 'User'}
                                            </span>
                                        </td>
                                        <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                                        <td>
                                            <div className="table-actions">
                                                <button
                                                    className={`action-btn ${user.isAdmin ? 'delete' : 'edit'}`}
                                                    onClick={() => toggleAdminStatus(user)}
                                                    title={user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                                                    disabled={actionLoading === user.id}
                                                >
                                                    {user.isAdmin ? <ShieldOff size={18} /> : <Shield size={18} />}
                                                </button>
                                                <button
                                                    className="action-btn delete"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                    title="Delete User"
                                                    disabled={actionLoading === user.id}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ManageUsers;
