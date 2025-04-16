import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Button, Box, Grid, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

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