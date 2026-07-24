import React from 'react';
import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0 || location.pathname === '/welcome') return null;

  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        <Link
          color="inherit"
          component="button"
          onClick={() => navigate('/dashboard')}
          sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}
        >
          Home
        </Link>

        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const formattedName = name.charAt(0).toUpperCase() + name.slice(1).replace('-', ' ');

          return isLast ? (
            <Typography key={name} color="text.primary" sx={{ fontWeight: 600 }}>
              {formattedName}
            </Typography>
          ) : (
            <Link
              key={name}
              color="inherit"
              component="button"
              onClick={() => navigate(routeTo)}
              sx={{ cursor: 'pointer', textDecoration: 'none', fontWeight: 500 }}
            >
              {formattedName}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};
