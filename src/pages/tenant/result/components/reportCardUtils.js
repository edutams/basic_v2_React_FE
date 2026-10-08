// Shared report-card plumbing used by both the admin Student Dossier
// (ReportSheetTab) and the learner Report Card (ReportCardTab) views, so the
// 13 shipped templates always receive the exact prop shape they expect.

export const displayScore = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  return value;
};

// Stored `ca` JSON may be an array (manual entry) or a keyed object
// (combined Excel upload) — normalise both to an entity array per CA type.
export const normalizeCa = (ca) => {
  if (!ca) return [];
  if (Array.isArray(ca)) return ca;
  if (typeof ca === 'object') return Object.values(ca);
  return [];
};

export const getEntityTotal = (entities) => {
  if (!entities) return 0;
  const list = Array.isArray(entities) ? entities : Object.values(entities);
  return list.reduce((sum, e) => sum + Number(e?.score || 0), 0);
};

export const ordinalSuffix = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

// ── Signatures (comment nomenclatures) ────────────────────────
// The dossier payload carries the school's active comment
// nomenclatures (position + uploaded signature). Each template slot is
// filled by matching the position name, so the printed signature is the
// one the school configured instead of a hardcoded image.
const HEAD_OF_SCHOOL_PATTERN = /head of school|principal|head teacher|proprietor|chief instructor/i;
const CLASS_TEACHER_PATTERN = /class teacher|classmaster|class master|form teacher|form master/i;

const DEFAULT_HOS_LABEL = "Head of School's Signature";
const DEFAULT_TEACHER_LABEL = "Class Teacher's Signature";

// "Principal's" → "Principal's Signature"; anything already naming a
// signature is left alone.
const signatureLabel = (entry, fallback) => {
  const name = (entry?.position_name || '').trim();
  if (!name) return fallback;
  return /signature/i.test(name) ? name : `${name} Signature`;
};

export const resolveSignatures = (list = []) => {
  const active = (list || []).filter((s) => s && (s.status ?? 'active') === 'active');
  const withImage = active.filter((s) => s.signature);
  const match = (pattern) => withImage.find((s) => pattern.test(s.position_name || '')) || null;

  const headOfSchool = match(HEAD_OF_SCHOOL_PATTERN);
  const classTeacher = match(CLASS_TEACHER_PATTERN);

  return {
    list: active,
    head_of_school: headOfSchool
      ? { ...headOfSchool, label: signatureLabel(headOfSchool, DEFAULT_HOS_LABEL) }
      : null,
    class_teacher: classTeacher
      ? { ...classTeacher, label: signatureLabel(classTeacher, DEFAULT_TEACHER_LABEL) }
      : null,
  };
};

// ── Cognitive Domain columns ───────────────────────────────────
// The templates' subject tables are driven by the mark configuration
// (how many CAs, what each is worth), not by a fixed 2-test layout —
// a school on CA 30 / Exam 70 gets 30 and 70, not the 20 / 80 that used
// to be hardcoded in every template.

// `ca_content` arrives as a list, but older payloads still carry the raw
// {"ca1": {...}, "ca2": {...}} object (or its JSON string) — read all three.
const caContentList = (markConfig) => {
  let raw = markConfig?.ca_content;
  if (!raw) return [];
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch (error) {
      return [];
    }
  }
  if (Array.isArray(raw)) return raw;
  return typeof raw === 'object' ? Object.values(raw) : [];
};

// "Exam (70%)" — the configured weight, plain text when unconfigured.
export const pctLabel = (label, max) => {
  const value = Number(max);
  return value ? `${label} (${value}%)` : label;
};

// Same, without the percent sign — the transposed templates print the
// obtainable marks as bare numbers (20, 80, 100).
export const withWeight = (label, max) => {
  const value = Number(max);
  return value ? `${label} (${value})` : label;
};

// One CA column per configured CA, keyed to the `ca1..caN` values the
// subjects carry. Falls back to whatever the stored results contain when
// the term has no mark configuration yet.
export const caColumnsFor = (report, subjects = []) => {
  const caContent = caContentList(report?.mark_config);
  if (caContent.length > 0) {
    return caContent.map((c, idx) => ({
      key: `ca${idx + 1}`,
      name: c?.display_name || `CA ${idx + 1}`,
      max: Number(c?.max_score || 0),
    }));
  }

  const first = subjects[0] || {};
  return Object.keys(first)
    .filter((key) => /^ca\d+$/.test(key))
    .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)))
    .map((key, idx) => ({
      key,
      name: first[`${key}_name`] || `CA ${idx + 1}`,
      max: Number(first[`${key}_max`] || 0),
    }));
};

// CA total for one subject: the server-computed `ca_total`, falling back to
// adding the individual CA scores when it is missing.
export const caTotal = (subject) => {
  if (subject?.ca_total !== null && subject?.ca_total !== undefined) return subject.ca_total;
  const keys = Object.keys(subject || {}).filter((key) => /^ca\d+$/.test(key));
  if (keys.length === 0) return null;
  return keys.reduce((sum, key) => sum + Number(subject[key] || 0), 0);
};

// Build the `report` prop consumed by the result templates out of the
// dossier API payload (see ResultDossierController::studentReport).
export const buildReportProp = (report) => {
  if (!report) return null;
  const caContent = caContentList(report.mark_config);
  const perCaNames = caContent.map((c) => c?.display_name || 'CA');

  const subjects = (report.subjects || []).map((s) => {
    const caArr = normalizeCa(s.ca);
    const subject = { subject_name: s.subject_name };
    caArr.forEach((c, idx) => {
      const key = `ca${idx + 1}`;
      subject[key] = getEntityTotal(c?.entities);
      subject[`${key}_name`] = c?.display_name || perCaNames[idx] || `CA ${idx + 1}`;
      subject[`${key}_max`] = Number(c?.max_score || 0);
    });
    subject.ca_total = s.ca_total;
    subject.exam = s.exam_score;
    subject.exam_max = Number(report.mark_config?.exam_max_score || 100);
    subject.total = s.overall_total;
    subject.highest = s.highest;
    subject.lowest = s.lowest;
    subject.class_average = s.class_average;
    subject.position = s.position ? `${s.position}${ordinalSuffix(s.position)}` : '-';
    subject.grade = s.grade || '-';
    subject.remark = s.remark || '-';
    return subject;
  });

  const caColumns = caColumnsFor(report, subjects);

  return {
    subjects,
    ca_names: perCaNames,
    // Column layout + weights for the Cognitive Domain tables.
    ca_columns: caColumns,
    ca_max: Number(report.mark_config?.ca_max_score || 0),
    exam_max: Number(report.mark_config?.exam_max_score || 0),
    no_of_ca: report.mark_config?.no_of_ca ?? caColumns.length,
    class_population: report.summary?.class_population ?? 0,
    // How many subjects actually HAVE a score — not subjects.length (every
    // registered subject, scored or not). Templates must use this (times
    // ca_max + exam_max) for "Total Score X/Y", not a hardcoded per-subject
    // max times the full subject count, which only matches by coincidence
    // when every subject happens to be scored.
    subjects_scored: report.summary?.subjects_scored ?? 0,
    position: report.summary?.overall_position || '-',
    total_score: report.summary?.total_score ?? 0,
    average_score: report.summary?.average_score ?? 0,
    arm_average: report.summary?.arm_average ?? 0,
    passed_count: report.summary?.passed_count ?? 0,
    failed_count: report.summary?.failed_count ?? 0,
    affective: report.affective || {},
    psychomotor: report.psychomotor || {},
    // Saved on the registration by the broadsheet
    // (student_registrations.class_teachers_comment / hos_comment).
    teacherComment: report.class_teachers_comment || report.teacher_comment || '',
    adminComment: report.hos_comment || report.admin_comment || '',
    attendance: {
      opened: report.attendance?.opened ?? 0,
      present: report.attendance?.present ?? 0,
      absent: report.attendance?.absent ?? 0,
    },
    term_dates: {
      start_date: report.session_term?.start_date || null,
      end_date: report.session_term?.end_date || null,
    },
    grade_settings: report.grade_settings || [],
    // Signatories resolved from comment_nomenclatures (see above).
    signatures: resolveSignatures(report.comment_nomenclatures),
    pass_mark: report.pass_mark,
    publish: report.result_publish,
    // Third-term promotion fields (see promotionLine below).
    promotion_recommendation: report.promotion_recommendation || '',
    next_class_name: report.next_class_name || '',
  };
};

/**
 * Third-term promotion line for the report-card templates, mirroring basic
 * v1's Promotion Status block. Returns null unless the recommendation is
 * set (only happens on the third term), so templates can hide the block
 * entirely for terms 1 and 2.
 */
export const promotionLine = (report, className = '') => {
  const recommendation = (report?.promotion_recommendation || '').toLowerCase();
  if (!recommendation) return null;

  switch (recommendation) {
    case 'promoted':
      return report?.next_class_name
        ? `Promoted to ${report.next_class_name}`
        : `Promoted to ${className || 'the next class'}`;
    case 'promoted on trial':
      return report?.next_class_name
        ? `Promoted on trial to ${report.next_class_name}`
        : 'Promoted on trial';
    case 'not promoted':
      return className ? `Not promoted, to repeat ${className}` : 'Not promoted';
    case 'advised to repeat':
      return className ? `Advised to repeat ${className}` : 'Advised to repeat';
    case 'graduated':
      return 'Graduated';
    default:
      return recommendation;
  }
};

// Grade scale for the templates' key tables (from configured grade settings).
export const gradeScaleFor = (report) => {
  const gs = report?.grade_settings || [];
  if (gs.length === 0) return [];
  return gs.map((g) => ({
    range: `${Number(g.min_score)} - ${Number(g.max_score)}`,
    grade: g.grade,
    remark: g.remark,
  }));
};

// Open a print window containing only the given node's markup, with the
// report-card styling the templates assume (they render MUI tables).
export const printNode = (node, title = 'Report Card') => {
  if (!node) return false;
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) return false;

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Times New Roman', Times, serif; font-size: 14px; color: #000; background: #fff; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
          table { border-collapse: collapse; width: 100%; }
          table, th, td { border: 1px solid #000; }
          th, td { padding: 4px 8px; text-align: left; vertical-align: middle; }
          th { font-weight: 700; }
          img { max-width: 100%; height: auto; }
          strong { font-weight: 700; }
          u { text-decoration: underline; }
          .tpl1-header-box, .tpl2-header-box { display: flex; flex-wrap: wrap; }
          .tpl1-header-box > div, .tpl2-header-box > div { flex: 1 1 200px; }
          .tpl1-main, .tpl2-main { display: flex; flex-wrap: wrap; }
          .tpl1-cognitive, .tpl2-cognitive { flex: 3 1 0%; }
          .tpl1-affective, .tpl2-right { flex: 1 1 0%; }
          .tpl1-bottom-row, .tpl2-keys-row { display: flex; flex-wrap: wrap; }
          .tpl1-bottom-row > div, .tpl2-keys-row > div { flex: 1 1 0%; }
          @page { size: A4 portrait; margin: 10mm; }
          @media print { body { margin: 0; } table { page-break-inside: auto; } tr { page-break-inside: avoid; } }
        </style>
      </head>
      <body>${node.innerHTML}</body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 800);

  return true;
};
