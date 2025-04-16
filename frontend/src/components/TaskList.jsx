import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    IconButton,
    Menu,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Tooltip,
} from '@mui/material';
import {
    Add as AddIcon,
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import axios from '../config/axios';
import CommentList from './CommentList';

const TaskList = ({ projectId }) => {
    const [tasks, setTasks] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedTask, setSelectedTask] = useState(null);
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        status: 'todo',
        due_date: '',
        assigned_to: '',
        priority: 0
    });

    useEffect(() => {
        fetchTasks();
    }, [projectId]);

    const fetchTasks = async () => {
        try {
            const response = await axios.get(`/api/projects/${projectId}/tasks`);
            setTasks(response.data);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const handleOpenDialog = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                description: task.description,
                status: task.status,
                due_date: task.due_date,
                assigned_to: task.assigned_to,
                priority: task.priority
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                description: '',
                status: 'todo',
                due_date: '',
                assigned_to: '',
                priority: 0
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setEditingTask(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await axios.put(`/api/projects/${projectId}/tasks/${editingTask.id}`, formData);
            } else {
                await axios.post(`/api/projects/${projectId}/tasks`, formData);
            }
            fetchTasks();
            handleCloseDialog();
        } catch (error) {
            console.error('Error saving task:', error);
        }
    };

    const handleDelete = async (taskId) => {
        try {
            await axios.delete(`/api/projects/${projectId}/tasks/${taskId}`);
            fetchTasks();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    const handleMenuOpen = (event, task) => {
        setAnchorEl(event.currentTarget);
        setSelectedTask(task);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedTask(null);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'todo':
                return 'default';
            case 'in_progress':
                return 'primary';
            case 'completed':
                return 'success';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 2:
                return 'error';
            case 1:
                return 'warning';
            default:
                return 'info';
        }
    };

    const renderTask = (task) => (
        <Grid item xs={12} sm={6} md={4} key={task.id}>
            <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                sx={{
                    height: '100%',
                    borderRadius: 2,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                    }
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {task.title}
                        </Typography>
                        <IconButton 
                            onClick={(e) => handleMenuOpen(e, task)}
                            sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' }
                            }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    </Box>

                    <Typography 
                        color="text.secondary" 
                        sx={{ 
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                        }}
                    >
                        {task.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                        <Chip
                            label={task.status}
                            color={getStatusColor(task.status)}
                            size="small"
                            sx={{ 
                                borderRadius: 1,
                                fontWeight: 500
                            }}
                        />
                        <Chip
                            label={`Priorité ${task.priority}`}
                            color={getPriorityColor(task.priority)}
                            size="small"
                            sx={{ 
                                borderRadius: 1,
                                fontWeight: 500
                            }}
                        />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                        <Tooltip title="Date d'échéance">
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <CalendarIcon sx={{ mr: 0.5, fontSize: 20 }} />
                                <Typography variant="body2">
                                    {task.due_date || 'Non définie'}
                                </Typography>
                            </Box>
                        </Tooltip>

                        {task.assigned_user && (
                            <Tooltip title="Assigné à">
                                <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                    <PersonIcon sx={{ mr: 0.5, fontSize: 20 }} />
                                    <Typography variant="body2">
                                        {task.assigned_user.name}
                                    </Typography>
                                </Box>
                            </Tooltip>
                        )}
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <CommentList taskId={task.id} />
                    </Box>
                </CardContent>
            </MotionCard>
        </Grid>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5">Tâches</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Nouvelle tâche
                </Button>
            </Box>

            <Grid container spacing={3}>
                {tasks.map(renderTask)}
            </Grid>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => {
                    handleOpenDialog(selectedTask);
                    handleMenuClose();
                }}>
                    <EditIcon sx={{ mr: 1 }} /> Modifier
                </MenuItem>
                <MenuItem onClick={() => {
                    handleDelete(selectedTask.id);
                    handleMenuClose();
                }}>
                    <DeleteIcon sx={{ mr: 1 }} /> Supprimer
                </MenuItem>
            </Menu>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {editingTask ? 'Modifier la tâche' : 'Nouvelle tâche'}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Titre"
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
                            <InputLabel>Statut</InputLabel>
                            <Select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                label="Statut"
                            >
                                <MenuItem value="todo">À faire</MenuItem>
                                <MenuItem value="in_progress">En cours</MenuItem>
                                <MenuItem value="completed">Terminé</MenuItem>
                            </Select>
                        </FormControl>
                        <TextField
                            margin="dense"
                            label="Date d'échéance"
                            type="date"
                            fullWidth
                            value={formData.due_date}
                            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormControl fullWidth margin="dense">
                            <InputLabel>Priorité</InputLabel>
                            <Select
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                label="Priorité"
                            >
                                <MenuItem value={0}>Basse</MenuItem>
                                <MenuItem value={1}>Moyenne</MenuItem>
                                <MenuItem value={2}>Haute</MenuItem>
                            </Select>
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Annuler</Button>
                        <Button type="submit" variant="contained">
                            {editingTask ? 'Modifier' : 'Créer'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default TaskList; 