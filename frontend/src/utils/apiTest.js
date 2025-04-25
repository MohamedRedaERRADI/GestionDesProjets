import { API_ENDPOINTS } from '../config/api';

export const testApiConnection = async () => {
    try {
        const response = await fetch(API_ENDPOINTS.dashboardStats, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('API Connection successful');
        return true;
    } catch (error) {
        console.error('API Connection failed:', error);
        return false;
    }
};

export const testAuthConnection = async (token) => {
    try {
        const response = await fetch(API_ENDPOINTS.user, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('Auth Connection successful');
        return true;
    } catch (error) {
        console.error('Auth Connection failed:', error);
        return false;
    }
}; 