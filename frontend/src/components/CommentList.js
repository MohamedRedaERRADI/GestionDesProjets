import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import CommentForm from './CommentForm';
import './CommentList.css';

const CommentList = ({ taskId, comments, onCommentAdded }) => {
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingComment, setEditingComment] = useState(null);

    const handleReply = (commentId) => {
        setReplyingTo(commentId);
        setEditingComment(null);
    };

    const handleEdit = (comment) => {
        setEditingComment(comment);
        setReplyingTo(null);
    };

    const handleDelete = async (commentId) => {
        if (!window.confirm('Are you sure you want to delete this comment?')) return;

        try {
            const response = await fetch(`/api/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete comment');
            }

            onCommentAdded();
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const renderComment = (comment, level = 0) => {
        const isEditing = editingComment?.id === comment.id;
        const isReplying = replyingTo === comment.id;

        return (
            <div key={comment.id} className={`comment ${level > 0 ? 'reply' : ''}`}>
                <div className="comment-header">
                    <div className="comment-author">
                        <span className="author-name">{comment.user.name}</span>
                        <span className="comment-date">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                    </div>
                    <div className="comment-actions">
                        <button 
                            className="btn btn-text"
                            onClick={() => handleReply(comment.id)}
                        >
                            Reply
                        </button>
                        {comment.can_edit && (
                            <button 
                                className="btn btn-text"
                                onClick={() => handleEdit(comment)}
                            >
                                Edit
                            </button>
                        )}
                        {comment.can_delete && (
                            <button 
                                className="btn btn-text btn-danger"
                                onClick={() => handleDelete(comment.id)}
                            >
                                Delete
                            </button>
                        )}
                    </div>
                </div>

                {isEditing ? (
                    <CommentForm
                        taskId={taskId}
                        parentId={comment.parent_id}
                        onCommentAdded={() => {
                            onCommentAdded();
                            setEditingComment(null);
                        }}
                        onCancel={() => setEditingComment(null)}
                        initialContent={comment.content}
                    />
                ) : (
                    <div className="comment-content">
                        {comment.content}
                    </div>
                )}

                {isReplying && (
                    <div className="reply-form">
                        <CommentForm
                            taskId={taskId}
                            parentId={comment.id}
                            onCommentAdded={() => {
                                onCommentAdded();
                                setReplyingTo(null);
                            }}
                            onCancel={() => setReplyingTo(null)}
                        />
                    </div>
                )}

                {comment.replies && comment.replies.length > 0 && (
                    <div className="replies">
                        {comment.replies.map(reply => renderComment(reply, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="comment-list">
            <h3>Comments</h3>
            <CommentForm
                taskId={taskId}
                onCommentAdded={onCommentAdded}
            />
            <div className="comments">
                {comments.map(comment => renderComment(comment))}
            </div>
        </div>
    );
};

export default CommentList; 