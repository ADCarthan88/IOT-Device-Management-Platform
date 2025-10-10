import React from 'react';
import { useMetrics } from '../hooks/useMetrics';
import Chart from '../components/Chart';
import MetricCard from '../components/MetricCard';
import CloudSelector from '../components/CloudSelector';

const Dashboard: React.FC = () => {
    const { metrics, loading, error } = useMetrics();

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error loading metrics</div>;

    return (
        <div>
            <h1>Multi-Cloud Monitoring Dashboard</h1>
            <CloudSelector />
            <div className="metrics">
                {metrics.map(metric => (
                    <MetricCard key={metric.id} metric={metric} />
                ))}
            </div>
            <Chart data={metrics} />
        </div>
    );
};

export default Dashboard;