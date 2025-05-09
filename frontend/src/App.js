import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './components/Projects';
import ProjectDetails from './components/ProjectDetails';
import Tasks from './components/Tasks';
import AIAssistant from './components/AIAssistant';
import Calendar from './components/Calendar';
import Reports from './components/Reports';
import Team from './components/Team';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Board from './components/Board';
import './App.css';

// Route protégée qui vérifie l'authentification
const PrivateRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? children : <Navigate to="/login" />;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Dashboard />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/projects"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Projects />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/projects/:id"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <ProjectDetails />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/tasks"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Tasks />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/calendar"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Calendar />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/reports"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Reports />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/team"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Team />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/settings"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Settings />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Profile />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/ai-assistant"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <AIAssistant />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/board"
                        element={
                            <PrivateRoute>
                                <Layout>
                                    <Board />
                                </Layout>
                            </PrivateRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
