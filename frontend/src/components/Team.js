import React, { useState, useEffect } from 'react';
import './Team.css';
import api from '../api/axios';
import { API_ENDPOINTS } from '../config/api';
import { useAuth } from '../context/AuthContext';

const Team = () => {
    const [team, setTeam] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [projectLoading, setProjectLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedProject, setSelectedProject] = useState('all');
    const [newMember, setNewMember] = useState({
        email: '',
        role: 'member',
        project_id: ''
    });
    const { isAuthenticated } = useAuth();

    // Récupération des membres d'équipe
    useEffect(() => {
        const fetchTeam = async () => {
            if (!isAuthenticated) {
                setError("Authentication required");
                setLoading(false);
                return;
            }

            try {
                // Utiliser l'instance axios avec les intercepteurs d'authentification
                const response = await api.get(API_ENDPOINTS.teamList);
                console.log('Team API response:', response.data);
                setTeam(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching team:', err);
                setError(err.response?.data?.error || err.message || 'Failed to fetch team members');
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, [isAuthenticated]);

    // Récupération des projets
    useEffect(() => {
        const fetchProjects = async () => {
            if (!isAuthenticated) {
                setProjectLoading(false);
                return;
            }

            try {
                const response = await api.get(API_ENDPOINTS.projectList);
                console.log('Projects API response:', response.data);
                setProjects(response.data);
            } catch (err) {
                console.error('Error fetching projects:', err);
            } finally {
                setProjectLoading(false);
            }
        };

        fetchProjects();
    }, [isAuthenticated]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewMember(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            let response;
            
            // Si un projet spécifique est sélectionné
            if (newMember.project_id) {
                response = await api.post(
                    API_ENDPOINTS.projectInviteMember(newMember.project_id),
                    { email: newMember.email, role: newMember.role }
                );
                
                if (response.data.member) {
                    // Ajouter le membre à la liste si ce n'est pas un doublon
                    const memberExists = team.some(m => m.id === response.data.member.id);
                    if (!memberExists) {
                        setTeam(prev => [...prev, response.data.member]);
                    }
                }
            } else {
                // Sinon, utiliser l'API classique "team"
                response = await api.post(API_ENDPOINTS.teamList, {
                    email: newMember.email,
                    role: newMember.role
                });
                
                // S'il s'agit d'un membre unique
                if (response.data.member) {
                    setTeam(prev => [...prev, response.data.member]);
                } 
                // S'il s'agit d'un tableau de membres
                else if (Array.isArray(response.data)) {
                    setTeam(prev => [...prev, ...response.data]);
                }
            }
            
            setNewMember({
                email: '',
                role: 'member',
                project_id: ''
            });
            
            // Fermer la modale
            document.getElementById('addMemberModal').close();
        } catch (err) {
            console.error('Error adding member:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to add team member');
        }
    };

    const handleRemove = async (memberId) => {
        try {
            // Si un projet spécifique est sélectionné et qu'il n'est pas "all"
            if (selectedProject !== 'all') {
                await api.delete(API_ENDPOINTS.projectRemoveMember(selectedProject, memberId));
                // Si nous sommes dans la vue d'un projet spécifique, filtrer le membre de ce projet
                setTeam(prev => prev.filter(member => member.id !== memberId));
            } else {
                // Sinon, utiliser l'API générale de suppression d'un membre d'équipe
                await api.delete(API_ENDPOINTS.teamMember(memberId));
                setTeam(prev => prev.filter(member => member.id !== memberId));
            }
        } catch (err) {
            console.error('Error removing member:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to remove team member');
        }
    };

    const handleUpdateRole = async (memberId, newRole) => {
        try {
            if (selectedProject !== 'all') {
                await api.put(API_ENDPOINTS.projectUpdateMemberRole(selectedProject, memberId), {
                    role: newRole
                });
            } else {
                await api.put(API_ENDPOINTS.teamMember(memberId), {
                    role: newRole
                });
            }

            // Mettre à jour le rôle dans l'interface
            setTeam(prev => prev.map(member => 
                member.id === memberId ? { ...member, role: newRole } : member
            ));
        } catch (err) {
            console.error('Error updating role:', err);
            setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update member role');
        }
    };

    const handleProjectChange = async (e) => {
        const projectId = e.target.value;
        setSelectedProject(projectId);
        setLoading(true);

        try {
            let response;
            
            if (projectId === 'all') {
                // Si "Tous les projets" est sélectionné, récupérer tous les membres d'équipe
                response = await api.get(API_ENDPOINTS.teamList);
            } else {
                // Sinon, récupérer les membres d'un projet spécifique
                response = await api.get(`${API_ENDPOINTS.projectDetail(projectId)}/team`);
            }
            
            setTeam(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching members:', err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch team members');
        } finally {
            setLoading(false);
        }
    };

    if (loading || projectLoading) {
        return <div className="loading">Loading team members...</div>;
    }

    return (
        <div className="team-container">
            <div className="team-header">
                <h1>Team Members</h1>
                <div className="team-actions">
                    <select 
                        className="project-selector" 
                        value={selectedProject}
                        onChange={handleProjectChange}
                    >
                        <option value="all">All Projects</option>
                        {projects.map(project => (
                            <option key={project.id} value={project.id}>
                                {project.title}
                            </option>
                        ))}
                    </select>
                    <button className="btn btn-primary" onClick={() => document.getElementById('addMemberModal').showModal()}>
                        Add Member
                    </button>
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="team-grid">
                {team && team.length > 0 ? (
                    team.map(member => (
                        <div key={member.id} className="member-card">
                            <div className="member-info">
                                <div className="member-avatar">
                                    {member.name?.charAt(0) || '?'}
                                </div>
                                <div className="member-details">
                                    <h3>{member.name}</h3>
                                    <p className="member-email">{member.email}</p>
                                    <div className="role-section">
                                        <span className={`role-badge ${member.role}`}>
                                            {member.role}
                                        </span>
                                        <select
                                            className="role-dropdown"
                                            value={member.role}
                                            onChange={(e) => handleUpdateRole(member.id, e.target.value)}
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                            {selectedProject !== 'all' && <option value="owner">Owner</option>}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="member-actions">
                                <button 
                                    className="btn btn-danger"
                                    onClick={() => handleRemove(member.id)}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-state">No team members found</div>
                )}
            </div>

            <dialog id="addMemberModal" className="modal">
                <div className="modal-content">
                    <h2>Add Team Member</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={newMember.email}
                                onChange={handleChange}
                                required
                                placeholder="Enter member's email"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <select
                                id="role"
                                name="role"
                                value={newMember.role}
                                onChange={handleChange}
                                required
                            >
                                <option value="member">Member</option>
                                <option value="admin">Admin</option>
                                {selectedProject !== 'all' && <option value="owner">Owner</option>}
                            </select>
                        </div>
                        <div className="form-group">
                            <label htmlFor="project_id">Project</label>
                            <select
                                id="project_id"
                                name="project_id"
                                value={newMember.project_id}
                                onChange={handleChange}
                            >
                                <option value="">All Projects</option>
                                {projects && projects.length > 0 && projects.map(project => (
                                    <option key={project.id} value={project.id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                            <small>Optionally add to a specific project</small>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="btn btn-secondary" onClick={() => document.getElementById('addMemberModal').close()}>
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary">
                                Add Member
                            </button>
                        </div>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default Team;