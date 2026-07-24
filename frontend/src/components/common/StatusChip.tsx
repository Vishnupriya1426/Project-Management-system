import React from 'react';
import { Chip } from '@mui/material';

interface StatusChipProps {
  status: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ status }) => {
  let color: 'success' | 'primary' | 'warning' | 'error' | 'default' = 'default';

  switch (status?.toUpperCase()) {
    case 'ACTIVE':
    case 'COMPLETED':
    case 'DONE':
    case 'PAID':
      color = 'success';
      break;
    case 'IN_PROGRESS':
    case 'TODO':
      color = 'primary';
      break;
    case 'ON_LEAVE':
    case 'ON_HOLD':
    case 'IN_REVIEW':
    case 'PENDING_APPROVAL':
    case 'RENEWAL_DUE':
      color = 'warning';
      break;
    case 'TERMINATED':
    case 'CANCELLED':
    case 'URGENT':
    case 'HIGH':
    case 'CRITICAL':
      color = 'error';
      break;
    default:
      color = 'default';
  }

  return <Chip label={status} size="small" color={color} sx={{ fontWeight: 600 }} />;
};
