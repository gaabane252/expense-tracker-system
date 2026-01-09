const StatCard = ({ icon: Icon, label, value, type = 'default', trend }) => {
    return (
        <div className={`stat-card stat-card-${type}`}>
            <div className="stat-card-content">
                <div className="stat-card-header">
                    <span className="stat-card-label">{label}</span>
                    {Icon && (
                        <div className="stat-card-icon">
                            <Icon size={20} />
                        </div>
                    )}
                </div>
                <div className="stat-card-value">{value}</div>
                {trend && <div className="stat-card-trend">{trend}</div>}
            </div>
        </div>
    );
};

export default StatCard;
