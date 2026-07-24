import React from 'react';
import { Box, Typography, Container } from '@mui/material';

export const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 2,
        px: 2,
        mt: 'auto',
        bgcolor: 'background.paper',
        borderTop: 1,
        borderColor: 'divider',
        textAlign: 'center',
      }}
    >
      <Container maxWidth="xl">
        <Typography variant="body2" color="text.secondary">
          © 2026 Enterprise SPEMS Platform • Powered by React 19, Material UI, Spring Boot 3 & MySQL 8
        </Typography>
      </Container>
    </Box>
  );
};
