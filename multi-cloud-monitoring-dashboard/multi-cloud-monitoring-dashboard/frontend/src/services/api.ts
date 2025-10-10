import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const fetchMetrics = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/metrics`);
        return response.data;
    } catch (error) {
        console.error('Error fetching metrics:', error);
        throw error;
    }
};

export const fetchAlerts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/alerts`);
        return response.data;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        throw error;
    }
};

export const authenticateUser = async (credentials) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
        return response.data;
    } catch (error) {
        console.error('Error authenticating user:', error);
        throw error;
    }
};