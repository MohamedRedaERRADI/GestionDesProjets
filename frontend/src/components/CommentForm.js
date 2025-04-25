import React, { useState } from 'react';
import './CommentForm.css';

const CommentForm = ({ taskId, parentId = null, onCommentAdded, onCancel }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    task_id: taskId,
                    parent_id: parentId,
                    content: content.trim()
                })
            });

            if (!response.ok) {
                throw new Error('Failed to add comment');
            }

            const newComment = await response.json();
            onCommentAdded(newComment);
            setContent('');
            if (onCancel) onCancel();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="comment-form">
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write your comment..."
                    rows="3"
                    required
                />
            </div>

            <div className="form-actions">
                {onCancel && (
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                )}
                <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading || !content.trim()}
                >
                    {loading ? 'Posting...' : 'Post Comment'}
                </button>
            </div>
        </form>
    );
};

export default CommentForm; 