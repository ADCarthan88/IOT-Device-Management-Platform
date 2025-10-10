import React from 'react';
import { Line } from 'react-chartjs-2';

const Chart = ({ data }) => {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Metrics',
                data: data.values,
                fill: false,
                backgroundColor: 'rgba(75,192,192,0.4)',
                borderColor: 'rgba(75,192,192,1)',
            },
        ],
    };

    const options = {
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return <Line data={chartData} options={options} />;
};

export default Chart;