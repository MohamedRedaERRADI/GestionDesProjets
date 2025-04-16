import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    MenuItem,
    Grid,
} from '@mui/material';

const ProjectForm = ({ open, onClose, onSubmit, project }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        status: 'pending',
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name,
                description: project.description || '',
                start_date: project.start_date.split('T')[0],
                end_date: project.end_date.split('T')[0],
                status: project.status,
            });
        } else {
            setFormData({
                name: '',
                description: '',
                start_date: '',
                end_date: '',
                status: 'pending',
            });
        }
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                {project ? 'Modifier le projet' : 'Nouveau projet'}
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                label="Nom du projet"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="date"
                                label="Date de début"
                                name="start_date"
                                value={formData.start_date}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                required
                                fullWidth
                                type="date"
                                label="Date de fin"
                                name="end_date"
                                value={formData.end_date}
                                onChange={handleChange}
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                select
                                label="Statut"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                            >
                                <MenuItem value="pending">En attente</MenuItem>
                                <MenuItem value="in_progress">En cours</MenuItem>
                                <MenuItem value="completed">Terminé</MenuItem>
                                <MenuItem value="cancelled">Annulé</MenuItem>
                            </TextField>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Annuler</Button>
                    <Button type="submit" variant="contained" color="primary">
                        {project ? 'Modifier' : 'Créer'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default ProjectForm; 