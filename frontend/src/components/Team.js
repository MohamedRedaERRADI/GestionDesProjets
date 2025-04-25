import React, { useState, useEffect } from 'react';
import './Team.css';

const Team = () => {
    const [team, setTeam] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [newMember, setNewMember] = useState({
        email: '',
        role: 'member'
    });

    useEffect(() => {
        const fetchTeam = async () => {
            try {
                const response = await fetch('/api/team');
                if (!response.ok) {
                    throw new Error('Failed to fetch team members');
                }
                const data = await response.json();
                setTeam(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchTeam();
    }, []);

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
            const response = await fetch('/api/team', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newMember)
            });

            if (!response.ok) {
                throw new Error('Failed to add team member');
            }

            const addedMember = await response.json();
            setTeam(prev => [...prev, addedMember]);
            setNewMember({
                email: '',
                role: 'member'
            });
        } catch (err) {
            setError(err.message);
        }
    };

    const handleRemove = async (memberId) => {
        try {
            const response = await fetch(`/api/team/${memberId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to remove team member');
            }

            setTeam(prev => prev.filter(member => member.id !== memberId));
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) {
        return <div className="loading">Loading team members...</div>;
    }

    return (
        <div className="team-container">
            <div className="team-header">
                <h1>Team Members</h1>
                <button className="btn btn-primary" onClick={() => document.getElementById('addMemberModal').showModal()}>
                    Add Member
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="team-grid">
                {team.map(member => (
                    <div key={member.id} className="member-card">
                        <div className="member-info">
                            <div className="member-avatar">
                                {member.name.charAt(0)}
                            </div>
                            <div className="member-details">
                                <h3>{member.name}</h3>
                                <p className="member-email">{member.email}</p>
                                <span className={`role-badge ${member.role}`}>
                                    {member.role}
                                </span>
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
                ))}
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
                            </select>
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