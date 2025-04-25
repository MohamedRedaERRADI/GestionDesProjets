import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Button, Box, Grid, Paper, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user, token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(true);
    const [error, setError] = React.useState(null);

    useEffect(() => {
        console.log('Dashboard mounted');
        console.log('User:', user);
        console.log('Token:', token);

        if (!user || !token) {
            console.log('No user or token found, redirecting to login');
            navigate('/login');
            return;
        }

        setLoading(false);
    }, [user, token, navigate]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={3}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    return (
        <Container>
            <Box sx={{ mt: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Bienvenue, {user?.name} !
                </Typography>
                <Typography variant="body1" paragraph>
                    Vous êtes connecté avec l'adresse email : {user?.email}
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                height: 200,
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                Gérer vos projets
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Créez et gérez vos projets en toute simplicité
                            </Typography>
                            <Button
                                variant="contained"
                                onClick={() => navigate('/projects')}
                            >
                                Voir mes projets
                            </Button>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Paper
                            sx={{
                                p: 3,
                                display: 'flex',
                                flexDirection: 'column',
                                height: 200,
                                justifyContent: 'center',
                                alignItems: 'center',
                                textAlign: 'center',
                            }}
                        >
                            <Typography variant="h6" gutterBottom>
                                Statistiques
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                                Consultez les statistiques de vos projets
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => navigate('/projects')}
                            >
                                Voir les statistiques
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    );
};

export default Dashboard; 