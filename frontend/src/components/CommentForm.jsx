import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Paper,
    Typography,
    IconButton,
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import axios from '../config/axios';

const MotionPaper = motion(Paper);

const CommentForm = ({ taskId, comment, parentId, onSuccess }) => {
    const [content, setContent] = useState(comment?.content || '');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSubmitting(true);
        try {
            if (comment) {
                await axios.put(`/api/tasks/${taskId}/comments/${comment.id}`, { content });
            } else {
                await axios.post(`/api/tasks/${taskId}/comments`, {
                    content,
                    parent_id: parentId
                });
            }
            setContent('');
            onSuccess?.();
        } catch (error) {
            console.error('Error saving comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            elevation={0}
            sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}
        >
            <Box component="form" onSubmit={handleSubmit}>
                <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={comment ? "Modifier votre commentaire..." : "Ajouter un commentaire..."}
                    variant="outlined"
                    sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    {comment && (
                        <Button
                            variant="outlined"
                            onClick={() => onSuccess?.()}
                            startIcon={<CloseIcon />}
                        >
                            Annuler
                        </Button>
                    )}
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting || !content.trim()}
                        startIcon={<SendIcon />}
                        sx={{
                            background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                            borderRadius: 2,
                            boxShadow: '0 4px 15px rgba(33, 150, 243, 0.3)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #1976D2, #1E88E5)',
                            }
                        }}
                    >
                        {comment ? 'Modifier' : 'Envoyer'}
                    </Button>
                </Box>
            </Box>
        </MotionPaper>
    );
};

export default CommentForm; 