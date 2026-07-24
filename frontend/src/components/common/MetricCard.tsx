import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  color?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  color = '#0078D4',
}) => {
  return (
    <Card elevation={2} sx={{ borderRadius: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, my: 0.5 }}>
            {value}
          </Typography>
          {change && (
            <Typography variant="caption" sx={{ color, fontWeight: 600 }}>
              {change}
            </Typography>
          )}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}>{icon}</Box>
      </CardContent>
    </Card>
  );
};
