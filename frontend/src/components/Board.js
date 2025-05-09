import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Button,
    TextField,
    CardContent,
    Dialog,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Avatar,
    Card,
    IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../api/axios';
import { API_ENDPOINTS } from '../config/api';
import { toast } from 'react-hot-toast';
import './Board.css';

const Board = () => {
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openColumnDialog, setOpenColumnDialog] = useState(false);
    const [newColumn, setNewColumn] = useState({ title: '' });
    const [draggedTask, setDraggedTask] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

    // Initialisation avec les colonnes fixes
    const defaultColumns = [
        { id: 'todo', identifier: 'todo', title: 'À faire', tasks: [], isFixed: true },
        { id: 'in_progress', identifier: 'in_progress', title: 'En cours', tasks: [], isFixed: true },
        { id: 'done', identifier: 'done', title: 'Terminé', tasks: [], isFixed: true }
    ];
    const [columns, setColumns] = useState(defaultColumns);

    const fetchBoardColumns = useCallback(async () => {
        if (!selectedProject) return;
           
        try {
            setLoading(true);
            setError(null);

            // Récupérer les colonnes et leurs tâches directement depuis l'API
            const response = await api.get(API_ENDPOINTS.board(selectedProject));
            setColumns(response.data);
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Trop de requêtes. Veuillez patienter quelques instants...');
                toast.error('Trop de requêtes. Veuillez patienter quelques instants...');
            } else {
                console.error('Erreur lors du chargement du tableau:', err);
                setError('Erreur lors du chargement du tableau');
                toast.error('Erreur lors du chargement du tableau');
            }
        } finally {
            setLoading(false);
        }
    }, [selectedProject]);

    const fetchProjects = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.projectList);
            setProjects(response.data);
            if (response.data.length > 0 && !selectedProject) {
                setSelectedProject(response.data[0].id);
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Trop de requêtes. Veuillez patienter quelques instants...');
                toast.error('Trop de requêtes. Veuillez patienter quelque instants...');
            } else {
                setError('Erreur lors du chargement des projets');
                toast.error('Erreur lors du chargement des projets');
            }
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    useEffect(() => {
        let timeoutId;
        
        if (selectedProject) {
            // Add a small delay before fetching to prevent rapid successive calls
            timeoutId = setTimeout(() => {
                fetchBoardColumns();
            }, 300);
        }

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }, [selectedProject, fetchBoardColumns]);

    const handleProjectChange = (event) => { // Handle project selection change
        setSelectedProject(event.target.value);
    };

    const handleDragStart = (e, task, columnId) => { // Handle drag start event
        setDraggedTask({
            task,
            sourceColumnId: columnId
        });
        e.target.classList.add('dragging');
    };

    const handleDragEnd = (e) => { // Handle drag end event
        e.target.classList.remove('dragging');
        setDragOverColumn(null);
    };

    const handleDragOver = (e, columnId) => { // Handle drag over event
        e.preventDefault();
        setDragOverColumn(columnId);
    };

    const handleDrop = async (e, columnIdentifier) => { // Handle drop event
        if (!draggedTask || draggedTask.sourceColumnId === columnIdentifier) {
            return;
        }

        try { // Update task status in the backend
            await api.patch(
                API_ENDPOINTS.updateTaskStatus(draggedTask.task.id),
                { status: columnIdentifier }
            );

            // Mettre à jour l'état local
            const updatedColumns = columns.map(column => {
                if (column.identifier === draggedTask.sourceColumnId) {
                    return {
                        ...column,
                        tasks: column.tasks.filter(t => t.id !== draggedTask.task.id)
                    };
                }
                if (column.identifier === columnIdentifier) {
                    return {
                        ...column,
                        tasks: [...column.tasks, { ...draggedTask.task, status: columnIdentifier }]
                    };
                }
                return column;
            });

            setColumns(updatedColumns);
            toast.success('Tâche déplacée avec succès');
        } catch (err) {
            toast.error('Erreur lors du déplacement de la tâche');
        } finally {
            setDraggedTask(null);
            setDragOverColumn(null);
        }
    };

    const handleAddColumn = async () => {
        if (!newColumn.title) return;

        try {
            const response = await api.post(API_ENDPOINTS.board(selectedProject), {
                title: newColumn.title
            });

            setColumns([...columns, response.data]);
            setNewColumn({ title: '' });
            setOpenColumnDialog(false);
            toast.success('Colonne ajoutée avec succès');
        } catch (err) {
            toast.error('Erreur lors de l\'ajout de la colonne');
        }
    };

    const handleDeleteColumn = async (columnId) => {
        const column = columns.find(col => col.id === columnId);
        if (column?.isFixed) {
            toast.error('Impossible de supprimer une colonne fixe');
            return;
        }

        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette colonne ?')) {
            return;
        }

        try {
            await api.delete(API_ENDPOINTS.boardColumn(selectedProject, columnId));
            setColumns(columns.filter(col => col.id !== columnId));
            toast.success('Colonne supprimée avec succès');
        } catch (err) {
            toast.error('Erreur lors de la suppression de la colonne');
        }
    };

    if (loading) return (
        <Box p={3} display="flex" justifyContent="center">
            <Typography>Chargement du tableau...</Typography>
        </Box>
    );

    if (error) return (
        <Box p={3} color="error.main">
            <Typography>{error}</Typography>
        </Box>
    );

    return (
        <div className="board-container">
            <Box className="board-header">
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                    <Typography variant="h4">Tableau Kanban</Typography>
                    <Box display="flex" gap={2}>
                        <FormControl style={{ minWidth: 200 }}>
                            <InputLabel>Projet</InputLabel>
                            <Select
                                value={selectedProject}
                                label="Projet"
                                onChange={handleProjectChange}
                            >
                                {projects.map(project => (
                                    <MenuItem key={project.id} value={project.id}>
                                        {project.title}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddIcon />}
                            onClick={() => setOpenColumnDialog(true)}
                        >
                            Ajouter une colonne
                        </Button>
                    </Box>
                </Box>
            </Box>

            <div className="board-columns">
                {columns.map(column => (
                    <div
                        key={column.id}
                        className={`board-column ${dragOverColumn === column.identifier ? 'drag-over' : ''}`}
                        onDragOver={(e) => handleDragOver(e, column.identifier)}
                        onDrop={(e) => handleDrop(e, column.identifier)}
                    >
                        <div className="column-header">
                            <Typography className="column-title">
                                {column.title} ({column.tasks?.length || 0})
                            </Typography>
                            <div className="column-actions">
                                <IconButton size="small" onClick={() => handleDeleteColumn(column.id)}>
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </div>
                        </div>
                        <div className="column-content">
                            {column.tasks?.map(task => (
                                <Card
                                    key={task.id}
                                    className={`task-card priority-${task.priority}`}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, task, column.identifier)}
                                    onDragEnd={handleDragEnd}
                                >
                                    <CardContent>
                                        <Typography className="task-title">
                                            {task.title}
                                        </Typography>
                                        {task.description && (
                                            <Typography className="task-description">
                                                {task.description}
                                            </Typography>
                                        )}
                                        <div className="task-meta">
                                            <div>
                                                <Chip
                                                    size="small"
                                                    label={task.priority}
                                                    color={
                                                        task.priority === 'high' ? 'error' :
                                                        task.priority === 'medium' ? 'warning' : 'success'
                                                    }
                                                />
                                            </div>
                                            {task.assignee && (
                                                <Avatar
                                                    sx={{ width: 24, height: 24, fontSize: '0.8rem' }}
                                                    alt={task.assignee.name}
                                                >
                                                    {task.assignee.name.charAt(0)}
                                                </Avatar>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={openColumnDialog} onClose={() => setOpenColumnDialog(false)}>
                <Box p={3}>
                    <Typography variant="h6" mb={2}>Nouvelle colonne</Typography>
                    <TextField
                        fullWidth
                        label="Titre de la colonne"
                        value={newColumn.title}
                        onChange={(e) => setNewColumn({ title: e.target.value })}
                        margin="normal"
                    />
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                        <Button onClick={() => setOpenColumnDialog(false)} sx={{ mr: 1 }}>
                            Annuler
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddColumn}
                        >
                            Sauvegarder
                        </Button>
                    </Box>
                </Box>
            </Dialog>
        </div>
    );
};

export default Board;