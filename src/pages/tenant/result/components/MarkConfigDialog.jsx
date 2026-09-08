import { useState, useEffect } from 'react';
import {
  Box, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Grid, Paper, IconButton, Alert, Divider,
} from '@mui/material';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { useTheme } from '@mui/material/styles';

const defaultForm = () => ({
  examRatio: 70,
  caRatio: 30,
  numberOfCAs: 1,
  maxPoint: 5,
  caContent: [
    {
      display_name: 'CA1',
      max_score: 15,
      entities: [{ display_name: 'Classwork', max_score: 15 }],
    },
  ],
});

const MarkConfigDialog = ({ open, onClose, onSave, onReset, data, divisionName }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [form, setForm] = useState(defaultForm);
  const [totalErr, setTotalErr] = useState('');
  const [caErr, setCaErr] = useState('');
  const [entityErr, setEntityErr] = useState(['']);

  useEffect(() => {
    if (open) {
      if (data && (data.examRatio || data.numberOfCAs)) {
        const caContent = data.caContent && data.caContent.length
          ? data.caContent.map((ca) => ({
              display_name: ca.display_name || '',
              max_score: ca.max_score || 0,
              entities: ca.entities && ca.entities.length
                ? ca.entities.map((e) => ({ display_name: e.display_name || '', max_score: e.max_score || 0 }))
                : [{ display_name: '', max_score: 0 }],
            }))
          : [{ display_name: 'CA1', max_score: data.caRatio || 30, entities: [{ display_name: 'CA1', max_score: data.caRatio || 30 }] }];

        setForm({
          examRatio: data.examRatio || 70,
          caRatio: data.caRatio || 30,
          numberOfCAs: data.numberOfCAs || 1,
          maxPoint: data.maxPoint || 5,
          caContent,
        });
        setEntityErr(new Array(data.numberOfCAs || 1).fill(''));
      } else {
        setForm(defaultForm());
        setEntityErr(['']);
      }
      setTotalErr('');
      setCaErr('');
    }
  }, [open, data]);

  const checkTotalScore = (exam, ca) => {
    const total = Number(exam) + Number(ca);
    if (total < 100) return 'The overall score cannot be less than 100';
    if (total > 100) return 'The overall score cannot be greater than 100';
    return '';
  };

  const checkCATotal = (items, caMax) => {
    const total = items.reduce((sum, c) => sum + Number(c.max_score || 0), 0);
    if (total < Number(caMax)) return 'The sum of all C.As cannot be less than the overall C.A score';
    if (total > Number(caMax)) return 'The sum of all C.As cannot be greater than the overall C.A score';
    return '';
  };

  const checkEntityTotal = (caIndex, entities, caMaxScore) => {
    const total = entities.reduce((sum, e) => sum + Number(e.max_score || 0), 0);
    if (total < Number(caMaxScore)) return 'The sum of all breakdowns cannot be less than the C.A score';
    if (total > Number(caMaxScore)) return 'The sum of all breakdowns cannot be greater than the C.A score';
    return '';
  };

  const addCA = () => {
    const newNum = form.numberOfCAs + 1;
    setForm({
      ...form,
      numberOfCAs: newNum,
      caContent: [
        ...form.caContent,
        { display_name: `CA${newNum}`, max_score: 0, entities: [{ display_name: `CA${newNum}`, max_score: 0 }] },
      ],
    });
    setEntityErr([...entityErr, '']);
  };

  const removeCA = (index) => {
    if (form.numberOfCAs <= 1) return;
    const updated = form.caContent.filter((_, i) => i !== index);
    setForm({ ...form, numberOfCAs: form.numberOfCAs - 1, caContent: updated });
    const updatedErr = entityErr.filter((_, i) => i !== index);
    setEntityErr(updatedErr);
  };

  const addEntity = (caIndex) => {
    const updated = [...form.caContent];
    updated[caIndex].entities = [...updated[caIndex].entities, { display_name: '', max_score: 0 }];
    setForm({ ...form, caContent: updated });
  };

  const removeEntity = (caIndex, entIndex) => {
    const updated = [...form.caContent];
    if (updated[caIndex].entities.length <= 1) return;
    updated[caIndex].entities = updated[caIndex].entities.filter((_, i) => i !== entIndex);
    setForm({ ...form, caContent: updated });
  };

  const updateCA = (caIndex, field, value) => {
    const updated = [...form.caContent];
    updated[caIndex] = { ...updated[caIndex], [field]: value };
    setForm({ ...form, caContent: updated });
  };

  const updateEntity = (caIndex, entIndex, field, value) => {
    const updated = [...form.caContent];
    updated[caIndex].entities = [...updated[caIndex].entities];
    updated[caIndex].entities[entIndex] = { ...updated[caIndex].entities[entIndex], [field]: value };
    setForm({ ...form, caContent: updated });
  };

  const validate = () => {
    const tErr = checkTotalScore(form.examRatio, form.caRatio);
    const cErr = checkCATotal(form.caContent, form.caRatio);
    setTotalErr(tErr);
    setCaErr(cErr);

    const newEntityErr = form.caContent.map((ca, i) =>
      checkEntityTotal(i, ca.entities, ca.max_score)
    );
    setEntityErr(newEntityErr);

    return !tErr && !cErr && !newEntityErr.some((e) => e);
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      examRatio: form.examRatio,
      caRatio: form.caRatio,
      numberOfCAs: form.numberOfCAs,
      maxPoint: form.maxPoint,
      caContent: form.caContent,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Marks Configuration — {divisionName}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button variant="outlined" color="warning" size="small" onClick={() => { setForm(defaultForm()); setTotalErr(''); setCaErr(''); setEntityErr(['']); }}>
            Reset
          </Button>
        </Box>

        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: 2 }}>
          <Typography fontWeight={700} sx={{ mb: 1.5 }}>
            EXAM/C.A RATIO{' '}
            <Typography component="span" variant="body2" fontStyle="italic" color="text.secondary">
              (Enter the maximum obtainable score for C.A and Exam)
            </Typography>
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Exam (Max. Obtainable Score)" fullWidth size="small" type="number"
                value={form.examRatio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm({ ...form, examRatio: val });
                  setTotalErr(checkTotalScore(val, form.caRatio));
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="C.A (Max. Obtainable Score)" fullWidth size="small" type="number"
                value={form.caRatio}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setForm({ ...form, caRatio: val });
                  setTotalErr(checkTotalScore(form.examRatio, val));
                  setCaErr(checkCATotal(form.caContent, val));
                }}
              />
              {totalErr && <Typography variant="caption" color="error">{totalErr}</Typography>}
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                Specify the maximum obtainable Point if you want to implement <strong>&nbsp;CGPA</strong> system.
              </Alert>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Maximum Obtainable Point" fullWidth size="small" type="number"
                value={form.maxPoint}
                onChange={(e) => setForm({ ...form, maxPoint: Number(e.target.value) })}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Alert severity="info" sx={{ height: '100%', display: 'flex', alignItems: 'center' }}>
                To add more C.As, click the <strong>&nbsp;Add More&nbsp;</strong> button beside the input field.
              </Alert>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TextField label="Number of C.As" fullWidth size="small" disabled value={form.numberOfCAs} />
                <Button variant="contained" size="small" onClick={addCA} sx={{ whiteSpace: 'nowrap', minWidth: 100, height: 40 }}>
                  Add More
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {form.caContent.map((ca, caIndex) => (
          <Paper key={caIndex} elevation={0} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: isDark ? 'rgba(255,255,255,0.12)' : '#E5E7EB', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
              <Typography variant="subtitle1" fontWeight={700}>C.A {caIndex + 1}</Typography>
              {caIndex > 0 && (
                <IconButton size="small" color="error" onClick={() => removeCA(caIndex)}>
                  <IconTrash size={16} />
                </IconButton>
              )}
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Display Name" fullWidth size="small" placeholder="Enter Display Name"
                  value={ca.display_name}
                  onChange={(e) => updateCA(caIndex, 'display_name', e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Max. Score" fullWidth size="small" type="number" placeholder="Enter Maximum Obtainable Score"
                  value={ca.max_score}
                  onChange={(e) => {
                    updateCA(caIndex, 'max_score', Number(e.target.value));
                    setCaErr(checkCATotal(
                      form.caContent.map((c, i) => i === caIndex ? { ...c, max_score: Number(e.target.value) } : c),
                      form.caRatio
                    ));
                  }}
                />
                {caErr && <Typography variant="caption" color="error">{caErr}</Typography>}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField label="Breakdown" fullWidth size="small" disabled value={`${ca.entities.length} item(s)`} />
                  <Button variant="contained" size="small" onClick={() => addEntity(caIndex)} sx={{ whiteSpace: 'nowrap', minWidth: 100, height: 40 }}>
                    Add More
                  </Button>
                </Box>
              </Grid>
              <Grid size={{ xs: 12 }}>
                {ca.entities.map((ent, entIndex) => (
                  <Grid container spacing={2} key={entIndex} sx={{ mb: 1 }}>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        label="Display Name" fullWidth size="small" placeholder="Enter Display Name"
                        value={ent.display_name}
                        onChange={(e) => updateEntity(caIndex, entIndex, 'display_name', e.target.value)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <TextField
                        label="Max. Score" fullWidth size="small" type="number" placeholder="Enter Max. Score"
                        value={ent.max_score}
                        onChange={(e) => {
                          updateEntity(caIndex, entIndex, 'max_score', Number(e.target.value));
                          const updatedEntities = ca.entities.map((en, ei) =>
                            ei === entIndex ? { ...en, max_score: Number(e.target.value) } : en
                          );
                          const newErr = [...entityErr];
                          newErr[caIndex] = checkEntityTotal(caIndex, updatedEntities, ca.max_score);
                          setEntityErr(newErr);
                        }}
                      />
                      {entityErr[caIndex] && <Typography variant="caption" color="error">{entityErr[caIndex]}</Typography>}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                      {entIndex > 0 && (
                        <IconButton size="small" color="error" onClick={() => removeEntity(caIndex, entIndex)}>
                          <IconTrash size={16} />
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Paper>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} sx={{ minWidth: 200, height: 45 }}>
          SUBMIT CONFIGURATION
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarkConfigDialog;
