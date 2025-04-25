const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
    // Auth endpoints
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    logout: `${API_BASE_URL}/auth/logout`,
    user: `${API_BASE_URL}/auth/user`,

    // Dashboard endpoints
    dashboardStats: `${API_BASE_URL}/dashboard/stats`,
    recentProjects: `${API_BASE_URL}/dashboard/recent-projects`,
    upcomingTasks: `${API_BASE_URL}/dashboard/upcoming-tasks`,

    // Projects endpoints
    projectList: `${API_BASE_URL}/projects`,
    projectDetail: (id) => `${API_BASE_URL}/projects/${id}`,
    projectTasks: (id) => `${API_BASE_URL}/projects/${id}/tasks`,

    // Tasks endpoints
    taskList: `${API_BASE_URL}/tasks`,
    taskDetail: (id) => `${API_BASE_URL}/tasks/${id}`,

    // Team endpoints
    teamList: `${API_BASE_URL}/team`,
    teamMember: (id) => `${API_BASE_URL}/team/${id}`,

    // Calendar endpoints
    events: `${API_BASE_URL}/calendar/events`,
    
    // Reports endpoints
    reports: `${API_BASE_URL}/reports`,
};

export const getHeaders = (token) => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Requested-With': 'XMLHttpRequest'
}); 