import React from 'react';
import { Box, Toolbar, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Breadcrumb } from './Breadcrumb';
import { Footer } from './Footer';

export const AppLayout: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Header />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            bgcolor: 'background.default',
            minHeight: 'calc(100vh - 64px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Toolbar />
          <Container maxWidth="xl" sx={{ flexGrow: 1, mt: 1 }}>
            <Breadcrumb />
            <Outlet />
          </Container>
          <Footer />
        </Box>
      </Box>
    </Box>
  );
};
