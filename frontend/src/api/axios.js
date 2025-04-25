import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
});

// Intercepteur pour ajouter le token aux requêtes
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

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 419) {
            // Si on reçoit une erreur CSRF, on récupère un nouveau token et on réessaie
            await axios.get('http://localhost:8000/sanctum/csrf-cookie', {
                withCredentials: true
            });
            return api(error.config);
        }
        return Promise.reject(error);
    }
);

export default api; 