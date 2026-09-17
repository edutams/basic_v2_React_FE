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
      entities: [{ display_name: '', max_score: '' }],
    },
  ],
});

// Score inputs are text fields (so they can start empty) that only accept
// digits and a decimal point — block the keys type="number" would have let
// through (minus/plus/exponent) so negative scores can't be typed.
const INVALID_SCORE_KEYS = ['-', '+', 'e', 'E'];
const blockInvalidScoreKeys = (e) => {
  if (INVALID_SCORE_KEYS.includes(e.key)) e.preventDefault();
};

const MarkConfigDialog = ({ open, onClose, onSave, onReset, data, divisionName }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [form, setForm] = useState(defaultForm);
  const [totalErr, setTotalErr] = useState('');
  const [caErr, setCaErr] = useState('');
  const [entityErr, setEntityErr] = useState(['']);

  // Treat '', null and undefined as 0 whenever a number is needed; '' keeps
  // the field visually empty until the user types (0 would be stuck there —
  // deleting it coerced straight back to 0 with numeric state).
  const toNum = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v) || 0);
  const clampScore = (raw) => {
    if (raw === '' || raw === null || raw === undefined) return '';
    const num = Number(raw);
    if (Number.isNaN(num)) return '';
    return String(Math.max(0, num));
  };

  useEffect(() => {
    if (open) {
      if (data && (data.examRatio || data.numberOfCAs)) {
        // The API returns saved entities keyed as an object ({entity1: …},
        // {entity2: …}…) because the backend re-keys caContent on save, so
        // normalize both levels to plain arrays before hydrating the form.
        const toEntityArray = (entities) =>
          Object.values(entities ?? {})
            .filter(Boolean)
            .map((e) => ({
              display_name: e.display_name || '',
              max_score: e.max_score ?? '',
            }));

        const caContent = data.caContent && data.caContent.length
          ? data.caContent.map((ca) => {
              const entities = toEntityArray(ca.entities);
              return {
                display_name: ca.display_name || '',
                max_score: ca.max_score ?? '',
                entities: entities.length ? entities : [{ display_name: '', max_score: '' }],
              };
            })
          : [{ display_name: 'CA1', max_score: data.caRatio ?? 30, entities: [{ display_name: '', max_score: '' }] }];

        setForm({
          examRatio: data.examRatio ?? 70,
          caRatio: data.caRatio ?? 30,
          numberOfCAs: data.numberOfCAs || 1,
          maxPoint: data.maxPoint ?? 5,
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
    const total = toNum(exam) + toNum(ca);
    if (total < 100) return 'The overall score cannot be less than 100';
    if (total > 100) return 'The overall score cannot be greater than 100';
    return '';
  };

  const checkCATotal = (items, caMax) => {
    const total = items.reduce((sum, c) => sum + toNum(c.max_score), 0);
    if (total < toNum(caMax)) return 'The sum of all C.As cannot be less than the overall C.A score';
    if (total > toNum(caMax)) return 'The sum of all C.As cannot be greater than the overall C.A score';
    return '';
  };

  const checkEntityTotal = (caIndex, entities, caMaxScore) => {
    const total = entities.reduce((sum, e) => sum + toNum(e.max_score), 0);
    if (total < toNum(caMaxScore)) return 'The sum of all breakdowns cannot be less than the C.A score';
    if (total > toNum(caMaxScore)) return 'The sum of all breakdowns cannot be greater than the C.A score';
    return '';
  };

  const addCA = () => {
    const newNum = form.numberOfCAs + 1;
    setForm({
      ...form,
      numberOfCAs: newNum,
      caContent: [
        ...form.caContent,
        { display_name: `CA${newNum}`, max_score: '', entities: [{ display_name: '', max_score: '' }] },
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
    updated[caIndex].entities = [...updated[caIndex].entities, { display_name: '', max_score: '' }];
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
      examRatio: toNum(form.examRatio),
      caRatio: toNum(form.caRatio),
      numberOfCAs: form.numberOfCAs,
      maxPoint: toNum(form.maxPoint),
      caContent: form.caContent.map((ca) => ({
        ...ca,
        max_score: toNum(ca.max_score),
        entities: ca.entities.map((e) => ({ ...e, max_score: toNum(e.max_score) })),
      })),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>
        Marks Configuration — {divisionName}
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button  color="warning" size="small" onClick={() => { setForm(defaultForm()); setTotalErr(''); setCaErr(''); setEntityErr(['']); }}>
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
                label="Exam (Max. Obtainable Score)" fullWidth size="small" type="text" inputMode="decimal"
                value={form.examRatio}
                onKeyDown={blockInvalidScoreKeys}
                onChange={(e) => {
                  const val = clampScore(e.target.value);
                  setForm({ ...form, examRatio: val });
                  setTotalErr(checkTotalScore(val, form.caRatio));
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="C.A (Max. Obtainable Score)" fullWidth size="small" type="text" inputMode="decimal"
                value={form.caRatio}
                onKeyDown={blockInvalidScoreKeys}
                onChange={(e) => {
                  const val = clampScore(e.target.value);
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
                label="Maximum Obtainable Point" fullWidth size="small" type="text" inputMode="decimal"
                value={form.maxPoint}
                onKeyDown={blockInvalidScoreKeys}
                onChange={(e) => setForm({ ...form, maxPoint: clampScore(e.target.value) })}
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
                <Button  size="small" onClick={addCA} sx={{ whiteSpace: 'nowrap' }}>
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
                  label="Max. Score" fullWidth size="small" type="text" inputMode="decimal" placeholder="Enter Maximum Obtainable Score"
                  value={ca.max_score}
                  onKeyDown={blockInvalidScoreKeys}
                  onChange={(e) => {
                    const val = clampScore(e.target.value);
                    updateCA(caIndex, 'max_score', val);
                    setCaErr(checkCATotal(
                      form.caContent.map((c, i) => i === caIndex ? { ...c, max_score: val } : c),
                      form.caRatio
                    ));
                  }}
                />
                {caErr && <Typography variant="caption" color="error">{caErr}</Typography>}
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField label="Breakdown" fullWidth size="small" disabled value={`${ca.entities.length} item(s)`} />
                  <Button  size="small" onClick={() => addEntity(caIndex)} sx={{ whiteSpace: 'nowrap' }}>
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
                        label="Max. Score" fullWidth size="small" type="text" inputMode="decimal" placeholder="Enter Max. Score"
                        value={ent.max_score}
                        onKeyDown={blockInvalidScoreKeys}
                        onChange={(e) => {
                          const val = clampScore(e.target.value);
                          updateEntity(caIndex, entIndex, 'max_score', val);
                          const updatedEntities = ca.entities.map((en, ei) =>
                            ei === entIndex ? { ...en, max_score: val } : en
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
        <Button size='small' onClick={handleSave} >
          SUBMIT CONFIGURATION
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MarkConfigDialog;
