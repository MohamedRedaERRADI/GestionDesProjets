import React, { useState, useEffect, useCallback } from 'react';
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
    TextField
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';

const Projects = () => {
    const { token } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'pending'
    });

    const fetchProjects = useCallback(async () => {
        if (!token) {
            console.error('No token available');
            setError('No authentication token found');
            setLoading(false);
            return;
        }

        try {
            console.log('Fetching projects with token:', token);
            console.log('API URL:', API_ENDPOINTS.projectList);
            
            const response = await fetch(API_ENDPOINTS.projectList, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });

            console.log('Projects response:', {
                status: response.status,
                statusText: response.statusText,
                headers: Object.fromEntries(response.headers.entries())
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                console.error('Error response:', errorData);
                throw new Error(errorData?.message || 'Failed to fetch projects');
            }

            const data = await response.json();
            console.log('Projects data:', data);
            setProjects(data);
        } catch (err) {
            console.error('Projects fetch error:', err);
            setError(err.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        console.log('Projects component mounted');
        fetchProjects();
    }, [fetchProjects]);

    const handleOpenDialog = (project = null) => {
        setCurrentProject(project);
        if (project) {
            setFormData({
                name: project.name,
                description: project.description,
                start_date: project.start_date,
                end_date: project.end_date,
                status: project.status
            });
        } else {
            setFormData({
                name: '',
                description: '',
                start_date: '',
                end_date: '',
                status: 'pending'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentProject(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = currentProject 
                ? `${API_ENDPOINTS.projectDetail(currentProject.id)}`
                : API_ENDPOINTS.projectList;
            
            const method = currentProject ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to save project');
            }

            await fetchProjects();
            handleCloseDialog();
        } catch (err) {
            console.error('Save project error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId) => {
        if (!window.confirm('Are you sure you want to delete this project?')) {
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_ENDPOINTS.projectDetail(projectId)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete project');
            }

            await fetchProjects();
        } catch (err) {
            console.error('Delete project error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
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
                <Typography variant="h4">Projects</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    New Project
                </Button>
            </Box>

            <Grid container spacing={3}>
                {projects.map((project) => (
                    <Grid item xs={12} sm={6} md={4} key={project.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography variant="h6">{project.name}</Typography>
                                    <Box>
                                        <IconButton onClick={() => handleOpenDialog(project)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(project.id)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography color="textSecondary" gutterBottom>
                                    {project.description}
                                </Typography>
                                <Typography variant="body2">
                                    Status: {project.status}
                                </Typography>
                                <Typography variant="body2">
                                    Start: {new Date(project.start_date).toLocaleDateString()}
                                </Typography>
                                <Typography variant="body2">
                                    End: {new Date(project.end_date).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>
                    {currentProject ? 'Edit Project' : 'New Project'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            margin="normal"
                            multiline
                            rows={4}
                        />
                        <TextField
                            fullWidth
                            label="Start Date"
                            name="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={handleChange}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="End Date"
                            name="end_date"
                            type="date"
                            value={formData.end_date}
                            onChange={handleChange}
                            margin="normal"
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Status"
                            name="status"
                            select
                            value={formData.status}
                            onChange={handleChange}
                            margin="normal"
                            SelectProps={{ native: true }}
                        >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Projects; 