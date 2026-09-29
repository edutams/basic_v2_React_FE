import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Alert,
  CircularProgress, Box, Snackbar, Portal,
} from '@mui/material';
import { IconFileSpreadsheet, IconPdf, IconDeviceFloppy } from '@tabler/icons-react';
import { Link as RouterLink } from 'react-router-dom';
import scoreManagerApi from '@/api/tenant/score-manager/scoreManagerApi';

const InputScoreDialog = ({ open, onClose, allocation, filter, singleStudent, onSaved }) => {
  const [students, setStudents] = useState([]);
  const [caType, setCaType] = useState([]);
  const [settings, setSettings] = useState({ exam_max_score: 60 });
  const [caScoreErrors, setCaScoreErrors] = useState([]);
  const [examScoreErrors, setExamScoreErrors] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  useEffect(() => {
    if (!open) return;

    if (singleStudent) {
      // Single student edit mode - use the student data directly.
      // `user_id` (UUID) must go to the backend as user_id, and
      // course_registration_id is required by the manual-upload validation —
      // the Score Sheet row carries both (`user_id` + `course_registration_id`/`id`).
      setCaType(singleStudent.caType || []);
      setSettings(singleStudent.settings || { exam_max_score: 60 });
      const initialized = [{
        id: singleStudent.user_id ?? singleStudent.id,
        fullname: `${singleStudent.fname} ${singleStudent.lname}`,
        reg_id: singleStudent.student_id ?? singleStudent.user_id,
        course_registration_id: singleStudent.course_registration_id ?? singleStudent.id,
        ca_details: normalizeCaDetails(singleStudent.ca, singleStudent.caType || []),
        examScores: singleStudent.exam_score ?? '',
        loading: false,
      }];
      setStudents(initialized);
      setCaScoreErrors(initialized.map(() => new Array((singleStudent.caType || []).length).fill(false)));
      setExamScoreErrors(new Array(initialized.length).fill(false));
      return;
    }

    // Bulk mode - fetch students from API
    const fetchStudents = async () => {
      if (!allocation || !filter) return;
      setFetching(true);
      try {
        const [studentsRes, configRes] = await Promise.all([
          scoreManagerApi.getRegisteredStudents({
            subject_id: allocation.subject_id,
            session_term_id: filter.session_term_id || filter.session_id,
            class_arm_id: allocation.class_arm_id,
          }),
          scoreManagerApi.fetchMarksConfiguration({
            session_id: filter.session_id,
            term_id: filter.term_id,
            programme_id: filter.programme_id,
          }),
        ]);

        const studentsData = studentsRes?.data?.data || [];
        const configData = configRes?.data?.data?.[0];

        // Parse CA type from config
        // The API may return ca_content as an object (keyed by ca1, ca2, etc.) or as an array
        let parsedCaType = [];
        if (configData?.ca_content) {
          const raw = typeof configData.ca_content === 'string'
            ? JSON.parse(configData.ca_content)
            : configData.ca_content;
          if (Array.isArray(raw)) {
            parsedCaType = raw;
          } else if (typeof raw === 'object') {
            parsedCaType = Object.values(raw);
          }
        }

        setCaType(parsedCaType);
        setSettings({ exam_max_score: configData?.exam_max_score || 60 });

        const initialized = studentsData.map((s) => ({
          id: s.user_id,
          fullname: `${s.fname} ${s.lname}`,
          reg_id: s.student_id,
          course_registration_id: s.course_registration_id,
          ca_details: normalizeCaDetails(s.ca_details, parsedCaType),
          examScores: s.exam_score ?? '',
          loading: false,
        }));

        setStudents(initialized);
        setCaScoreErrors(initialized.map(() => new Array(parsedCaType.length).fill(false)));
        setExamScoreErrors(new Array(initialized.length).fill(false));
      } catch (err) {
        console.error('Failed to fetch students:', err);
      } finally {
        setFetching(false);
      }
    };

    fetchStudents();
  }, [open, singleStudent, allocation, filter]);

  // CA entities may come back as an array or an object keyed by index/name — normalize to array
  const getEntities = (ca) => {
    if (!ca?.entities) return [];
    return Array.isArray(ca.entities) ? ca.entities : Object.values(ca.entities);
  };

  const getColspan = (ca) => getEntities(ca).length;

  // Normalize a student's saved ca_details into an array matching the caType
  // template (entities as arrays with score fields). Without this, students
  // with no saved scores get ca_details: [] and keystrokes are dropped, while
  // students with saved scores get keyed objects that break .map().
  const normalizeCaDetails = (details, template) => {
    const source = Array.isArray(details) ? details : Object.values(details || {});
    return template.map((ca, ci) => {
      const savedCa = source[ci] || {};
      const savedEntities = Array.isArray(savedCa.entities)
        ? savedCa.entities
        : Object.values(savedCa.entities || {});
      return {
        ...ca,
        entities: getEntities(ca).map((ent, ei) => ({
          ...ent,
          score: savedEntities[ei]?.score ?? '',
        })),
      };
    });
  };

  const handleCaScoreChange = (studentIndex, caIndex, entityIndex, value) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const caEntities = getEntities(caType[caIndex]);
    const maxScore = Number(caEntities[entityIndex].max_score);
    const parsed = parseFloat(numeric);

    const updated = [...students];
    const currentStudent = updated[studentIndex];
    // Defensive: if ca_details is missing/empty, rebuild it from the template
    const baseDetails = Array.isArray(currentStudent.ca_details) && currentStudent.ca_details.length
      ? currentStudent.ca_details
      : normalizeCaDetails(null, caType);
    updated[studentIndex] = {
      ...currentStudent,
      ca_details: baseDetails.map((ca, ci) => {
        if (ci !== caIndex) return ca;
        // Normalize entities to array before mapping
        const currentEntities = getEntities(ca);
        const updatedEntities = currentEntities.map((ent, ei) => {
          if (ei !== entityIndex) return ent;
          return { ...ent, score: numeric };
        });
        return {
          ...ca,
          entities: updatedEntities,
        };
      }),
    };
    setStudents(updated);

    const newErrors = [...caScoreErrors];
    if (!newErrors[studentIndex]) newErrors[studentIndex] = [];
    newErrors[studentIndex][caIndex] = !isNaN(parsed) && parsed > maxScore;
    setCaScoreErrors(newErrors);
  };

  const handleExamScoreChange = (studentIndex, value) => {
    const numeric = value.replace(/[^0-9.]/g, '');
    const maxScore = settings.exam_max_score;
    const parsed = parseFloat(numeric);

    const updated = [...students];
    updated[studentIndex] = { ...updated[studentIndex], examScores: numeric };
    setStudents(updated);

    const newErrors = [...examScoreErrors];
    newErrors[studentIndex] = !isNaN(parsed) && (parsed < 0 || parsed > maxScore);
    setExamScoreErrors(newErrors);
  };

  const handleSave = async (studentIndex) => {
    const student = students[studentIndex];
    const hasFilledCA = student.ca_details?.some((ca) =>
      getEntities(ca).some((ent) => ent.score !== '' && ent.score !== undefined)
    );
    const hasFilledExam = student.examScores !== '';

    if (!hasFilledCA && !hasFilledExam) {
      return;
    }

    const updated = [...students];
    updated[studentIndex] = { ...updated[studentIndex], loading: true };
    setStudents(updated);

    try {
      await scoreManagerApi.manualUpload({
        student: {
          user_id: student.id,
          course_registration_id: student.course_registration_id,
          ca_details: student.ca_details,
          examScores: student.examScores,
        },
        session_id: filter?.session_id,
        term_id: filter?.term_id,
      });
      showSnackbar(`Scores saved for ${student.fullname}`);
      onSaved?.();
    } catch (err) {
      console.error('Failed to save score:', err);
      showSnackbar(
        err?.response?.data?.message || `Failed to save scores for ${student.fullname}`,
        'error'
      );
    } finally {
      setStudents((prev) => prev.map((s, si) => (si === studentIndex ? { ...s, loading: false } : s)));
    }
  };

  const handleClose = () => {
    setStudents([]);
    onClose();
  };

  const handleSaveAll = () => {
    students.forEach((_, si) => handleSave(si));
  };

  const esc = (v) => String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  const downloadTitle = singleStudent
    ? `Edit Score — ${singleStudent.fname} ${singleStudent.lname}`
    : `Input Score — ${allocation?.subject_name || ''} (${allocation?.class_name ?? allocation?.className ?? ''})`;

  // Export the currently loaded table (incl. unsaved edits) as an Excel file.
  const handleDownloadExcel = () => {
    if (students.length === 0) {
      showSnackbar('No student records to export', 'warning');
      return;
    }
    const entityHeaders = caType.flatMap((ca) =>
      getEntities(ca).map((ent) => `${ca.display_name || 'CA'} ${ent.display_name || ''}`.trim())
    );
    const headerCells = ['#', 'Student', ...entityHeaders, `Exam (${settings.exam_max_score})`];
    const rowsHtml = students.map((student, si) => {
      const caCells = caType.flatMap((ca, ci) =>
        getEntities(ca).map((_, ei) => `<td>${esc(student.ca_details?.[ci]?.entities?.[ei]?.score ?? '')}</td>`)
      );
      return `<tr><td>${si + 1}</td><td>${esc(student.fullname)}</td>${caCells}<td>${esc(student.examScores ?? '')}</td></tr>`;
    }).join('');

    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8"></head>
<body>
  <table border="1">
    <thead><tr>${headerCells.map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead>
    <tbody>${rowsHtml}</tbody>
  </table>
</body></html>`;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(allocation?.subject_name || singleStudent?.fname || 'scores')}_scores.xls`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    showSnackbar('Excel file downloaded');
  };

  // Print the current table to a PDF via the browser print dialog.
  const handleDownloadPdf = () => {
    if (students.length === 0) {
      showSnackbar('No student records to print', 'warning');
      return;
    }
    const entityHeaders = caType.flatMap((ca) =>
      getEntities(ca).map((ent) => `${esc(ent.display_name)}(${esc(ent.max_score)})`)
    );
    const rowsHtml = students.map((student, si) => {
      const caCells = caType.flatMap((ca, ci) =>
        getEntities(ca).map((_, ei) => `<td style="text-align:center">${esc(student.ca_details?.[ci]?.entities?.[ei]?.score ?? '-')}</td>`)
      );
      return `<tr><td>${si + 1}</td><td>${esc(student.fullname)}</td>${caCells}<td style="text-align:center">${esc(student.examScores || '-')}</td></tr>`;
    }).join('');

    const caGroupHeaders = caType.map((ca) =>
      `<th colspan="${getColspan(ca)}" style="text-align:center">${esc(ca.display_name || 'CA')}</th>`
    ).join('');

    const printWindow = window.open('', '_blank', 'width=900,height=650');
    if (!printWindow) {
      showSnackbar('Please allow pop-ups to print the score sheet', 'error');
      return;
    }
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${esc(downloadTitle)}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 16px; }
        h2 { text-align: center; margin: 0 0 4px; }
        .sub { text-align: center; font-size: 12px; color: #444; margin-bottom: 14px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #555; padding: 4px 6px; font-size: 12px; }
        th { background: #f0f0f0; }
        @page { size: landscape; margin: 10mm; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>
        <h2>${esc(downloadTitle)}</h2>
        <div class="sub">${students.length} student(s)</div>
        <table>
          <thead>
            <tr><th rowspan="2">#</th><th rowspan="2">Student</th>${caGroupHeaders}<th rowspan="2">Exam (${esc(settings.exam_max_score)})</th></tr>
            <tr>${entityHeaders.map((h) => `<th style="text-align:center">${h}</th>`).join('')}</tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </body></html>`);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  const canExport = students.length > 0 && !fetching;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        {singleStudent
          ? `Edit Score — ${singleStudent.fname} ${singleStudent.lname}`
          : `Input Score — ${allocation?.subject_name} (${allocation?.class_name ?? allocation?.className})`
        }
      </DialogTitle>
      <DialogContent>
        {!fetching && students.length === 0 ? (
          <Alert
            severity="info"
            sx={{ borderRadius: '8px', '& .MuiAlert-message': { width: '100%' } }}
            action={
              !singleStudent && allocation ? (
                <Button
                  color="inherit"
                  size="small"
                  component={RouterLink}
                  to="/subject-registration"
                >
                  Go to Subject Registration
                </Button>
              ) : null
            }
          >
            {!singleStudent && !allocation
              ? 'Select a subject and class arm first, then open the score editor.'
              : 'No student has been registered for this allocated subject. Register students to input their scores.'}
          </Alert>
        ) : (
          <>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 1 }}>
          <Button
            variant="contained"
            size="small"
            color="info"
            startIcon={<IconFileSpreadsheet size={16} />}
            disabled={!canExport}
            onClick={handleDownloadExcel}
          >
            Download Excel
          </Button>
          <Button
            variant="contained"
            size="small"
            color="error"
            startIcon={<IconPdf size={16} />}
            disabled={!canExport}
            onClick={handleDownloadPdf}
          >
            Download PDF
          </Button>
        </Box>
        <TableContainer sx={{
          overflowX: 'auto',
          // Hide number-input spinners (arrow up/down)
          '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
            WebkitAppearance: 'none',
            margin: 0,
          },
          '& input[type=number]': { MozAppearance: 'textfield' },
        }}>
          <Table stickyHeader sx={{ '& .MuiTableCell-root': { py: 0.5, px: 1 }, whiteSpace: 'nowrap' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2}>Student Info</TableCell>
                {caType.map((ca) => (
                  <TableCell key={ca.display_name} sx={{ fontWeight: 700 }} colSpan={getColspan(ca)} align="center">
                    {ca.display_name}
                  </TableCell>
                ))}
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2} align="center">
                  Exam Score ({settings.exam_max_score})
                </TableCell>
                <TableCell sx={{ fontWeight: 700 }} rowSpan={2} align="center">Action</TableCell>
              </TableRow>
              <TableRow>
                {caType.map((ca, ci) =>
                  getEntities(ca).map((entity, ei) => (
                    <TableCell key={`${ci}-${ei}`} sx={{ fontWeight: 700 }} align="center">
                      {entity.display_name} ({entity.max_score})
                    </TableCell>
                  ))
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student, si) => (
                <TableRow key={student.id} hover>
                  <TableCell>{si + 1}</TableCell>
                  <TableCell>{student.fullname}</TableCell>
                  {caType.map((ca, ci) => {
                    const entities = getEntities(ca);
                    return entities.map((entity, ei) => (
                      <TableCell key={`${ci}-${ei}`} align="center">
                        <TextField
                          size="small"
                          type="number"
                          placeholder="0"
                          sx={{ width: 70 }}
                          value={student.ca_details?.[ci]?.entities?.[ei]?.score || ''}
                          onChange={(e) => handleCaScoreChange(si, ci, ei, e.target.value)}
                          error={caScoreErrors[si]?.[ci] || false}
                          helperText={caScoreErrors[si]?.[ci] ? 'Invalid' : ''}
                        />
                      </TableCell>
                    ));
                  })}
                  <TableCell align="center">
                    <TextField
                      size="small"
                      type="number"
                      placeholder="0"
                      sx={{ width: 70 }}
                      value={student.examScores}
                      onChange={(e) => handleExamScoreChange(si, e.target.value)}
                      error={examScoreErrors[si] || false}
                      helperText={examScoreErrors[si] ? 'Invalid' : ''}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      disabled={student.loading}
                      onClick={() => handleSave(si)}
                    >
                      {student.loading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        {!singleStudent && (
          <Button variant="contained" size="small" color="success" startIcon={<IconDeviceFloppy size={16} />} onClick={handleSaveAll}>
            Save All
          </Button>
        )}
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
      {/* Portal — MUI's Snackbar doesn't portal itself (unlike Dialog), so
          nested here it can get trapped under this Dialog's own stacking
          context no matter how high its z-index is set. Portal escapes it
          to document.body, same as Dialog already does. */}
      <Portal>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
        >
          <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Portal>
    </Dialog>
  );
};

export default InputScoreDialog;
