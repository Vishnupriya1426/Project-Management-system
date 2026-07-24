import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Stack,
  Alert,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Visibility as PreviewIcon,
  Download as DownloadIcon,
  Folder as FolderIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import api from '../../../config/axios.config';

interface DocFile {
  id: number;
  fileName: string;
  category: 'Resume' | 'Certificates' | 'Offer Letter' | 'Project Documents' | 'Training' | 'Reports';
  fileSize: string;
  uploadDate: string;
  isCompanyIssued: boolean;
}

export const DocumentListPage: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [documents, setDocuments] = useState<DocFile[]>([]);

  useEffect(() => {
    api.get('/documents')
      .then((res) => {
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiDocs: DocFile[] = res.data.data.map((d: any) => ({
            id: d.id,
            fileName: d.originalName ?? d.fileName ?? '',
            category: d.category ?? 'Project Documents',
            fileSize: d.fileSize ?? '',
            uploadDate: d.uploadDate ?? '',
            isCompanyIssued: d.isCompanyIssued ?? false,
          }));
          setDocuments(apiDocs);
        } else {
          setDocuments([]);
        }
      })
      .catch(() => {
        setDocuments([]);
      });
  }, []);

  const categories = ['ALL', 'Resume', 'Certificates', 'Offer Letter', 'Project Documents', 'Training', 'Reports'];

  const filteredDocs = documents.filter((d) => selectedCategory === 'ALL' || d.category === selectedCategory);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            My Document Repository
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personal Documents, Certificates, Company Issued Letters, and Project Files.
          </Typography>
        </Box>

        <Box component="label">
          <Button variant="contained" component="span" startIcon={<UploadIcon />} sx={{ fontWeight: 700 }}>
            Upload Document
          </Button>
          <input
            type="file"
            hidden
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setNotice(`Uploaded ${e.target.files[0].name} to Document Repository.`);
              }
            }}
          />
        </Box>
      </Box>

      {notice && (
        <Alert severity="info" onClose={() => setNotice(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {notice}
        </Alert>
      )}

      {/* Permission Restriction Notice */}
      <Alert severity="warning" sx={{ mb: 3, fontWeight: 500 }}>
        <strong>Permission Notice:</strong> Employees cannot delete company-issued documents (e.g. Offer Letter, Contracts) without HR authorization.
      </Alert>

      {/* Folders Grid */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {categories.slice(1).map((cat) => (
          <Grid item xs={6} sm={4} md={2} key={cat}>
            <Card
              sx={{
                borderRadius: 2,
                cursor: 'pointer',
                bgcolor: selectedCategory === cat ? 'primary.main' : 'background.paper',
                color: selectedCategory === cat ? '#fff' : 'inherit',
                border: '1px solid #e0e0e0',
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              <CardContent sx={{ p: 2, textAlign: 'center' }}>
                <FolderIcon sx={{ fontSize: 32, mb: 0.5, color: selectedCategory === cat ? '#fff' : 'primary.main' }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                  {cat}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Document Data Table */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell sx={{ fontWeight: 700 }}>Document Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Folder Category</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>File Size</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Upload Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Authority</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDocs.map((doc) => (
                <TableRow key={doc.id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FolderIcon fontSize="small" color="primary" />
                    {doc.fileName}
                  </TableCell>
                  <TableCell>
                    <Chip label={doc.category} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{doc.fileSize}</TableCell>
                  <TableCell>{doc.uploadDate}</TableCell>
                  <TableCell>
                    {doc.isCompanyIssued ? (
                      <Chip label="Company Issued" size="small" color="secondary" icon={<LockIcon />} />
                    ) : (
                      <Chip label="User Uploaded" size="small" color="default" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" startIcon={<PreviewIcon />} onClick={() => setNotice(`Previewing ${doc.fileName}`)}>
                        Preview
                      </Button>
                      <Button size="small" variant="contained" startIcon={<DownloadIcon />} onClick={() => setNotice(`Downloaded ${doc.fileName}`)}>
                        Download
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default DocumentListPage;
