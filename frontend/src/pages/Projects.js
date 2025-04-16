import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import {
    Container,
    Typography,
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import ProjectForm from '../components/ProjectForm';

const Projects = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const { user } = useAuth();

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (err) {
            setError('Erreur lors du chargement des projets');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (projectId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
            try {
                await api.delete(`/projects/${projectId}`);
                setProjects(projects.filter(project => project.id !== projectId));
            } catch (err) {
                setError('Erreur lors de la suppression du projet');
                console.error(err);
            }
        }
    };

    const handleEdit = (project) => {
        setSelectedProject(project);
        setOpenForm(true);
    };

    const handleFormSubmit = async (projectData) => {
        try {
            if (selectedProject) {
                await api.put(`/projects/${selectedProject.id}`, projectData);
            } else {
                await api.post('/projects', projectData);
            }
            fetchProjects();
            setOpenForm(false);
            setSelectedProject(null);
        } catch (err) {
            setError('Erreur lors de la sauvegarde du projet');
            console.error(err);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'default';
            case 'in_progress':
                return 'primary';
            case 'completed':
                return 'success';
            case 'cancelled':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'En attente';
            case 'in_progress':
                return 'En cours';
            case 'completed':
                return 'Terminé';
            case 'cancelled':
                return 'Annulé';
            default:
                return status;
        }
    };

    if (loading) {
        return <Typography>Chargement...</Typography>;
    }

    return (
        <Container>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1">
                    Mes Projets
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenForm(true)}
                >
                    Nouveau Projet
                </Button>
            </Box>

            {error && (
                <Typography color="error" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Nom</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Date de début</TableCell>
                            <TableCell>Date de fin</TableCell>
                            <TableCell>Statut</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {projects.map((project) => (
                            <TableRow key={project.id}>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>{project.description}</TableCell>
                                <TableCell>{new Date(project.start_date).toLocaleDateString()}</TableCell>
                                <TableCell>{new Date(project.end_date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={getStatusLabel(project.status)}
                                        color={getStatusColor(project.status)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleEdit(project)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(project.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <ProjectForm
                open={openForm}
                onClose={() => {
                    setOpenForm(false);
                    setSelectedProject(null);
                }}
                onSubmit={handleFormSubmit}
                project={selectedProject}
            />
        </Container>
    );
};

export default Projects; 