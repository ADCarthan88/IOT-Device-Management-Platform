import React from 'react';

interface MetricCardProps {
    title: string;
    value: number | string;
    unit?: string;
    description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, unit, description }) => {
    return (
        <div className="metric-card">
            <h3>{title}</h3>
            <p className="metric-value">
                {value} {unit}
            </p>
            {description && <p className="metric-description">{description}</p>}
        </div>
    );
};

export default MetricCard;