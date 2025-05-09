import React, { useState, useEffect } from 'react';
import {
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';

const TaskForm = ({ open, onClose, onSubmit, task, projects, formData, setFormData }) => {
  // Si le formData est fourni, l'utiliser, sinon initialiser un nouveau state
  const [localFormData, setLocalFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    projectId: '',
  });

  // Définir la donnée à utiliser (soit locale soit passée via props)
  const currentFormData = formData || localFormData;
  const updateFormData = setFormData || setLocalFormData;

  useEffect(() => {
    if (task) {
      updateFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.due_date ? task.due_date.split('T')[0] : '',
        priority: task.priority || 'medium',
        status: task.status || 'pending',
        projectId: task.project_id || '',
      });
    } else {
      updateFormData({
        title: '',
        description: '',
        dueDate: '',
        priority: 'medium',
        status: 'pending',
        projectId: '',
      });
    }
  }, [task, updateFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          name="title"
          label="Titre"
          type="text"
          fullWidth
          value={currentFormData.title}
          onChange={handleChange}
          required
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={currentFormData.description}
          onChange={handleChange}
        />
        <TextField
          margin="dense"
          name="dueDate"
          label="Date d'échéance"
          type="date"
          fullWidth
          value={currentFormData.dueDate}
          onChange={handleChange}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl fullWidth margin="dense">
          <InputLabel>Projet</InputLabel>
          <Select
            name="projectId"
            value={currentFormData.projectId}
            onChange={handleChange}
            required
          >
            {Array.isArray(projects) && projects.length > 0 ? (
              projects.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.title}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                Aucun projet disponible
              </MenuItem>
            )}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Priorité</InputLabel>
          <Select
            name="priority"
            value={currentFormData.priority}
            onChange={handleChange}
          >
            <MenuItem value="low">Basse</MenuItem>
            <MenuItem value="medium">Moyenne</MenuItem>
            <MenuItem value="high">Haute</MenuItem>
          </Select>
        </FormControl>
        <FormControl fullWidth margin="dense">
          <InputLabel>Statut</InputLabel>
          <Select
            name="status"
            value={currentFormData.status}
            onChange={handleChange}
          >
            <MenuItem value="pending">En attente</MenuItem>
            <MenuItem value="in_progress">En cours</MenuItem>
            <MenuItem value="completed">Terminée</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button type="submit" variant="contained" color="primary">
          {task ? 'Modifier' : 'Créer'}
        </Button>
      </DialogActions>
    </>
  );
};

export default TaskForm;