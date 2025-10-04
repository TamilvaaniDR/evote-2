import React, { useState } from 'react';
import { AppBar, Box, CssBaseline, Drawer, IconButton, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, Typography, Link as MuiLink } from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  AccountCircle as AccountIcon,
  HowToVote as VoteIcon,
  Assessment as ResultsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';

const drawerWidth = 240;

interface VoterLayoutProps {
  children: React.ReactNode;
}

const VoterLayout: React.FC<VoterLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  // const { logoutVoter } = useVoter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    navigate('/logout');
  };

  const menuItems = [
    { text: 'Dashboard', icon: <HomeIcon />, path: '/dashboard' },
    { text: 'My Account', icon: <AccountIcon />, path: '/account' },
    { text: 'Elections', icon: <VoteIcon />, path: '/elections' },
    { text: 'Results', icon: <ResultsIcon />, path: '/results-index' },
  ];

  const drawer = (
    <div>
      <Toolbar>
        <Typography variant="h6" noWrap component="div">
          Voter Panel
        </Typography>
      </Toolbar>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: (t) => t.palette.background.default }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="default"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          backgroundColor: (t) => t.palette.background.paper,
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          boxShadow: 0,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" color="text.primary" sx={{ fontWeight: 600 }}>
            E-Voting System
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="voter navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider', boxShadow: 0 },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderColor: 'divider', boxShadow: 0 },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          backgroundColor: (t) => t.palette.background.default,
        }}
      >
        <Toolbar />
        {children}

        {/* Footer */}
        <Box component="footer" sx={{ mt: 6, pt: 3, borderTop: (t) => `1px solid ${t.palette.divider}` }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} E‑Voting System
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              <MuiLink component={RouterLink} to="/privacy" underline="hover" color="text.secondary">Privacy</MuiLink>
              <MuiLink component={RouterLink} to="/terms" underline="hover" color="text.secondary">Terms</MuiLink>
              <MuiLink component={RouterLink} to="/accessibility" underline="hover" color="text.secondary">Accessibility</MuiLink>
              <MuiLink component={RouterLink} to="/contact" underline="hover" color="text.secondary">Contact</MuiLink>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default VoterLayout;


