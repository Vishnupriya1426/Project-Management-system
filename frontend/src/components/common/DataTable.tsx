import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Typography,
} from '@mui/material';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  totalElements: number;
  page: number;
  rowsPerPage: number;
  isLoading?: boolean;
  onPageChange: (newPage: number) => void;
  onRowsPerPageChange: (newRowsPerPage: number) => void;
  keyExtractor: (row: T) => string | number;
}

export function DataTable<T>({
  columns,
  rows,
  totalElements,
  page,
  rowsPerPage,
  isLoading = false,
  onPageChange,
  onRowsPerPageChange,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align || 'left'} sx={{ fontWeight: 600 }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={keyExtractor(row)} hover>
                  {columns.map((col) => (
                    <TableCell key={col.id} align={col.align || 'left'}>
                      {col.render ? col.render(row) : (row as any)[col.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No data available
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalElements}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => onPageChange(newPage)}
        onRowsPerPageChange={(e) => onRowsPerPageChange(parseInt(e.target.value, 10))}
      />
    </Paper>
  );
}
