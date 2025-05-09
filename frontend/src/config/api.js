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
    
    // Project team management
    projectInviteMember: (projectId) => `${API_BASE_URL}/projects/${projectId}/team/invite`,
    projectTeam: (projectId) => `${API_BASE_URL}/projects/${projectId}/team`,
    teamList: `${API_BASE_URL}/team`,

    // Tasks endpoints
    taskList: `${API_BASE_URL}/tasks`,
    taskDetail: (id) => `${API_BASE_URL}/tasks/${id}`,
    updateTaskStatus: (id) => `${API_BASE_URL}/tasks/${id}/status`,

    // Board endpoints
    board: (projectId) => `${API_BASE_URL}/projects/${projectId}/board`,
    boardColumn: (projectId, columnId) => `${API_BASE_URL}/projects/${projectId}/board/columns/${columnId}`,
    
    // Reports endpoints
    reports: `${API_BASE_URL}/reports`,
    projectProgress: (projectId) => `${API_BASE_URL}/reports/projects/${projectId}/progress`,
    teamPerformance: (projectId) => `${API_BASE_URL}/reports/projects/${projectId}/team-performance`
};

export const getHeaders = (token) => ({
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
    'X-Requested-With': 'XMLHttpRequest'
});