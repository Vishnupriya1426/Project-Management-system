import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Stack,
  Alert,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  TableChart as ExcelIcon,
} from '@mui/icons-material';
import api, { downloadFileBlob } from '../../../config/axios.config';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export const ReportPage: React.FC = () => {
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [exportMsg, setExportMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [deptData, setDeptData] = useState<{ department: string; employees: number; projects: number }[]>([]);
  const [taskBreakdownData, setTaskBreakdownData] = useState<{ name: string; value: number; color: string }[]>([]);

  const reportContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.get('/reports/summary')
      .then((res) => {
        const payload = res.data?.data || res.data;
        if (payload?.deptData && Array.isArray(payload.deptData)) {
          setDeptData(payload.deptData);
        }
        if (payload?.taskBreakdown && Array.isArray(payload.taskBreakdown)) {
          setTaskBreakdownData(payload.taskBreakdown);
        }
      })
      .catch(() => {
        setDeptData([]);
        setTaskBreakdownData([]);
      });
  }, []);

  const filteredDeptData = deptData.filter((item) => {
    if (departmentFilter === 'ALL') return true;
    return item.department.toLowerCase().includes(departmentFilter.toLowerCase());
  });

  const handleExportPDF = async () => {
    if (!reportContainerRef.current) return;
    setIsExporting(true);
    setExportMsg('📄 Capturing visual charts and generating high-resolution PDF report...');

    try {
      const element = reportContainerRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('SPEMS_Executive_Analytics_Report.pdf');

      setExportMsg('✅ Executive visual PDF report (with Bar Chart & Pie Chart graphs) downloaded successfully to your computer!');
    } catch (err) {
      console.error('PDF generation error:', err);
      downloadFileBlob('/reports/pdf?title=SPEMS_Executive_Report', 'SPEMS_Executive_Report.pdf');
      setExportMsg('📄 Downloading Executive Performance PDF report to your computer Downloads folder...');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    downloadFileBlob('/reports/excel?title=SPEMS_Data_Export', 'SPEMS_Data_Export.xlsx');
    setExportMsg('📊 Downloading Raw Data Grid Excel spreadsheet to your computer Downloads folder...');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <div>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Enterprise Analytics & Reporting Center
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aggregated workforce productivity, department performance metrics, and visual PDF/Excel export engines
          </Typography>
        </div>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<PdfIcon />}
            onClick={handleExportPDF}
            disabled={isExporting}
            sx={{ fontWeight: 700 }}
          >
            {isExporting ? 'Generating PDF...' : 'Export to PDF'}
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<ExcelIcon />}
            onClick={handleExportExcel}
            sx={{ fontWeight: 700 }}
          >
            Export to Excel
          </Button>
        </Stack>
      </Box>

      {exportMsg && (
        <Alert severity="info" onClose={() => setExportMsg(null)} sx={{ mb: 3, fontWeight: 600 }}>
          {exportMsg}
        </Alert>
      )}

      {/* REPORT CONTENT WRAPPER CAPTURED BY HTML2CANVAS FOR VISUAL PDF EXPORT */}
      <Box ref={reportContainerRef} sx={{ p: 2, bgcolor: '#f8fafc', borderRadius: 3 }}>
        {/* Header inside canvas capture for professional look */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2, borderBottom: '1px solid #e2e8f0' }}>
          <div>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1e293b' }}>
              SPEMS Enterprise Governance & Analytics Report
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              Real-time Database Metrics • Generated On: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
          </div>
        </Box>

        {/* Filter Controls Bar */}
        <Paper elevation={1} sx={{ p: 2, mb: 4, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                select
                fullWidth
                size="small"
                label="Filter by Department"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="ALL">All Departments</MenuItem>
                <MenuItem value="Engineering">Engineering & Technology</MenuItem>
                <MenuItem value="Human Resources">Human Resources</MenuItem>
                <MenuItem value="Project Management Office">Project Management Office</MenuItem>
                <MenuItem value="Quality Assurance">Quality Assurance</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" type="date" label="Start Date" InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField fullWidth size="small" type="date" label="End Date" InputLabelProps={{ shrink: true }} />
            </Grid>
          </Grid>
        </Paper>

        {/* Recharts Analytics Section */}
        <Grid container spacing={3}>
          {/* Department Headcount Bar Chart */}
          <Grid item xs={12} lg={7}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Department Workforce & Project Distribution
              </Typography>
              <Box sx={{ width: '100%', height: 340 }}>
                <ResponsiveContainer>
                  <BarChart data={filteredDeptData.length > 0 ? filteredDeptData : deptData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="department" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="employees" fill="#0078D4" name="Employees Count" />
                    <Bar dataKey="projects" fill="#008272" name="Active Projects" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>

          {/* Task Status Pie Chart */}
          <Grid item xs={12} lg={5}>
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Task Completion Status Ratio
              </Typography>
              <Box sx={{ width: '100%', height: 340 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={taskBreakdownData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {taskBreakdownData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default ReportPage;
