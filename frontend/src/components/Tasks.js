import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_ENDPOINTS } from '../config/api';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import TaskForm from './TaskForm';

const Tasks = () => {
    const { token } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentTask, setCurrentTask] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending',
        projectId: '',
    });

    const fetchData = async () => {
        if (!token) {
            setError('No authentication token found');
            setLoading(false);
            return;
        }

        try {
            const headers = {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            };

            const [tasksResponse, projectsResponse] = await Promise.all([
                fetch(API_ENDPOINTS.taskList, { headers }),
                fetch(API_ENDPOINTS.projectList, { headers })
            ]);

            if (!tasksResponse.ok || !projectsResponse.ok) {
                throw new Error('Failed to fetch data');
            }

            const [tasksData, projectsData] = await Promise.all([
                tasksResponse.json(),
                projectsResponse.json()
            ]);

            setTasks(tasksData);
            setProjects(projectsData);
            console.log('Projects loaded:', projectsData);
        } catch (err) {
            console.error('Data fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [token]); // Only re-run if token changes

    const handleOpenDialog = (task = null) => {
        if (task) {
            setCurrentTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                dueDate: task.due_date || '',
                priority: task.priority,
                status: task.status,
                projectId: task.project_id || '',
            });
        } else {
            setCurrentTask(null);
            setFormData({
                title: '',
                description: '',
                dueDate: '',
                priority: 'medium',
                status: 'pending',
                projectId: '',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentTask(null);
        setFormData({
            title: '',
            description: '',
            dueDate: '',
            priority: 'medium',
            status: 'pending',
            projectId: '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const apiData = {
                title: formData.title,
                description: formData.description,
                due_date: formData.dueDate,
                priority: formData.priority,
                status: formData.status,
                project_id: formData.projectId,
            };
            
            const url = currentTask
                ? API_ENDPOINTS.taskDetail(currentTask.id)
                : API_ENDPOINTS.taskList;
            
            const response = await fetch(url, {
                method: currentTask ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(apiData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to save task');
            }

            await fetchData();
            handleCloseDialog();
        } catch (err) {
            console.error('Task save error:', err);
            setError(err.message);
        }
    };

    const handleDelete = async (taskId) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                const response = await fetch(API_ENDPOINTS.taskDetail(taskId), {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to delete task');
                }

                await fetchData();
            } catch (err) {
                console.error('Task delete error:', err);
                setError(err.message);
            }
        }
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
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Tasks</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Task
                </Button>
            </Box>

            <Grid container spacing={3}>
                {tasks.map(task => (
                    <Grid xs={12} sm={6} md={4} key={task.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Box>
                                        <IconButton onClick={() => handleOpenDialog(task)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(task.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography color="textSecondary" gutterBottom>
                                    {task.description}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Project: {task.project?.title || 'Unknown'}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Due: {new Date(task.due_date).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: task.status === 'completed' ? 'success.main' : 'text.secondary'
                                        }}
                                    >
                                        Status: {task.status}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: task.priority === 'high' ? 'error.main' : 
                                                   task.priority === 'medium' ? 'warning.main' : 'text.secondary'
                                        }}
                                    >
                                        Priority: {task.priority}
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <TaskForm
                        formData={formData}
                        setFormData={setFormData}
                        projects={projects}
                        onSubmit={handleSubmit}
                        onClose={handleCloseDialog}
                        task={currentTask}
                    />
                </form>
            </Dialog>
        </Box>
    );
};

export default Tasks;