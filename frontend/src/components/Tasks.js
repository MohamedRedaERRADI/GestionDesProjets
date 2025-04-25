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
        project_id: '',
        due_date: '',
        priority: 'medium',
        status: 'pending'
    });

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        } catch (err) {
            console.error('Data fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (task = null) => {
        if (task) {
            setCurrentTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                project_id: task.project_id,
                due_date: task.due_date,
                priority: task.priority,
                status: task.status
            });
        } else {
            setCurrentTask(null);
            setFormData({
                title: '',
                description: '',
                project_id: '',
                due_date: '',
                priority: 'medium',
                status: 'pending'
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
            project_id: '',
            due_date: '',
            priority: 'medium',
            status: 'pending'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
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
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save task');
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
                    <Grid item xs={12} sm={6} md={4} key={task.id}>
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
                                    Project: {projects.find(p => p.id === task.project_id)?.name || 'Unknown'}
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
                    {currentTask ? 'Edit Task' : 'New Task'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Task Title"
                            fullWidth
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                        <TextField
                            margin="dense"
                            label="Description"
                            fullWidth
                            multiline
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Project</InputLabel>
                            <Select
                                value={formData.project_id}
                                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                                required
                            >
                                {projects.map(project => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="Due Date"
                            type="date"
                            fullWidth
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            >
                                <MenuItem value="low">Low</MenuItem>
                                <MenuItem value="medium">Medium</MenuItem>
                                <MenuItem value="high">High</MenuItem>
                            </Select>
                        </FormControl>
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            >
                                <MenuItem value="pending">Pending</MenuItem>
                                <MenuItem value="in_progress">In Progress</MenuItem>
                                <MenuItem value="completed">Completed</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {currentTask ? 'Update' : 'Create'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Tasks; 