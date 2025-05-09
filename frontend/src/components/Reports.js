import React, { useState, useEffect } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api from '../api/axios';
import { API_ENDPOINTS } from '../config/api';
import './Reports.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const Reports = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [generalStats, setGeneralStats] = useState(null);
    const [selectedProject, setSelectedProject] = useState('');
    const [projects, setProjects] = useState([]);
    const [projectProgress, setProjectProgress] = useState(null);
    const [teamPerformance, setTeamPerformance] = useState(null);

    useEffect(() => {
        fetchGeneralStats();
        fetchProjects();
    }, []);

    const fetchGeneralStats = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.reports);
            setGeneralStats(response.data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la récupération des statistiques');
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.projectList);
            setProjects(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la récupération des projets');
        } finally {
            setLoading(false);
        }
    };

    const handleProjectChange = async (e) => {
        const projectId = e.target.value;
        setSelectedProject(projectId);
        
        if (!projectId) return;

        try {
            // Récupérer la progression du projet
            const progressResponse = await api.get(API_ENDPOINTS.reports + '/project-progress/' + projectId);
            setProjectProgress(progressResponse.data);

            // Récupérer les performances de l'équipe
            const teamResponse = await api.get(API_ENDPOINTS.reports + '/team-performance/' + projectId);
            setTeamPerformance(teamResponse.data);
            
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur lors de la récupération des données du projet');
        }
    };

    const generalStatsData = {
        labels: ['Total', 'Complétés', 'En cours', 'En attente'],
        datasets: [{
            label: 'Statut des projets',
            data: generalStats ? [
                generalStats.total_projects,
                generalStats.completed_projects,
                generalStats.in_progress_projects,
                generalStats.pending_projects
            ] : [],
            backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    };

    const projectProgressData = projectProgress ? {
        labels: ['Total', 'Complétées', 'En cours', 'En attente'],
        datasets: [{
            label: 'Statut des tâches',
            data: [
                projectProgress.total_tasks,
                projectProgress.completed_tasks,
                projectProgress.in_progress_tasks,
                projectProgress.pending_tasks
            ],
            backgroundColor: [
                'rgba(54, 162, 235, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(255, 206, 86, 0.5)',
                'rgba(255, 99, 132, 0.5)'
            ],
            borderColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)'
            ],
            borderWidth: 1
        }]
    } : null;

    if (loading) {
        return <div className="loading">Chargement des rapports...</div>;
    }

    return (
        <div className="reports-container">
            <h1>Rapports et Statistiques</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="stats-section">
                <h2>Statistiques Générales</h2>
                <div className="chart-container">
                    <Bar data={generalStatsData} options={{
                        responsive: true,
                        plugins: {
                            legend: {
                                position: 'top',
                            },
                            title: {
                                display: true,
                                text: 'Vue d\'ensemble des projets'
                            }
                        }
                    }} />
                </div>
            </div>

            <div className="project-section">
                <h2>Détails du Projet</h2>
                <select
                    className="project-selector"
                    value={selectedProject}
                    onChange={handleProjectChange}
                >
                    <option value="">Sélectionnez un projet</option>
                    {projects.map(project => (
                        <option key={project.id} value={project.id}>
                            {project.title}
                        </option>
                    ))}
                </select>

                {projectProgress && (
                    <div className="project-progress">
                        <h3>Progression du Projet: {projectProgress.project_name}</h3>
                        <div className="progress-info">
                            <p>Taux de complétion: {projectProgress.completion_rate.toFixed(1)}%</p>
                            <p>Date de début: {new Date(projectProgress.start_date).toLocaleDateString()}</p>
                            <p>Date de fin: {new Date(projectProgress.end_date).toLocaleDateString()}</p>
                            <p>Statut: {projectProgress.status}</p>
                        </div>
                        <div className="chart-container">
                            <Bar data={projectProgressData} options={{
                                responsive: true,
                                plugins: {
                                    legend: {
                                        position: 'top',
                                    },
                                    title: {
                                        display: true,
                                        text: 'Distribution des tâches'
                                    }
                                }
                            }} />
                        </div>
                    </div>
                )}

                {teamPerformance && (
                    <div className="team-performance">
                        <h3>Performance de l'Équipe</h3>
                        <div className="team-stats">
                            <p>Taille de l'équipe: {teamPerformance.team_size}</p>
                            <div className="members-list">
                                {teamPerformance.team_performance.map((member, index) => (
                                    <div key={index} className="member-performance">
                                        <h4>{member.member_name} ({member.member_role})</h4>
                                        <p>Tâches complétées: {member.completed_tasks}/{member.total_tasks}</p>
                                        <p>Taux de complétion: {member.completion_rate.toFixed(1)}%</p>
                                        <p>Complétées à temps: {member.on_time_completion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Reports;