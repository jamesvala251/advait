import axios from 'axios';

// const API_URL = '/api';
const API_URL = 'http://localhost:8000/api';


const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Add request interceptor for authentication
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API endpoints
export const truckService = {
    getAll: () => api.get('/trucks'),
    create: (data) => api.post('/trucks', data),
    update: (id, data) => api.put(`/trucks/${id}`, data),
    delete: (id) => api.delete(`/trucks/${id}`),
    restore: (id) => api.post(`/trucks/${id}/restore`)
};

export const tripService = {
    getAll: () => api.get('/trips'),
    create: (data) => api.post('/trips', data),
    update: (id, data) => api.put(`/trips/${id}`, data),
    delete: (id) => api.delete(`/trips/${id}`)
};

export const expenseService = {
    getAll: () => api.get('/expenses'),
    create: (data) => api.post('/expenses', data),
    update: (id, data) => api.put(`/expenses/${id}`, data),
    delete: (id) => api.delete(`/expenses/${id}`)
};

export const reportService = {
    getProfitLoss: () => api.get('/reports/profit-loss'),
    getDriverReports: () => api.get('/reports/driver'),
    getTruckReports: () => api.get('/reports/truck')
};

export const driverService = {
    getAll: () => api.get('/drivers')
};

export const driverReportService = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.driver_id) params.append('driver_id', filters.driver_id);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        
        const queryString = params.toString();
        return api.get(`/reports/driver-details${queryString ? `?${queryString}` : ''}`);
    }
};

export const tripProfitLossService = {
    getAll: (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        if (filters.driver_id) params.append('driver_id', filters.driver_id);
        if (filters.truck_id) params.append('truck_id', filters.truck_id);
        
        const queryString = params.toString();
        return api.get(`/reports/trip-profit-loss${queryString ? `?${queryString}` : ''}`);
    }
};

export const truckExpenseService = {
    getAll: (filters = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });
        return api.get(`/truck-expenses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`);
    },
    getTrucks: () => api.get('/trucks'),
    create: (data) => api.post('/truck-expenses', data),
    update: (id, data) => api.put(`/truck-expenses/${id}`, data),
    delete: (id) => api.delete(`/truck-expenses/${id}`),
    getEditData: (id) => api.get(`/truck-expenses/${id}/edit`)
};

export const loadDetailService = {
    getAll: () => api.get('/load-details'),
    create: (data) => api.post('/load-details', data),
    update: (id, data) => api.put(`/load-details/${id}`, data),
    delete: (id) => api.delete(`/load-details/${id}`),
    getById: (id) => api.get(`/load-details/${id}`)
};

export default api; 