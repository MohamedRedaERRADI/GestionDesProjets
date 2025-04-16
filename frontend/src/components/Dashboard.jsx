import React, { useState, useEffect } from 'react';
import {
    Box,
    Grid,
    Paper,
    Typography,
    Card,
    CardContent,
    CardHeader,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    CircularProgress,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    Assignment as TaskIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    CalendarToday as CalendarIcon,
    TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';

const Dashboard = () => {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProjects: 0,
        activeProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        overdueTasks: 0,
    });
    const [recentProjects, setRecentProjects] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [projectsRes, tasksRes] = await Promise.all([
                    axios.get('/api/projects'),
                    axios.get('/api/tasks')
                ]);

                const projects = projectsRes.data;
                const tasks = tasksRes.data;

                // Calculer les statistiques
                setStats({
                    totalProjects: projects.length,
                    activeProjects: projects.filter(p => p.status === 'active').length,
                    totalTasks: tasks.length,
                    completedTasks: tasks.filter(t => t.status === 'completed').length,
                    overdueTasks: tasks.filter(t => 
                        new Date(t.due_date) < new Date() && t.status !== 'completed'
                    ).length,
                });

                // Projets récents (5 derniers)
                setRecentProjects(
                    projects
                        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                        .slice(0, 5)
                );

                // Tâches à venir (5 prochaines)
                setUpcomingTasks(
                    tasks
                        .filter(t => t.status !== 'completed')
                        .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                        .slice(0, 5)
                );

                setLoading(false);
            } catch (error) {
                console.error('Erreur lors du chargement du tableau de bord:', error);
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Tableau de Bord
            </Typography>

            {/* Statistiques */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Projets
                        </Typography>
                        <Typography variant="h4">
                            {stats.totalProjects}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stats.activeProjects} actifs
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Tâches
                        </Typography>
                        <Typography variant="h4">
                            {stats.totalTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stats.completedTasks} terminées
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            En retard
                        </Typography>
                        <Typography variant="h4" color="error">
                            {stats.overdueTasks}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            tâches à terminer
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Progression
                        </Typography>
                        <Typography variant="h4">
                            {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            des tâches terminées
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>

            {/* Projets récents et tâches à venir */}
            <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Projets Récents"
                            action={
                                <Tooltip title="Voir tous les projets">
                                    <IconButton>
                                        <TrendingUpIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                        <Divider />
                        <CardContent>
                            <List>
                                {recentProjects.map((project) => (
                                    <React.Fragment key={project.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                <TaskIcon />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={project.name}
                                                secondary={`Créé le ${format(new Date(project.created_at), 'PPP', { locale: fr })}`}
                                            />
                                            <Chip
                                                label={project.status}
                                                color={project.status === 'active' ? 'success' : 'default'}
                                                size="small"
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardHeader
                            title="Tâches à Venir"
                            action={
                                <Tooltip title="Voir le calendrier">
                                    <IconButton>
                                        <CalendarIcon />
                                    </IconButton>
                                </Tooltip>
                            }
                        />
                        <Divider />
                        <CardContent>
                            <List>
                                {upcomingTasks.map((task) => (
                                    <React.Fragment key={task.id}>
                                        <ListItem>
                                            <ListItemIcon>
                                                {new Date(task.due_date) < new Date() ? (
                                                    <WarningIcon color="error" />
                                                ) : (
                                                    <CheckCircleIcon color="primary" />
                                                )}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={task.title}
                                                secondary={`Échéance: ${format(new Date(task.due_date), 'PPP', { locale: fr })}`}
                                            />
                                            <Chip
                                                label={task.priority}
                                                color={
                                                    task.priority === 'high' ? 'error' :
                                                    task.priority === 'medium' ? 'warning' : 'success'
                                                }
                                                size="small"
                                            />
                                        </ListItem>
                                        <Divider />
                                    </React.Fragment>
                                ))}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Dashboard; 