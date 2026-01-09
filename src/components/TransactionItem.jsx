import { ShoppingBag, Home as HomeIcon, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const TransactionItem = ({ transaction, formatCurrency, formatDate, onEdit, onDelete }) => {
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

    const Icon = getCategoryIcon(transaction.category);

    return (
        <div className="transaction-item">
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
};

export default TransactionItem;
