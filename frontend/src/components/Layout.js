import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemButton,
    Avatar
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    Folder as ProjectIcon,
    Assignment as TaskIcon,
    Assessment as ReportIcon,
    Group as TeamIcon,
    Settings as SettingsIcon,
    AccountCircle as ProfileIcon,
    SmartToy as AIIcon,
    ViewKanban as BoardIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 240;

const Layout = ({ children }) => {
    const location = useLocation();
    const { user } = useAuth();

    const menuItems = [
        { text: 'Tableau de bord', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Projets', icon: <ProjectIcon />, path: '/projects' },
        { text: 'Tâches', icon: <TaskIcon />, path: '/tasks' },
        { text: 'Tableau Kanban', icon: <BoardIcon />, path: '/board' },
        { text: 'Rapports', icon: <ReportIcon />, path: '/reports' },
        { text: 'Équipe', icon: <TeamIcon />, path: '/team' },
        { text: 'Assistant IA', icon: <AIIcon />, path: '/ai-assistant' },
        { text: 'Paramètres', icon: <SettingsIcon />, path: '/settings' },
        { text: 'Profil', icon: <ProfileIcon />, path: '/profile' }
    ];

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Gestion de Projets
                    </Typography>
                    {user && (
                        <Box display="flex" alignItems="center">
                            <Typography variant="body2" sx={{ mr: 2 }}>
                                {user.name}
                            </Typography>
                            <Avatar sx={{ bgcolor: 'secondary.main' }}>
                                {user.name?.charAt(0) || '?'}
                            </Avatar>
                        </Box>
                    )}
                </Toolbar>
            </AppBar>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        boxSizing: 'border-box',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map((item) => (
                            <ListItem key={item.text} disablePadding>
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    selected={location.pathname === item.path}
                                >
                                    <ListItemIcon>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.text} />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                {children}
            </Box>
        </Box>
    );
};

export default Layout;