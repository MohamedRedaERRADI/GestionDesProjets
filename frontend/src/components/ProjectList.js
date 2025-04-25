import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ProjectList.css';

const ProjectList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects');
                const data = await response.json();
                setProjects(data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load projects');
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <div className="loading">Loading projects...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="project-list">
            <div className="project-header">
                <h1>Projects</h1>
                <Link to="/projects/new" className="btn btn-primary">New Project</Link>
            </div>

            <div className="projects-grid">
                {projects.map(project => (
                    <div key={project.id} className="project-card">
                        <div className="project-card-header">
                            <h3>{project.name}</h3>
                            <span className={`status-badge ${project.status}`}>
                                {project.status}
                            </span>
                        </div>
                        <p className="project-description">{project.description}</p>
                        <div className="project-meta">
                            <div className="meta-item">
                                <span className="label">Start Date:</span>
                                <span className="value">{new Date(project.start_date).toLocaleDateString()}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">End Date:</span>
                                <span className="value">{new Date(project.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Tasks:</span>
                                <span className="value">{project.tasks_count}</span>
                            </div>
                        </div>
                        <div className="project-actions">
                            <Link to={`/projects/${project.id}`} className="btn btn-secondary">View Details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProjectList; 