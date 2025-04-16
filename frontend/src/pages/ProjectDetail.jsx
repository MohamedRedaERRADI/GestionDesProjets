import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Paper,
    Grid,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
import { 
    Edit as EditIcon, 
    Delete as DeleteIcon,
    Description as DescriptionIcon,
    CalendarToday as CalendarIcon,
    Person as PersonIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../config/axios';
import TaskList from '../components/TaskList';

const MotionPaper = motion(Paper);

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });

    useEffect(() => {
        fetchProject();
    }, [id]);

    const fetchProject = async () => {
        try {
            const response = await axios.get(`/api/projects/${id}`);
            setProject(response.data);
            setFormData({
                name: response.data.name,
                description: response.data.description,
            });
        } catch (error) {
            console.error('Error fetching project:', error);
        }
    };

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`/api/projects/${id}`, formData);
            fetchProject();
            handleCloseDialog();
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            try {
                await axios.delete(`/api/projects/${id}`);
                navigate('/projects');
            } catch (error) {
                console.error('Error deleting project:', error);
            }
        }
    };

    if (!project) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <Typography variant="h6">Chargement...</Typography>
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                elevation={0}
                sx={{
                    p: 4,
                    mb: 4,
                    borderRadius: 3,
                    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                        <Typography 
                            variant="h3" 
                            sx={{ 
                                fontWeight: 700,
                                mb: 1,
                                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}
                        >
                            {project.name}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <Chip
                                icon={<PersonIcon />}
                                label={`Créé par ${project.creator.name}`}
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                            />
                            <Chip
                                icon={<CalendarIcon />}
                                label={`Créé le ${new Date(project.created_at).toLocaleDateString()}`}
                                variant="outlined"
                                sx={{ borderRadius: 1 }}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={handleOpenDialog}
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                borderRadius: 2,
                                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2, #1E88E5)',
                                }
                            }}
                        >
                            Modifier
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleDelete}
                            sx={{ borderRadius: 2 }}
                        >
                            Supprimer
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ my: 3 }} />

                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                    <Avatar sx={{ 
                        bgcolor: 'primary.main',
                        width: 56, 
                        height: 56,
                        mt: 1
                    }}>
                        <DescriptionIcon />
                    </Avatar>
                    <Box>
                        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                            Description
                        </Typography>
                        <Typography 
                            variant="body1" 
                            sx={{ 
                                color: 'text.secondary',
                                lineHeight: 1.7
                            }}
                        >
                            {project.description}
                        </Typography>
                    </Box>
                </Box>
            </MotionPaper>

            <TaskList projectId={id} />

            <Dialog 
                open={openDialog} 
                onClose={handleCloseDialog} 
                maxWidth="sm" 
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                    }
                }}
            >
                <DialogTitle sx={{ 
                    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                    color: 'white',
                    borderRadius: '12px 12px 0 0'
                }}>
                    Modifier le projet
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent sx={{ pt: 3 }}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Nom"
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            sx={{ mb: 2 }}
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
                    </DialogContent>
                    <DialogActions sx={{ p: 3 }}>
                        <Button 
                            onClick={handleCloseDialog}
                            sx={{ borderRadius: 2 }}
                        >
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained"
                            sx={{
                                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                                borderRadius: 2,
                                boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                                '&:hover': {
                                    background: 'linear-gradient(45deg, #1976D2, #1E88E5)',
                                }
                            }}
                        >
                            Modifier
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Container>
    );
};

export default ProjectDetail; 