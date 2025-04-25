import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './ProjectDetail.css';

const ProjectDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch project');
                }
                const data = await response.json();
                setProject(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) {
        return <div className="loading">Loading project details...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    if (!project) {
        return <div className="not-found">Project not found</div>;
    }

    return (
        <div className="project-detail">
            <div className="project-header">
                <h1>{project.name}</h1>
                <div className="project-actions">
                    <button 
                        className="btn btn-secondary"
                        onClick={() => navigate('/projects')}
                    >
                        Back to Projects
                    </button>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/projects/${id}/edit`)}
                    >
                        Edit Project
                    </button>
                </div>
            </div>

            <div className="project-content">
                <div className="project-info">
                    <div className="info-section">
                        <h2>Description</h2>
                        <p>{project.description}</p>
                    </div>

                    <div className="info-section">
                        <h2>Timeline</h2>
                        <div className="timeline-info">
                            <div>
                                <span className="label">Start Date:</span>
                                <span>{new Date(project.start_date).toLocaleDateString()}</span>
                            </div>
                            <div>
                                <span className="label">End Date:</span>
                                <span>{new Date(project.end_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h2>Team Members</h2>
                        <div className="team-members">
                            {project.team_members.map(member => (
                                <div key={member.id} className="team-member">
                                    <div className="member-avatar">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="member-info">
                                        <span className="member-name">{member.name}</span>
                                        <span className="member-role">{member.role}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="project-stats">
                    <div className="stat-card">
                        <h3>Progress</h3>
                        <div className="progress-bar">
                            <div 
                                className="progress-fill"
                                style={{ width: `${project.progress}%` }}
                            />
                        </div>
                        <span className="progress-value">{project.progress}%</span>
                    </div>

                    <div className="stat-card">
                        <h3>Tasks Overview</h3>
                        <div className="tasks-stats">
                            <div className="stat-item">
                                <span className="stat-label">Total Tasks</span>
                                <span className="stat-value">{project.total_tasks}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Completed</span>
                                <span className="stat-value">{project.completed_tasks}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">In Progress</span>
                                <span className="stat-value">{project.in_progress_tasks}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Pending</span>
                                <span className="stat-value">{project.pending_tasks}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail; 