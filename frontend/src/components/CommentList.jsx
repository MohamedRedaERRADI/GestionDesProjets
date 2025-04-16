import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Avatar,
    Paper,
    IconButton,
    Menu,
    MenuItem,
    Divider,
} from '@mui/material';
import {
    MoreVert as MoreVertIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Reply as ReplyIcon,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from '../config/axios';
import { useAuth } from '../context/AuthContext';
import CommentForm from './CommentForm';

const MotionPaper = motion(Paper);

const CommentList = ({ taskId }) => {
    const [comments, setComments] = useState([]);
    const [editingComment, setEditingComment] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`/api/tasks/${taskId}/comments`);
            setComments(response.data);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleMenuOpen = (event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    const handleEdit = (comment) => {
        setEditingComment(comment);
        handleMenuClose();
    };

    const handleDelete = async (comment) => {
        try {
            await axios.delete(`/api/tasks/${taskId}/comments/${comment.id}`);
            fetchComments();
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
        handleMenuClose();
    };

    const handleReply = (comment) => {
        setReplyingTo(comment);
        handleMenuClose();
    };

    const renderComment = (comment, level = 0) => {
        const isAuthor = user.id === comment.user.id;

        return (
            <MotionPaper
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    ml: level * 4,
                    borderRadius: 2,
                    background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar 
                            sx={{ 
                                bgcolor: 'primary.main',
                                width: 32,
                                height: 32
                            }}
                        >
                            {comment.user.name.charAt(0)}
                        </Avatar>
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {comment.user.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: fr })}
                            </Typography>
                        </Box>
                    </Box>
                    {isAuthor && (
                        <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, comment)}
                            sx={{ color: 'text.secondary' }}
                        >
                            <MoreVertIcon />
                        </IconButton>
                    )}
                </Box>

                <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                    {comment.content}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => handleReply(comment)}
                        sx={{ color: 'primary.main' }}
                    >
                        <ReplyIcon fontSize="small" />
                    </IconButton>
                </Box>

                {comment.replies && comment.replies.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        {comment.replies.map(reply => renderComment(reply, level + 1))}
                    </Box>
                )}

                {replyingTo?.id === comment.id && (
                    <Box sx={{ mt: 2 }}>
                        <CommentForm
                            taskId={taskId}
                            parentId={comment.id}
                            onSuccess={() => {
                                setReplyingTo(null);
                                fetchComments();
                            }}
                        />
                    </Box>
                )}
            </MotionPaper>
        );
    };

    return (
        <Box sx={{ mt: 4 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Commentaires
            </Typography>

            <CommentForm taskId={taskId} onSuccess={fetchComments} />

            <AnimatePresence>
                {comments.map(comment => renderComment(comment))}
            </AnimatePresence>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => handleEdit(selectedComment)}>
                    <EditIcon sx={{ mr: 1 }} fontSize="small" />
                    Modifier
                </MenuItem>
                <MenuItem onClick={() => handleDelete(selectedComment)}>
                    <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
                    Supprimer
                </MenuItem>
            </Menu>

            {editingComment && (
                <CommentForm
                    taskId={taskId}
                    comment={editingComment}
                    onSuccess={() => {
                        setEditingComment(null);
                        fetchComments();
                    }}
                />
            )}
        </Box>
    );
};

export default CommentList; 