import React from 'react';

const CloudSelector: React.FC<{ onSelect: (cloud: string) => void }> = ({ onSelect }) => {
    const clouds = ['AWS', 'Azure', 'GCP'];

    return (
        <div>
            <h2>Select Cloud Provider</h2>
            <select onChange={(e) => onSelect(e.target.value)}>
                <option value="">Select a cloud provider</option>
                {clouds.map((cloud) => (
                    <option key={cloud} value={cloud}>
                        {cloud}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CloudSelector;