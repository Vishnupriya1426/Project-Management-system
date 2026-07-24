import React, { useState } from 'react';
import { Typography, Button, Paper } from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeMb?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFileSelect,
  accept = '.jpg,.png,.pdf,.docx,.xlsx',
  maxSizeMb = 15,
}) => {
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > maxSizeMb * 1024 * 1024) {
        alert(`File size exceeds maximum limit of ${maxSizeMb}MB`);
        return;
      }
      setSelectedFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        textAlign: 'center',
        borderStyle: 'dashed',
        borderColor: 'primary.main',
        bgcolor: 'action.hover',
        borderRadius: 2,
      }}
    >
      <CloudUploadIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        {selectedFileName ? selectedFileName : 'Drag & drop files here or click to browse'}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
        Supported formats: JPG, PNG, PDF, DOCX, XLSX (Max size: {maxSizeMb}MB)
      </Typography>

      <Button variant="contained" component="label" size="small">
        Select File
        <input type="file" hidden accept={accept} onChange={handleFileChange} />
      </Button>
    </Paper>
  );
};
