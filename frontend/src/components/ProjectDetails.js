import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import './ProjectDetails.css';

const ProjectDetails = () => {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                const response = await fetch(`/api/projects/${id}`);
                const data = await response.json();
                setProject(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load project details');
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    if (loading) return <div className="loading">Loading project details...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!project) return <div className="error">Project not found</div>;

    return (
        <div className="project-details">
            <div className="project-header">
                <div>
                    <h1>{project.name}</h1>
                    <span className={`status-badge ${project.status}`}>
                        {project.status}
                    </span>
                </div>
                <div className="project-actions">
                    <Link to={`/projects/${id}/edit`} className="btn btn-secondary">Edit Project</Link>
                    <Link to={`/projects/${id}/tasks`} className="btn btn-primary">View Tasks</Link>
                </div>
            </div>

            <div className="project-content">
                <div className="project-info">
                    <div className="info-section">
                        <h3>Description</h3>
                        <p>{project.description}</p>
                    </div>

                    <div className="info-section">
                        <h3>Timeline</h3>
                        <div className="timeline-info">
                            <div className="timeline-item">
                                <span className="label">Start Date:</span>
                                <span className="value">{new Date(project.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="timeline-item">
                                <span className="label">End Date:</span>
                                <span className="value">{new Date(project.end_date).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="info-section">
                        <h3>Team Members</h3>
                        <div className="team-members">
                            {project.team_members.map(member => (
                                <div key={member.id} className="team-member">
                                    <span className="member-name">{member.name}</span>
                                    <span className="member-role">{member.role}</span>
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
                            ></div>
                        </div>
                        <span className="progress-text">{project.progress}%</span>
                    </div>

                    <div className="stat-card">
                        <h3>Tasks Overview</h3>
                        <div className="tasks-stats">
                            <div className="stat-item">
                                <span className="label">Total Tasks:</span>
                                <span className="value">{project.total_tasks}</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">Completed:</span>
                                <span className="value">{project.completed_tasks}</span>
                            </div>
                            <div className="stat-item">
                                <span className="label">In Progress:</span>
                                <span className="value">{project.in_progress_tasks}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetails; 