import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface SearchInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  width?: number | string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  width = 300,
}) => {
  return (
    <TextField
      size="small"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      sx={{ width }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
      }}
    />
  );
};
