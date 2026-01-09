import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, PlusCircle, List, BarChart3, LogOut, Receipt } from 'lucide-react';

const Sidebar = () => {
    const { currentUser, userProfile, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to log out:', error);
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const adminMenuItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Admin Dashboard' },
        { path: '/admin/users', icon: List, label: 'Manage Users' },
        { path: '/admin/transactions', icon: List, label: 'Manage Transactions' }
    ];

    const userMenuItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/add', icon: PlusCircle, label: 'Add Transaction' },
        { path: '/transactions', icon: List, label: 'Transactions' },
        { path: '/analytics', icon: BarChart3, label: 'Analytics' }
    ];

    const menuItems = userProfile?.isAdmin ? adminMenuItems : userMenuItems;

    return (
        <>
            <button className="mobile-toggle" onClick={toggleMobileMenu}>
                <List size={24} />
            </button>

            <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Receipt size={32} />
                    </div>
                    <div className="sidebar-user">
                        <h3>{userProfile?.isAdmin ? 'Admin Portal' : 'Expense Tracker'}</h3>
                        <p>{currentUser?.email || 'user@example.com'}</p>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `sidebar-link ${isActive ? 'active' : ''}`
                            }
                            end={item.path === '/' || item.path === '/admin'}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="sidebar-link logout-btn">
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>
            {isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)} />}
        </>
    );
};

export default Sidebar;
