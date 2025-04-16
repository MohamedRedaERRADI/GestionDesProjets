import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Collapse,
    ListItemButton,
} from '@mui/material';
import {
    AccountCircle,
    Dashboard as DashboardIcon,
    Folder as ProjectsIcon,
    Assignment as TasksIcon,
    CalendarToday as CalendarIcon,
    Assessment as ReportsIcon,
    Group as TeamIcon,
    Settings as SettingsIcon,
    Notifications as NotificationsIcon,
    ExpandLess,
    ExpandMore,
    Logout as LogoutIcon,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const drawerWidth = 240;

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [openProjects, setOpenProjects] = React.useState(false);
    const [openTasks, setOpenTasks] = React.useState(false);
    const [openReports, setOpenReports] = React.useState(false);
    const [openTeam, setOpenTeam] = React.useState(false);
    const [openSettings, setOpenSettings] = React.useState(false);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const menuItems = [
        {
            text: 'Tableau de Bord',
            icon: <DashboardIcon />,
            path: '/dashboard',
        },
        {
            text: 'Projets',
            icon: <ProjectsIcon />,
            path: '/projects',
            subItems: [
                { text: 'Tous les projets', path: '/projects' },
                { text: 'Nouveau projet', path: '/projects/new' },
                { text: 'Mes projets', path: '/projects/my' },
            ],
        },
        {
            text: 'Tâches',
            icon: <TasksIcon />,
            path: '/tasks',
            subItems: [
                { text: 'Toutes les tâches', path: '/tasks' },
                { text: 'Nouvelle tâche', path: '/tasks/new' },
                { text: 'Mes tâches', path: '/tasks/my' },
            ],
        },
        {
            text: 'Calendrier',
            icon: <CalendarIcon />,
            path: '/calendar',
        },
        {
            text: 'Rapports',
            icon: <ReportsIcon />,
            path: '/reports',
            subItems: [
                { text: 'Statistiques', path: '/reports/stats' },
                { text: 'Progression', path: '/reports/progress' },
                { text: 'Performance', path: '/reports/performance' },
            ],
        },
        {
            text: 'Équipe',
            icon: <TeamIcon />,
            path: '/team',
            subItems: [
                { text: 'Membres', path: '/team/members' },
                { text: 'Rôles', path: '/team/roles' },
                { text: 'Assignations', path: '/team/assignments' },
            ],
        },
        {
            text: 'Paramètres',
            icon: <SettingsIcon />,
            path: '/settings',
            subItems: [
                { text: 'Profil', path: '/settings/profile' },
                { text: 'Préférences', path: '/settings/preferences' },
                { text: 'Notifications', path: '/settings/notifications' },
            ],
        },
    ];

    const renderMenuItem = (item) => {
        if (item.subItems) {
            return (
                <React.Fragment key={item.text}>
                    <ListItemButton
                        onClick={() => {
                            switch (item.text) {
                                case 'Projets':
                                    setOpenProjects(!openProjects);
                                    break;
                                case 'Tâches':
                                    setOpenTasks(!openTasks);
                                    break;
                                case 'Rapports':
                                    setOpenReports(!openReports);
                                    break;
                                case 'Équipe':
                                    setOpenTeam(!openTeam);
                                    break;
                                case 'Paramètres':
                                    setOpenSettings(!openSettings);
                                    break;
                            }
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                        {item.subItems && (openProjects || openTasks || openReports || openTeam || openSettings) ? (
                            <ExpandLess />
                        ) : (
                            <ExpandMore />
                        )}
                    </ListItemButton>
                    <Collapse
                        in={
                            (item.text === 'Projets' && openProjects) ||
                            (item.text === 'Tâches' && openTasks) ||
                            (item.text === 'Rapports' && openReports) ||
                            (item.text === 'Équipe' && openTeam) ||
                            (item.text === 'Paramètres' && openSettings)
                        }
                        timeout="auto"
                        unmountOnExit
                    >
                        <List component="div" disablePadding>
                            {item.subItems.map((subItem) => (
                                <ListItemButton
                                    key={subItem.text}
                                    component={Link}
                                    to={subItem.path}
                                    sx={{ pl: 4 }}
                                >
                                    <ListItemText primary={subItem.text} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>
                </React.Fragment>
            );
        }

        return (
            <ListItem
                key={item.text}
                button
                component={Link}
                to={item.path}
            >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
            </ListItem>
        );
    };

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Gestion des Projets
                    </Typography>
                    <IconButton
                        size="large"
                        aria-label="notifications"
                        color="inherit"
                        sx={{ mr: 2 }}
                    >
                        <NotificationsIcon />
                    </IconButton>
                    <IconButton
                        size="large"
                        aria-label="account of current user"
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                        onClick={handleMenu}
                        color="inherit"
                    >
                        <AccountCircle />
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuItem disabled>{user?.name}</MenuItem>
                        <MenuItem component={Link} to="/settings/profile">
                            Mon Profil
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            Déconnexion
                        </MenuItem>
                    </Menu>
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
                        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto' }}>
                    <List>
                        {menuItems.map(renderMenuItem)}
                    </List>
                </Box>
            </Drawer>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Toolbar />
                <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                    <Outlet />
                </Container>
                <Box component="footer" sx={{ py: 3, px: 2, mt: 'auto', backgroundColor: 'primary.main', color: 'white' }}>
                    <Container maxWidth="sm">
                        <Typography variant="body1" align="center">
                            © {new Date().getFullYear()} Gestion des Projets
                        </Typography>
                    </Container>
                </Box>
            </Box>
        </Box>
    );
};

export default Layout; 