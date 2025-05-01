import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import { testApiConnection, testAuthConnection } from '../utils/apiTest';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    LinearProgress,
    Chip,
    IconButton,
    useTheme,
} from '@mui/material';
import {
    Assignment as TaskIcon,
    Folder as ProjectIcon,
    Group as TeamIcon,
    TrendingUp as TrendingIcon,
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon, color, trend }) => (
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                    <Typography color="textSecondary" gutterBottom>
                        {title}
                    </Typography>
                    <Typography variant="h4" component="div">
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        backgroundColor: `${color}.light`,
                        borderRadius: '50%',
                        p: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    {icon}
                </Box>
            </Box>
            {trend && (
                <Box display="flex" alignItems="center" mt={2}>
                    <TrendingIcon
                        sx={{
                            color: trend > 0 ? 'success.main' : 'error.main',
                            transform: trend > 0 ? 'rotate(0deg)' : 'rotate(180deg)',
                        }}
                    />
                    <Typography
                        variant="body2"
                        sx={{
                            color: trend > 0 ? 'success.main' : 'error.main',
                            ml: 1,
                        }}
                    >
                        {Math.abs(trend)}% from last month
                    </Typography>
                </Box>
            )}
        </CardContent>
    </Card>
);

const ProjectCard = ({ project }) => {
    const theme = useTheme();
    const progress = (project.completedTasks / project.totalTasks) * 100;

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{project.name}</Typography>
                    <Chip
                        label={project.status}
                        color={
                            project.status === 'completed'
                                ? 'success'
                                : project.status === 'in_progress'
                                ? 'warning'
                                : 'default'
                        }
                        size="small"
                    />
                </Box>
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                    {project.description}
                </Typography>
                <Box sx={{ mt: 2 }}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                        <Typography variant="body2">Progress</Typography>
                        <Typography variant="body2">{Math.round(progress)}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: theme.palette.grey[200],
                            '& .MuiLinearProgress-bar': {
                                borderRadius: 4,
                            },
                        }}
                    />
                </Box>
                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" color="textSecondary">
                        Due: {new Date(project.due_date).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {project.completedTasks}/{project.totalTasks} tasks
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const TaskCard = ({ task }) => {
    const theme = useTheme();

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{task.title}</Typography>
                    <Chip
                        label={task.priority}
                        color={
                            task.priority === 'high'
                                ? 'error'
                                : task.priority === 'medium'
                                ? 'warning'
                                : 'success'
                        }
                        size="small"
                    />
                </Box>
                <Typography color="textSecondary" sx={{ mt: 1 }}>
                    {task.description}
                </Typography>
                <Box display="flex" justifyContent="space-between" mt={2}>
                    <Typography variant="body2" color="textSecondary">
                        Project: {task.project_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Due: {new Date(task.due_date).toLocaleDateString()}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const { token } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState({
        api: false,
        auth: false
    });
    const [stats, setStats] = useState({
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        teamMembers: 0,
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);

    useEffect(() => {
        checkConnections();
        fetchDashboardData();
    }, []);

    const checkConnections = async () => {
        console.log('Checking connections...');
        const apiStatus = await testApiConnection();
        const authStatus = await testAuthConnection(token);
        
        console.log('Connection status:', { apiStatus, authStatus });
        
        setConnectionStatus({
            api: apiStatus,
            auth: authStatus
        });

        if (!apiStatus || !authStatus) {
            setError('Connection to backend failed. Please check your server connection.');
        }
    };

    const fetchDashboardData = async () => {
        console.log('Fetching dashboard data...');
        if (!token) {
            console.error('No token found');
            setError('No authentication token found');
            setLoading(false);
            return;
        }

        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            };

            console.log('Making API calls with headers:', headers);

            const [statsResponse, projectsResponse, tasksResponse] = await Promise.all([
                fetch(API_ENDPOINTS.dashboardStats, { headers }),
                fetch(API_ENDPOINTS.recentProjects, { headers }),
                fetch(API_ENDPOINTS.upcomingTasks, { headers }),
            ]);

            console.log('API Responses:', {
                stats: statsResponse.status,
                projects: projectsResponse.status,
                tasks: tasksResponse.status
            });

            if (!statsResponse.ok || !projectsResponse.ok || !tasksResponse.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const [statsData, projectsData, tasksData] = await Promise.all([
                statsResponse.json(),
                projectsResponse.json(),
                tasksResponse.json(),
            ]);

            console.log('Received data:', { statsData, projectsData, tasksData });

            setStats(statsData);
            setRecentProjects(projectsData);
            setUpcomingTasks(tasksData);
        } catch (err) {
            console.error('Dashboard data fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleError = (error) => {
        if (error.response) {
            toast.error(error.response.data.message);
        } else if (error.request) {
            toast.error('Erreur de connexion au serveur');
        } else {
            toast.error('Une erreur est survenue');
        }
    };

    const validateForm = (data) => {
        const errors = {};
        if (!data.name) errors.name = 'Le nom est requis';
        if (!data.email) errors.email = 'L\'email est requis';
        return errors;
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Alert severity="error">
                    {error}
                    <Box mt={2}>
                        <Typography variant="body2">Connection Status:</Typography>
                        <Typography variant="body2">API Connection: {connectionStatus.api ? '✅' : '❌'}</Typography>
                        <Typography variant="body2">Auth Connection: {connectionStatus.auth ? '✅' : '❌'}</Typography>
                    </Box>
                </Alert>
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Projects"
                        value={stats.totalProjects}
                        icon={<ProjectIcon sx={{ color: 'primary.main' }} />}
                        color="primary"
                        trend={5}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total Tasks"
                        value={stats.totalTasks}
                        icon={<TaskIcon sx={{ color: 'secondary.main' }} />}
                        color="secondary"
                        trend={-2}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Completed Tasks"
                        value={stats.completedTasks}
                        icon={<TaskIcon sx={{ color: 'success.main' }} />}
                        color="success"
                        trend={8}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Team Members"
                        value={stats.teamMembers}
                        icon={<TeamIcon sx={{ color: 'info.main' }} />}
                        color="info"
                        trend={3}
                    />
                </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Recent Projects
                    </Typography>
                    <Grid container spacing={2}>
                        {recentProjects.map((project) => (
                            <Grid item xs={12} key={project.id}>
                                <ProjectCard project={project} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Typography variant="h5" gutterBottom>
                        Upcoming Tasks
                    </Typography>
                    <Grid container spacing={2}>
                        {upcomingTasks.map((task) => (
                            <Grid item xs={12} key={task.id}>
                                <TaskCard task={task} />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 