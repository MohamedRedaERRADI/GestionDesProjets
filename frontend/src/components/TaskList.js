import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './TaskList.css';

const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await fetch('/api/tasks');
                if (!response.ok) {
                    throw new Error('Failed to fetch tasks');
                }
                const data = await response.json();
                setTasks(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const filteredTasks = tasks.filter(task => {
        if (filter === 'all') return true;
        return task.status === filter;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed':
                return 'status-completed';
            case 'in-progress':
                return 'status-in-progress';
            case 'pending':
                return 'status-pending';
            default:
                return '';
        }
    };

    if (loading) {
        return <div className="loading">Loading tasks...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="task-list">
            <div className="task-header">
                <h1>Tasks</h1>
                <div className="filter-controls">
                    <button 
                        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                        onClick={() => setFilter('completed')}
                    >
                        Completed
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
                        onClick={() => setFilter('in-progress')}
                    >
                        In Progress
                    </button>
                    <button 
                        className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
                        onClick={() => setFilter('pending')}
                    >
                        Pending
                    </button>
                </div>
            </div>

            <div className="tasks-grid">
                {filteredTasks.map(task => (
                    <div key={task.id} className="task-card">
                        <div className="task-card-header">
                            <h3>{task.title}</h3>
                            <span className={`status-badge ${getStatusClass(task.status)}`}>
                                {task.status}
                            </span>
                        </div>
                        <p className="task-description">{task.description}</p>
                        <div className="task-meta">
                            <div className="meta-item">
                                <span className="meta-label">Project:</span>
                                <Link to={`/projects/${task.project_id}`} className="project-link">
                                    {task.project?.title || 'Unknown'}
                                </Link>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Due Date:</span>
                                <span className="due-date">{task.due_date}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-label">Assignee:</span>
                                <span className="assignee">{task.assignee_name}</span>
                            </div>
                        </div>
                        <div className="task-actions">
                            <Link to={`/tasks/${task.id}`} className="btn btn-primary">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TaskList;