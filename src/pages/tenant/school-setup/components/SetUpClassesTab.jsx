import { useState, useMemo, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import {
  Box,
  Grid,
  Paper,
  Chip,
  TextField,
  IconButton,
  Button,
  Typography,
  Tooltip,
  Collapse,
  Skeleton,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Lock as LockIcon,
  Edit as EditIcon,
  SwapHoriz as SwapHorizIcon,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { IconSchool, IconListCheck, IconLayoutGrid, IconTrendingUp } from '@tabler/icons-react';
import StatCard from '@/components/shared/StatCard';
import {
  getClassesWithDivisions,
  saveClasses,
  updateProgramme,
} from '@/api/tenant/set-up/tenant-setup';

// A brand-tinted band for every section header — no color cycling, so the
// page stays calm and consistent regardless of how many groups render, but
// tinted with the primary brand color instead of a flat neutral gray.
const SECTION_HEADER_BG = (theme) => alpha(theme.palette.primary.main, 0.1);

const generateDefaultArmNames = (count) => {
  const letters = [];
  for (let i = 0; i < count; i++) {
    let letter = '';
    let num = i;
    while (num >= 0) {
      letter = String.fromCharCode(65 + (num % 26)) + letter;
      num = Math.floor(num / 26) - 1;
    }
    letters.push(letter);
  }
  return letters;
};

// Short 2-letter badge for a class's programme — programme_code/programme_name
// aren't consistently short (e.g. "SSTechnology"), so map known programme
// names to a proper abbreviation instead of overflowing the badge.
const PROGRAMME_ABBREVIATIONS = {
  science: 'SC',
  humanity: 'HU',
  humanities: 'HU',
  business: 'BU',
  technology: 'TC',
  commercial: 'CM',
  arts: 'AR',
};

const abbreviateProgramme = (cls) => {
  const source = (cls.programme_name || cls.programme_code || '').toLowerCase();
  for (const [key, code] of Object.entries(PROGRAMME_ABBREVIATIONS)) {
    if (source.includes(key)) return code;
  }
  const division = (cls.division_name || '').toLowerCase();
  const stripped = source.startsWith(division) ? source.slice(division.length).trim() : source;
  const words = stripped.split(/\s+/).filter(Boolean);
  const lastWord = words[words.length - 1];
  if (lastWord) return lastWord.slice(0, 2).toUpperCase();
  return (cls.programme_code || '??').slice(0, 2).toUpperCase();
};

// One editable arm-name chip — click the label to rename it inline, click
// the x to remove it outright (shrinking that class's arm count by one).
// An arm with learners already enrolled can still be renamed, but its x is
// replaced with a lock — removing it would either fail against the
// restrict-on-delete FK or, worse, silently shift a later arm's students
// under this one's name (arms are matched by position, not id).
const ArmChip = ({ value, studentCount = 0, onRename, onRemove, disabled }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed && trimmed !== value) onRename(trimmed);
    else setDraft(value);
  };

  if (editing) {
    return (
      <TextField
        inputRef={inputRef}
        size="small"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
          if (e.key === 'Escape') {
            setDraft(value);
            setEditing(false);
          }
        }}
        sx={{ width: 90, '& .MuiInputBase-input': { py: 0.5, px: 1 } }}
      />
    );
  }

  const locked = studentCount > 0;
  const chip = (
    <Chip
      label={value}
      size="small"
      disabled={disabled}
      // A pencil icon is the obvious, standard "click to edit" signal —
      // without it, renaming here is undiscoverable.
      icon={disabled ? undefined : <EditIcon fontSize="small" />}
      onClick={() => !disabled && setEditing(true)}
      onDelete={disabled ? undefined : locked ? () => {} : onRemove}
      deleteIcon={locked ? <LockIcon fontSize="small" /> : undefined}
      sx={{ cursor: disabled ? 'default' : 'pointer', minWidth: 56 }}
    />
  );

  return locked ? (
    <Tooltip
      title={`${studentCount} learner(s) enrolled — cannot be removed. You can still rename it by clicking the label.`}
    >
      {chip}
    </Tooltip>
  ) : (
    chip
  );
};

// A class's name, plus a visible edit icon (not just a click-to-edit
// affordance a user has to discover) that opens the rename modal.
const ClassNameField = ({ value, disabled, onEditClick }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, minWidth: 0 }}>
    <Typography fontWeight={600} noWrap>
      {value}
    </Typography>
    {!disabled && (
      <Tooltip title="Rename class">
        <IconButton size="small" onClick={onEditClick} sx={{ p: 0.25 }}>
          <EditIcon sx={{ fontSize: 14 }} />
        </IconButton>
      </Tooltip>
    )}
  </Box>
);

const classPayload = (cls) => ({
  class_id: cls.id,
  programme_id: cls.programme_id,
  program_class_id: cls.programme_class_id,
  class_name: cls.class_name,
  status: cls.status,
  no_of_arms: cls.no_of_arms || 0,
  class_arm_names: (cls.class_arm_names || []).map((a) => a.name),
});

const SetUpClassesTab = forwardRef(
  ({ onSaveAndContinue, onClassArmsAdded, onReadyChange }, ref) => {
    const [loading, setLoading] = useState(true);
    const [savingAll, setSavingAll] = useState(false);
    const [savingGroupKey, setSavingGroupKey] = useState(null);
    const [classes, setClasses] = useState([]);
    const [originalClasses, setOriginalClasses] = useState([]);
    const [notification, setNotification] = useState({
      open: false,
      message: '',
      severity: 'success',
    });

    // Renaming a class — also a modal now, and also just a local edit
    // (like arm renames) that goes out with the group's own "Save changes"
    // rather than saving on its own.
    const [renamingClassKey, setRenamingClassKey] = useState(null);
    const [classNameDraft, setClassNameDraft] = useState('');

    // Renaming a programme — its own endpoint, saves immediately (a
    // programme name is shared by every class shown under it, not one
    // row's local edit).
    const [renamingProgrammeId, setRenamingProgrammeId] = useState(null);
    const [programmeNameDraft, setProgrammeNameDraft] = useState('');
    const [savingProgrammeId, setSavingProgrammeId] = useState(null);

    // Reassigning a class to a different programme — a modal, not a
    // persistent dropdown on every row. A class with no students is just a
    // local edit (like renaming a class) that goes out with the group's
    // own "Save changes"; one with students saves immediately, gated by
    // the fields below.
    const [reassigningClassKey, setReassigningClassKey] = useState(null);
    const [reassignProgrammeDraft, setReassignProgrammeDraft] = useState('');
    const [reassignPassword, setReassignPassword] = useState('');
    const [reassignError, setReassignError] = useState('');
    const [reassigningSaving, setReassigningSaving] = useState(false);

    // Which group headers are collapsed — collapsed by default: none (all
    // expanded), matching the reference design.
    const [collapsedGroups, setCollapsedGroups] = useState(new Set());
    const [applyAllValues, setApplyAllValues] = useState({});

    const fetchClasses = async () => {
      try {
        const data = await getClassesWithDivisions();
        const flatClasses = [];
        (data || []).forEach((division) => {
          (division.programmes || []).forEach((programme) => {
            (programme.classes || []).forEach((cls) => {
              flatClasses.push({
                ...cls,
                unique_key: `${programme.id}_${cls.id}`,
                programme_id: programme.id,
                programme_code: programme.programme_code,
                programme_name: programme.programme_name,
                division_id: division.id,
                division_name: division.division_name,
                programme_class_id: cls.pivot?.id ?? null,
                no_of_arms: cls.class_arms?.length || 0,
                // { name, studentCount } instead of a plain string, so we
                // know which arms already have learners and must not be
                // removed. studentCount is all-time (matches the DB's
                // restrict-on-delete FK, which doesn't care which term a
                // registration is from) — activeStudentCount is scoped to
                // the current term only, for "does this actually affect
                // anyone right now" warnings like a programme move.
                class_arm_names:
                  cls.class_arms?.map((a) => ({
                    name: a.class_arm_names,
                    studentCount: a.student_registrations_count || 0,
                    activeStudentCount: a.active_student_registrations_count || 0,
                  })) || [],
                arms: cls.arms || [],
                status: cls.status || 'active',
              });
            });
          });
        });
        setClasses(flatClasses);
        setOriginalClasses(flatClasses);
      } catch (error) {
        console.error('Failed to fetch classes:', error);
      }
    };

    useEffect(() => {
      setLoading(true);
      fetchClasses().finally(() => setLoading(false));
    }, []);

    // Notify parent when at least one class has arms generated
    useEffect(() => {
      const isReady = classes.some((c) => c.class_arm_names?.length > 0);
      onReadyChange?.(isReady);
    }, [classes, onReadyChange]);

    // Save everything at once — exposed via ref for the onboarding wizard's
    // own "Save & Continue" footer button. The standalone page instead uses
    // the per-group Save buttons below, so nobody has to scroll to a single
    // save action at the bottom of a long list.
    const saveAllClasses = async () => {
      setSavingAll(true);
      try {
        await saveClasses(classes.map(classPayload));
        await fetchClasses();
        onClassArmsAdded?.();
        setNotification({
          open: true,
          message: 'Classes saved successfully!',
          severity: 'success',
        });
        if (onSaveAndContinue) onSaveAndContinue();
      } catch (error) {
        console.error('Failed to save classes:', error);
        setNotification({
          open: true,
          message: 'Failed to save classes. Please try again.',
          severity: 'error',
        });
      } finally {
        setSavingAll(false);
      }
    };

    useImperativeHandle(ref, () => ({
      save: saveAllClasses,
    }));

    // Adjust one class's arm count by ±1 — extends/truncates its arm-name
    // list to match rather than requiring a separate "Generate" step.
    const blockRemoval = (arm) => {
      setNotification({
        open: true,
        message: `Cannot remove "${arm.name}" — ${arm.studentCount} learner(s) already enrolled in it. Move or remove them first.`,
        severity: 'error',
      });
    };

    const adjustArmCount = (uniqueKey, delta) => {
      const cls = classes.find((c) => c.unique_key === uniqueKey);
      if (!cls) return;
      const currentNames = cls.class_arm_names || [];
      const newCount = Math.max(0, (cls.no_of_arms || 0) + delta);

      if (newCount < currentNames.length) {
        // Shrinking always drops from the end (arms are matched by
        // position on save) — refuse if any arm about to be cut has
        // learners in it.
        const toDrop = currentNames.slice(newCount);
        const occupied = toDrop.find((a) => a.studentCount > 0);
        if (occupied) {
          blockRemoval(occupied);
          return;
        }
      }

      setClasses((prev) =>
        prev.map((c) => {
          if (c.unique_key !== uniqueKey) return c;
          let names = [...(c.class_arm_names || [])];
          if (newCount > names.length) {
            const newLetters = generateDefaultArmNames(newCount).slice(names.length);
            names = [...names, ...newLetters.map((name) => ({ name, studentCount: 0 }))];
          } else if (newCount < names.length) {
            names = names.slice(0, newCount);
          }
          return { ...c, no_of_arms: newCount, class_arm_names: names };
        }),
      );
    };

    const removeArm = (uniqueKey, index) => {
      const cls = classes.find((c) => c.unique_key === uniqueKey);
      const arm = cls?.class_arm_names?.[index];
      if (arm?.studentCount > 0) {
        blockRemoval(arm);
        return;
      }

      setClasses((prev) =>
        prev.map((c) => {
          if (c.unique_key !== uniqueKey) return c;
          const names = [...c.class_arm_names];
          names.splice(index, 1);
          return { ...c, no_of_arms: names.length, class_arm_names: names };
        }),
      );
    };

    const renameArm = (uniqueKey, index, value) => {
      setClasses((prev) =>
        prev.map((cls) => {
          if (cls.unique_key !== uniqueKey) return cls;
          const names = [...cls.class_arm_names];
          names[index] = { ...names[index], name: value };
          return { ...cls, class_arm_names: names };
        }),
      );
    };

    const renameClass = (uniqueKey, value) => {
      setClasses((prev) =>
        prev.map((cls) => (cls.unique_key === uniqueKey ? { ...cls, class_name: value } : cls)),
      );
    };

    const startRenamingClass = (cls) => {
      setRenamingClassKey(cls.unique_key);
      setClassNameDraft(cls.class_name);
    };

    const cancelRenameClass = () => {
      setRenamingClassKey(null);
      setClassNameDraft('');
    };

    const confirmRenameClass = () => {
      const trimmed = classNameDraft.trim();
      if (trimmed) renameClass(renamingClassKey, trimmed);
      cancelRenameClass();
    };

    const startRenamingProgramme = (programmeId, currentName) => {
      setRenamingProgrammeId(programmeId);
      setProgrammeNameDraft(currentName);
    };

    const cancelRenameProgramme = () => {
      setRenamingProgrammeId(null);
      setProgrammeNameDraft('');
    };

    const commitRenameProgramme = async () => {
      const programmeId = renamingProgrammeId;
      const trimmed = programmeNameDraft.trim();
      const current = classes.find((c) => c.programme_id === programmeId)?.programme_name;

      if (!trimmed || trimmed === current) {
        cancelRenameProgramme();
        return;
      }

      setSavingProgrammeId(programmeId);
      try {
        await updateProgramme(programmeId, trimmed);
        setClasses((prev) =>
          prev.map((c) => (c.programme_id === programmeId ? { ...c, programme_name: trimmed } : c)),
        );
        setOriginalClasses((prev) =>
          prev.map((c) => (c.programme_id === programmeId ? { ...c, programme_name: trimmed } : c)),
        );
        setNotification({
          open: true,
          message: 'Programme renamed successfully!',
          severity: 'success',
        });
      } catch (error) {
        console.error('Failed to rename programme:', error);
        setNotification({
          open: true,
          message: 'Failed to rename programme. Please try again.',
          severity: 'error',
        });
      } finally {
        setSavingProgrammeId(null);
        cancelRenameProgramme();
      }
    };

    // Moves a class to a different programme within the same division —
    // its arms/status/name are unaffected, only which programme group it
    // shows under changes.
    const reassignProgramme = (uniqueKey, newProgrammeId, newProgrammeName, newProgrammeCode) => {
      setClasses((prev) =>
        prev.map((cls) =>
          cls.unique_key === uniqueKey
            ? {
                ...cls,
                programme_id: newProgrammeId,
                programme_name: newProgrammeName,
                programme_code: newProgrammeCode,
              }
            : cls,
        ),
      );
    };

    const startReassigningProgramme = (cls) => {
      setReassigningClassKey(cls.unique_key);
      setReassignProgrammeDraft(String(cls.programme_id));
    };

    const cancelReassignProgramme = () => {
      setReassigningClassKey(null);
      setReassignProgrammeDraft('');
      setReassignPassword('');
      setReassignError('');
    };

    const reassigningClassStudentCount = (() => {
      const cls = classes.find((c) => c.unique_key === reassigningClassKey);
      return (cls?.class_arm_names || []).reduce((sum, a) => sum + (a.activeStudentCount || 0), 0);
    })();

    // A class with no students yet is a harmless local edit, queued like a
    // rename, saved with the group's own "Save changes". A class that
    // already has students moves them too, so this saves immediately and
    // requires the user's password — the server needs to gate it before
    // anything moves, not after a batch of unrelated edits.
    const confirmReassignProgramme = async () => {
      const cls = classes.find((c) => c.unique_key === reassigningClassKey);
      const division = cls ? programmesByDivisionId[cls.division_id] : null;
      const target = division?.find((p) => p.id === Number(reassignProgrammeDraft));
      if (!cls || !target) return;

      if (reassigningClassStudentCount === 0) {
        reassignProgramme(cls.unique_key, target.id, target.name, target.code);
        cancelReassignProgramme();
        return;
      }

      if (!reassignPassword) {
        setReassignError('Enter your password to confirm this.');
        return;
      }

      setReassigningSaving(true);
      setReassignError('');
      try {
        const payload = {
          ...classPayload(cls),
          programme_id: target.id,
          confirm_password: reassignPassword,
        };
        const res = await saveClasses([payload]);
        if (res?.status) {
          const updated = {
            programme_id: target.id,
            programme_name: target.name,
            programme_code: target.code,
          };
          setClasses((prev) =>
            prev.map((c) => (c.unique_key === cls.unique_key ? { ...c, ...updated } : c)),
          );
          setOriginalClasses((prev) =>
            prev.map((c) => (c.unique_key === cls.unique_key ? { ...c, ...updated } : c)),
          );
          setNotification({
            open: true,
            message: `Moved ${cls.class_name} to ${target.name} successfully!`,
            severity: 'success',
          });
          cancelReassignProgramme();
        } else {
          setReassignError(res?.message || 'Failed to move class.');
        }
      } catch (error) {
        setReassignError(
          error?.message || 'Incorrect password, or something went wrong. Please try again.',
        );
      } finally {
        setReassigningSaving(false);
      }
    };

    // Every distinct programme seen within each division — the choices
    // offered when reassigning a class to a different programme, derived
    // from data already loaded rather than a second request.
    const programmesByDivisionId = useMemo(() => {
      const map = {};
      classes.forEach((c) => {
        if (!map[c.division_id]) map[c.division_id] = new Map();
        map[c.division_id].set(c.programme_id, {
          id: c.programme_id,
          name: c.programme_name,
          code: c.programme_code,
        });
      });
      return Object.fromEntries(
        Object.entries(map).map(([divId, progMap]) => [divId, Array.from(progMap.values())]),
      );
    }, [classes]);

    // ── Group by division, splitting a division into one group per
    // programme only when it actually has more than one (e.g. Senior
    // Secondary — Science / — Humanity / ...); a division with a single
    // programme (Junior Secondary) stays as one plain group.
    const divisionProgrammeIds = useMemo(() => {
      const map = {};
      classes.forEach((c) => {
        if (!map[c.division_name]) map[c.division_name] = new Set();
        map[c.division_name].add(c.programme_id);
      });
      return map;
    }, [classes]);

    const groupKeyFor = (cls) => {
      const multi = (divisionProgrammeIds[cls.division_name]?.size || 0) > 1;
      return multi ? `${cls.division_name}—${cls.programme_id}` : cls.division_name;
    };
    const groupLabelFor = (cls) => {
      const multi = (divisionProgrammeIds[cls.division_name]?.size || 0) > 1;
      if (!multi) return cls.division_name;
      // Programme names often already embed the division name (e.g.
      // "Senior Secondary Science") — strip that prefix so the label reads
      // "Senior Secondary — Science" instead of repeating it.
      const fullName = cls.programme_name || cls.programme_code || '';
      const suffix = fullName.toLowerCase().startsWith(cls.division_name.toLowerCase())
        ? fullName.slice(cls.division_name.length).trim()
        : fullName;
      return `${cls.division_name} — ${suffix || fullName}`;
    };

    const groups = useMemo(() => {
      const order = [];
      const byKey = {};
      classes.forEach((cls) => {
        const key = groupKeyFor(cls);
        if (!byKey[key]) {
          byKey[key] = { key, label: groupLabelFor(cls), items: [] };
          order.push(key);
        }
        byKey[key].items.push(cls);
      });
      return order.map((key) => byKey[key]);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classes, divisionProgrammeIds]);

    const toggleGroup = (key) => {
      setCollapsedGroups((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    };

    const collapseAll = () => setCollapsedGroups(new Set(groups.map((g) => g.key)));
    const expandAll = () => setCollapsedGroups(new Set());

    const handleApplyToAll = (group) => {
      const n = parseInt(applyAllValues[group.key], 10);
      if (!n || n < 1) return;

      const keys = new Set(group.items.map((c) => c.unique_key));
      const skipped = [];

      setClasses((prev) =>
        prev.map((cls) => {
          if (!keys.has(cls.unique_key)) return cls;

          const currentNames = cls.class_arm_names || [];
          const occupiedBeyond = currentNames.slice(n).find((a) => a.studentCount > 0);
          if (occupiedBeyond) {
            skipped.push(cls.class_name);
            return cls;
          }

          // Rename to defaults but keep each position's studentCount (the
          // arm itself — and its learners — is unchanged, only its label
          // resets to the default letter).
          const letters = generateDefaultArmNames(n);
          const names = letters.map((name, i) => ({
            name,
            studentCount: currentNames[i]?.studentCount || 0,
          }));
          return { ...cls, no_of_arms: n, class_arm_names: names };
        }),
      );

      if (skipped.length > 0) {
        setNotification({
          open: true,
          message: `Set ${n} arm(s) for ${group.items.length - skipped.length} class(es). Skipped ${skipped.join(', ')} — reducing to ${n} would remove an arm that already has learners in it.`,
          severity: 'warning',
        });
      } else {
        setNotification({
          open: true,
          message: `Set ${n} arm(s) for all ${group.items.length} class(es) in ${group.label}.`,
          severity: 'success',
        });
      }
    };

    // A class is "dirty" if it differs from the last-saved snapshot — drives
    // each group's own Save button so a section only saves (and reports
    // itself as saved) when it actually has something to save.
    const isClassDirty = (cls) => {
      const orig = originalClasses.find((o) => o.unique_key === cls.unique_key);
      if (!orig) return false;
      const names = (cls.class_arm_names || []).map((a) => a.name);
      const origNames = (orig.class_arm_names || []).map((a) => a.name);
      return (
        orig.no_of_arms !== cls.no_of_arms ||
        orig.status !== cls.status ||
        orig.class_name !== cls.class_name ||
        orig.programme_id !== cls.programme_id ||
        JSON.stringify(origNames) !== JSON.stringify(names)
      );
    };

    const groupHasChanges = (group) => group.items.some(isClassDirty);

    const handleSaveGroup = async (group) => {
      setSavingGroupKey(group.key);
      try {
        await saveClasses(group.items.map(classPayload));
        setOriginalClasses((prev) =>
          prev.map((o) => group.items.find((g) => g.unique_key === o.unique_key) || o),
        );
        onClassArmsAdded?.();
        setNotification({
          open: true,
          message: `${group.label} saved successfully!`,
          severity: 'success',
        });
      } catch (error) {
        console.error('Failed to save group:', error);
        setNotification({
          open: true,
          message: `Failed to save ${group.label}. Please try again.`,
          severity: 'error',
        });
      } finally {
        setSavingGroupKey(null);
      }
    };

    // ── Completeness stats
    const stats = useMemo(() => {
      const totalClasses = classes.length;
      const configuredClasses = classes.filter((c) => c.class_arm_names?.length > 0).length;
      const totalArms = classes.reduce((sum, c) => sum + (c.class_arm_names?.length || 0), 0);
      const setupProgress =
        totalClasses > 0 ? Math.round((configuredClasses / totalClasses) * 100) : 0;
      const classesWithNoArms = totalClasses - configuredClasses;
      const multiArmClasses = classes.filter((c) => (c.class_arm_names?.length || 0) > 1).length;
      const multiArmPercent =
        totalClasses > 0 ? Math.round((multiArmClasses / totalClasses) * 100) : 0;
      const occupiedArms = classes.reduce(
        (sum, c) => sum + (c.class_arm_names?.filter((a) => a.studentCount > 0).length || 0),
        0,
      );
      const occupiedArmsPercent = totalArms > 0 ? Math.round((occupiedArms / totalArms) * 100) : 0;
      return {
        totalClasses,
        configuredClasses,
        totalArms,
        setupProgress,
        classesWithNoArms,
        multiArmClasses,
        multiArmPercent,
        occupiedArms,
        occupiedArmsPercent,
      };
    }, [classes]);

    if (loading) {
      return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Grid container spacing={1.5}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Grid key={i} size={{ xs: 12, sm: 6, md: 3 }}>
                <Skeleton variant="rounded" height={90} />
              </Grid>
            ))}
          </Grid>
          <Skeleton variant="rounded" height={260} />
          <Skeleton variant="rounded" height={260} />
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* ── Completeness stats — one card each, same style used elsewhere ── */}
        <Grid container spacing={1.5} alignItems="stretch">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={stats.totalClasses}
              label="Total Classes"
              icon={IconSchool}
              colorIndex={0}
              tooltip="Every class configured for this school."
              progress={stats.multiArmPercent}
              subtitle={`${stats.multiArmClasses} with multiple arms`}
              sx={{ height: '100%' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={`${stats.configuredClasses}/${stats.totalClasses}`}
              label="Arms Configured"
              icon={IconListCheck}
              colorIndex={1}
              tooltip="Classes that already have arm names generated."
              progress={stats.setupProgress}
              subtitle={
                stats.classesWithNoArms > 0
                  ? `${stats.classesWithNoArms} class(es) pending`
                  : 'All classes covered'
              }
              sx={{ height: '100%' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={stats.totalArms}
              label="Total Arms"
              icon={IconLayoutGrid}
              colorIndex={2}
              tooltip="Total class arms (streams) generated across all classes."
              progress={stats.occupiedArmsPercent}
              subtitle={`${stats.occupiedArms} of ${stats.totalArms} have learners`}
              sx={{ height: '100%' }}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <StatCard
              count={`${stats.setupProgress}%`}
              label="Setup Progress"
              icon={IconTrendingUp}
              colorIndex={stats.classesWithNoArms > 0 ? 3 : 1}
              progress={stats.setupProgress}
              subtitle={
                stats.classesWithNoArms > 0
                  ? `${stats.classesWithNoArms} class(es) still need arms`
                  : 'All classes covered'
              }
              sx={{ height: '100%' }}
            />
          </Grid>
        </Grid>

        {/* ── Header actions ── */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" onClick={collapseAll}>
            Collapse all
          </Button>
          <Button size="small" variant="outlined" onClick={expandAll}>
            Expand all
          </Button>
        </Box>

        {/* ── Grouped class list ── */}
        {groups.map((group) => {
          const collapsed = collapsedGroups.has(group.key);
          const armsInGroup = group.items.reduce(
            (sum, c) => sum + (c.class_arm_names?.length || 0),
            0,
          );
          const dirty = groupHasChanges(group);
          const groupSaving = savingGroupKey === group.key;

          return (
            <Paper
              key={group.key}
              variant="outlined"
              sx={{ borderRadius: 3, overflow: 'hidden', bgcolor: 'background.paper' }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  gap: 2,
                  flexWrap: 'wrap',
                  cursor: 'pointer',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? alpha(theme.palette.primary.main, 0.16)
                      : SECTION_HEADER_BG(theme),
                  borderBottom: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'divider' : '#aab1b9'),
                  borderLeft: '4px solid',
                  borderLeftColor: 'primary.main',
                }}
                onClick={() => toggleGroup(group.key)}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton size="small">
                    {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                  </IconButton>
                  <Box>
                    <Typography fontWeight={700}>{group.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {group.items.length} class{group.items.length !== 1 ? 'es' : ''} ·{' '}
                      {armsInGroup} arms
                    </Typography>
                  </Box>
                </Box>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Typography variant="caption" color="text.secondary">
                    Apply to all
                  </Typography>
                  {/* Same +/- stepper as each row below, for consistency */}
                  <IconButton
                    size="small"
                    onClick={() =>
                      setApplyAllValues((prev) => ({
                        ...prev,
                        [group.key]: Math.max(0, (parseInt(prev[group.key], 10) || 0) - 1),
                      }))
                    }
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ width: 24, textAlign: 'center' }}>
                    {parseInt(applyAllValues[group.key], 10) || 0}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setApplyAllValues((prev) => ({
                        ...prev,
                        [group.key]: (parseInt(prev[group.key], 10) || 0) + 1,
                      }))
                    }
                    sx={{ bgcolor: 'background.paper' }}
                  >
                    <AddIcon fontSize="small" />
                  </IconButton>
                  <Button size="small" variant="contained" onClick={() => handleApplyToAll(group)}>
                    Apply
                  </Button>

                  {/* This section's own Save — no need to scroll to a
                      page-level save button. */}
                  <Button
                    size="small"
                    variant={dirty ? 'contained' : 'outlined'}
                    color={dirty ? 'primary' : 'inherit'}
                    disabled={!dirty || groupSaving}
                    onClick={() => handleSaveGroup(group)}
                    startIcon={groupSaving ? <CircularProgress size={14} color="inherit" /> : null}
                  >
                    {groupSaving ? 'Saving...' : dirty ? 'Save changes' : 'Saved'}
                  </Button>
                </Box>
              </Box>

              <Collapse in={!collapsed}>
                <Box sx={{ p: 2 }}>
                  <Grid
                    container
                    sx={{
                      px: 1.5,
                      py: 1,
                      mb: 1,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? alpha(theme.palette.primary.main, 0.16)
                          : SECTION_HEADER_BG(theme),
                    }}
                  >
                    <Grid size={4}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ textTransform: 'uppercase' }}
                      >
                        Class
                      </Typography>
                    </Grid>
                    <Grid size={3}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ textTransform: 'uppercase' }}
                      >
                        Arms
                      </Typography>
                    </Grid>
                    <Grid size={5}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ textTransform: 'uppercase' }}
                      >
                        Arm Names
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {group.items.map((cls) => {
                      const isInactive = cls.status === 'inactive';
                      return (
                        <Box
                          key={cls.unique_key}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            py: 1,
                            px: 1.5,
                            borderRadius: 2,
                            bgcolor: (theme) =>
                              isInactive
                                ? theme.palette.mode === 'dark'
                                  ? 'action.disabledBackground'
                                  : '#e0e3e6'
                                : theme.palette.mode === 'dark'
                                  ? 'action.hover'
                                  : '#eef0f2',
                            opacity: isInactive ? 0.6 : 1,
                          }}
                        >
                          <Grid container alignItems="center" sx={{ flex: 1 }}>
                            <Grid size={4}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Box
                                  sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '10px',
                                    bgcolor: 'primary.light',
                                    color: 'primary.main',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 700,
                                    fontSize: 12,
                                    flexShrink: 0,
                                  }}
                                >
                                  {abbreviateProgramme(cls)}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <ClassNameField
                                    value={cls.class_name}
                                    disabled={isInactive}
                                    onEditClick={() => startRenamingClass(cls)}
                                  />
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                    <Typography variant="caption" color="text.secondary" noWrap>
                                      {cls.programme_name} – {cls.class_name}
                                      {/* {cls.programme_code} – {cls.class_code} */}
                                    </Typography>
                                    {!isInactive && (
                                      <Tooltip title={`Rename programme "${cls.programme_name}"`}>
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            startRenamingProgramme(
                                              cls.programme_id,
                                              cls.programme_name,
                                            )
                                          }
                                          sx={{ p: 0.25 }}
                                        >
                                          <EditIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                    {(programmesByDivisionId[cls.division_id]?.length || 0) > 1 && (
                                      <Tooltip title="Move to a different programme">
                                        <IconButton
                                          size="small"
                                          disabled={isInactive}
                                          onClick={() => startReassigningProgramme(cls)}
                                          sx={{ p: 0.25 }}
                                        >
                                          <SwapHorizIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                      </Tooltip>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                            </Grid>

                            <Grid size={3}>
                              {(() => {
                                const lastArm =
                                  cls.class_arm_names?.[cls.class_arm_names.length - 1];
                                const removalBlocked = !isInactive && lastArm?.studentCount > 0;
                                const decrementBtn = (
                                  <IconButton
                                    size="small"
                                    disabled={isInactive || !cls.no_of_arms || removalBlocked}
                                    onClick={() => adjustArmCount(cls.unique_key, -1)}
                                    sx={{ bgcolor: 'background.paper' }}
                                  >
                                    <RemoveIcon fontSize="small" />
                                  </IconButton>
                                );
                                return (
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    {removalBlocked ? (
                                      <Tooltip
                                        title={`"${lastArm.name}" has ${lastArm.studentCount} learner(s) enrolled — remove or move them first.`}
                                      >
                                        <span>{decrementBtn}</span>
                                      </Tooltip>
                                    ) : (
                                      decrementBtn
                                    )}
                                    <Typography sx={{ width: 24, textAlign: 'center' }}>
                                      {cls.no_of_arms || 0}
                                    </Typography>
                                    <IconButton
                                      size="small"
                                      disabled={isInactive}
                                      onClick={() => adjustArmCount(cls.unique_key, 1)}
                                      sx={{ bgcolor: 'background.paper' }}
                                    >
                                      <AddIcon fontSize="small" />
                                    </IconButton>
                                  </Box>
                                );
                              })()}
                            </Grid>

                            <Grid size={5}>
                              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                                {cls.class_arm_names?.length > 0 ? (
                                  cls.class_arm_names.map((arm, i) => (
                                    <ArmChip
                                      key={i}
                                      value={arm.name}
                                      studentCount={arm.studentCount}
                                      disabled={isInactive}
                                      onRename={(v) => renameArm(cls.unique_key, i, v)}
                                      onRemove={() => removeArm(cls.unique_key, i)}
                                    />
                                  ))
                                ) : (
                                  <Typography variant="body2" color="text.secondary">
                                    No arms yet
                                  </Typography>
                                )}
                                {!isInactive && (
                                  <Chip
                                    label="+ Add"
                                    size="small"
                                    variant="outlined"
                                    onClick={() => adjustArmCount(cls.unique_key, 1)}
                                    sx={{
                                      borderStyle: 'dashed',
                                      cursor: 'pointer',
                                      bgcolor: 'background.paper',
                                    }}
                                  />
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              </Collapse>
            </Paper>
          );
        })}

        <Dialog
          open={renamingClassKey !== null}
          onClose={cancelRenameClass}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Rename Class</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Class name"
              value={classNameDraft}
              onChange={(e) => setClassNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmRenameClass();
              }}
              sx={{ mt: 1 }}
            />
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.5 }}>
              This applies once you click "Save changes" for this section.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={cancelRenameClass}>Cancel</Button>
            <Button
              variant="contained"
              onClick={confirmRenameClass}
              disabled={!classNameDraft.trim()}
            >
              Rename
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={renamingProgrammeId !== null}
          onClose={cancelRenameProgramme}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Rename Programme</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              size="small"
              label="Programme name"
              value={programmeNameDraft}
              onChange={(e) => setProgrammeNameDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRenameProgramme();
              }}
              disabled={savingProgrammeId !== null}
              sx={{ mt: 1 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={cancelRenameProgramme} disabled={savingProgrammeId !== null}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={commitRenameProgramme}
              disabled={savingProgrammeId !== null || !programmeNameDraft.trim()}
            >
              {savingProgrammeId !== null ? <CircularProgress size={18} color="inherit" /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={reassigningClassKey !== null}
          onClose={cancelReassignProgramme}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Move to a Different Programme</DialogTitle>
          <DialogContent>
            {(() => {
              const cls = classes.find((c) => c.unique_key === reassigningClassKey);
              const options = cls ? programmesByDivisionId[cls.division_id] || [] : [];
              return (
                <>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {cls?.class_name} is currently under <strong>{cls?.programme_name}</strong>.
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Programme"
                    value={reassignProgrammeDraft}
                    onChange={(e) => setReassignProgrammeDraft(e.target.value)}
                    disabled={reassigningSaving}
                  >
                    {options.map((p) => (
                      <MenuItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  {reassigningClassStudentCount > 0 ? (
                    <>
                      <Alert
                        severity="warning"
                        variant="filled"
                        sx={{ mt: 2, bgcolor: '#ed6c02', color: '#fff', fontWeight: 500 }}
                      >
                        This class has {reassigningClassStudentCount} enrolled student(s). Moving it
                        will move all of them — and their arms — to the new programme too, right
                        away. Enter your password to confirm.
                      </Alert>
                      <TextField
                        fullWidth
                        size="small"
                        type="password"
                        label="Your password"
                        value={reassignPassword}
                        onChange={(e) => setReassignPassword(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') confirmReassignProgramme();
                        }}
                        disabled={reassigningSaving}
                        sx={{ mt: 2 }}
                        autoFocus
                      />
                      {reassignError && (
                        <Typography
                          variant="caption"
                          color="error.main"
                          display="block"
                          sx={{ mt: 1 }}
                        >
                          {reassignError}
                        </Typography>
                      )}
                    </>
                  ) : (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ mt: 1.5 }}
                    >
                      This applies once you click "Save changes" for this section.
                    </Typography>
                  )}
                </>
              );
            })()}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={cancelReassignProgramme} disabled={reassigningSaving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={confirmReassignProgramme}
              disabled={reassigningSaving}
            >
              {reassigningSaving ? <CircularProgress size={18} color="inherit" /> : 'Move'}
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={notification.open}
          autoHideDuration={3000}
          onClose={() => setNotification({ ...notification, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{ zIndex: (theme) => theme.zIndex.modal + 9999 }}
        >
          <Alert
            onClose={() => setNotification({ ...notification, open: false })}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  },
);

export default SetUpClassesTab;
