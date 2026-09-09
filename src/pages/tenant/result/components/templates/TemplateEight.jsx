import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar } from '@mui/material';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #999' };

const StarRating = ({ value, max = 5 }) => (
  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
    {Array.from({ length: max }, (_, i) => (
      i < value
        ? <span key={i} style={{ color: '#d4a017' }}><IconStarFilled size={16} /></span>
        : <span key={i} style={{ color: '#ccc' }}><IconStar size={16} /></span>
    ))}
  </div>
);

const SectionCard = ({ title, children }) => (
  <div style={{ marginBottom: 0 }}>
    <div style={{ padding: '4px 8px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px 4px 0 0' }}>
      <Typography variant="body2" fontWeight={600}>{title}</Typography>
    </div>
    <div style={{ border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '4px 8px' }}>{children}</div>
  </div>
);

const responsiveCSS = `
  .tpl8-main { display: flex; flex-wrap: wrap; gap: 0; }
  .tpl8-left { flex: 3 1 0%; min-width: 0; }
  .tpl8-right { flex: 1 1 0%; min-width: 0; }
  .tpl8-bottom-row { display: flex; flex-wrap: wrap; gap: 0; }
  .tpl8-bottom-row > div { flex: 1 1 0%; min-width: 0; }
  .tpl8-subject-table { overflow-x: auto; }
  .tpl8-photo-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 12px; flex-wrap: wrap; }
  .tpl8-photo-row > div:first-child { flex: 1 1 0%; min-width: 0; }
  .tpl8-photo-row > div:last-child { flex: 0 0 auto; }
  @media (max-width: 900px) {
    .tpl8-main { flex-direction: column; }
    .tpl8-left, .tpl8-right { flex: 1 1 100%; }
    .tpl8-bottom-row { flex-direction: column; }
    .tpl8-bottom-row > div { flex: 1 1 100%; }
    .tpl8-photo-row { flex-direction: column; align-items: center; }
  }
`;

const TemplateEight = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;
  const affectiveAvg = Object.values(report.affective).length ? Math.round(Object.values(report.affective).reduce((a, b) => a + b, 0) / Object.values(report.affective).length) : 0;
  const psychomotorAvg = Object.values(report.psychomotor).length ? Math.round(Object.values(report.psychomotor).reduce((a, b) => a + b, 0) / Object.values(report.psychomotor).length) : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── Student Photo + Info ───────────────────────── */}
      <div className="tpl8-photo-row">
        <div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: '0 0 70px' }}>
              <Avatar sx={{ width: 70, height: 70, bgcolor: '#667eea' }} variant="circular">{student?.fname?.[0]}{student?.lname?.[0]}</Avatar>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Table size="small"><TableBody>
                <TableRow><TableCell style={{ border: 'none', padding: '2px 4px', fontWeight: 700 }}>Name:</TableCell><TableCell style={{ border: 'none', padding: '2px 4px' }}>{student?.lname} {student?.fname} {student?.mname}</TableCell></TableRow>
                <TableRow><TableCell style={{ border: 'none', padding: '2px 4px', fontWeight: 700 }}>Gender:</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textTransform: 'capitalize' }}>{student?.sex}</TableCell></TableRow>
              </TableBody></Table>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <Table size="small"><TableBody>
                <TableRow><TableCell style={{ border: 'none', padding: '2px 4px', fontWeight: 700 }}>Class:</TableCell><TableCell style={{ border: 'none', padding: '2px 4px' }}>{className}</TableCell></TableRow>
                <TableRow><TableCell style={{ border: 'none', padding: '2px 4px', fontWeight: 700 }}>Population:</TableCell><TableCell style={{ border: 'none', padding: '2px 4px' }}>{report.class_population}</TableCell></TableRow>
              </TableBody></Table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Height/Weight Table ────────────────────────── */}
      <TableContainer style={{ border: '1px solid #666', marginBottom: 12 }}>
        <Table size="small"><TableBody>
          <TableRow>
            <TableCell style={innerCellBorder}>Beginning Of Term Weight:</TableCell>
            <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>32 kg</TableCell>
            <TableCell style={innerCellBorder}>End Of Term Weight:</TableCell>
            <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>34 kg</TableCell>
            <TableCell style={innerCellBorder}>Cleanliness Rating:</TableCell>
            <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Good</TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={innerCellBorder}>Beginning Of Term Height:</TableCell>
            <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>140 cm</TableCell>
            <TableCell style={innerCellBorder}>End Of Term Height:</TableCell>
            <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>142 cm</TableCell>
            <TableCell style={innerCellBorder}></TableCell>
            <TableCell style={innerCellBorder}></TableCell>
          </TableRow>
        </TableBody></Table>
      </TableContainer>

      {/* ── Main: Cognitive + Domains ──────────────────── */}
      <div className="tpl8-main">
        <div className="tpl8-left">
          {/* Cognitive Domain */}
          <SectionCard title="Cognitive Domain">
            <div className="tpl8-subject-table">
              <TableContainer style={{ border: '1px solid #999' }}>
                <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ ...innerCellBorder, width: '30%', fontWeight: 700 }}>Subject</TableCell>
                      {report.subjects[0]?.ca1 !== undefined && (
                        <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Test 1 (10%)</div></TableCell>
                      )}
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Test 2 (10%)</div></TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Average (20%)</div></TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Exam (80%)</div></TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Total(100%)</div></TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700, verticalAlign: 'bottom' }}>Grade</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700, verticalAlign: 'bottom' }}>Remark</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {report.subjects.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell style={innerCellBorder}>{s.subject_name}</TableCell>
                        {report.subjects[0]?.ca1 !== undefined && <TableCell style={innerCellBorder} align="center">{s.ca1 ?? '-'}</TableCell>}
                        <TableCell style={innerCellBorder} align="center">{s.ca2 ?? '-'}</TableCell>
                        <TableCell style={innerCellBorder} align="center">{s.total ? Math.round(s.total / 2) : '-'}</TableCell>
                        <TableCell style={innerCellBorder} align="center">{s.exam ?? '-'}</TableCell>
                        <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</TableCell>
                        <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.grade ?? '-'}</TableCell>
                        <TableCell style={innerCellBorder} align="center">{s.remark ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </SectionCard>

          {/* Comments */}
          <SectionCard title="Comment / Observation">
            <div><strong>Head of School Comment:</strong> {report.adminComment}</div>
            <div style={{ marginTop: 4 }}><strong>Class Teacher Comment:</strong> {report.teacherComment}</div>
          </SectionCard>

          {/* Cognitive Keys + Status */}
          <div className="tpl8-bottom-row">
            <SectionCard title="Cognitive Keys">
              <Table size="small">
                <TableHead><TableRow><TableCell style={{ fontWeight: 700 }}>Score Range</TableCell><TableCell style={{ fontWeight: 700 }}>Remark</TableCell></TableRow></TableHead>
                <TableBody>{gradeScale.map((g, i) => <TableRow key={i}><TableCell>{g.range}</TableCell><TableCell>{g.remark}</TableCell></TableRow>)}</TableBody>
              </Table>
            </SectionCard>
            <SectionCard title="STATUS">
              <Table size="small"><TableBody>
                <TableRow><TableCell>Promotion</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>Promoted to {className}</TableCell></TableRow>
                <TableRow><TableCell>This Term Ends</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.closing_date || '2026-07-12'}</TableCell></TableRow>
                <TableRow><TableCell>Next Term Begins</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
                <TableRow><TableCell>Boarding Resumption</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
              </TableBody></Table>
            </SectionCard>
          </div>
        </div>

        {/* ── Right: Performances ──────────────────────── */}
        <div className="tpl8-right">
          <SectionCard title="PERFORMANCES">
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <Typography variant="body2" fontWeight={600}>GENERAL PERFORMANCE</Typography>
              <StarRating value={affectiveAvg} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <Typography variant="body2" fontWeight={600}>GRADE PERFORMANCE</Typography>
              <StarRating value={Math.round(avg / 20)} />
            </div>
            <div style={{ textAlign: 'center', marginBottom: 4 }}>
              <Typography variant="body2" fontWeight={600}>SKILL PERFORMANCE</Typography>
              <StarRating value={psychomotorAvg} />
            </div>
            <div style={{ textAlign: 'center' }}>
              <Typography variant="body2" fontWeight={600}>BEHAVIOUR PERFORMANCE</Typography>
              <StarRating value={affectiveAvg} />
            </div>
          </SectionCard>

          <SectionCard title="SCORE">
            <Table size="small"><TableBody>
              <TableRow><TableCell style={{ textAlign: 'center', borderBottom: '1px solid grey' }}><strong>Total Score</strong><br />{report.total_score}/{report.subjects.length * 100}</TableCell></TableRow>
              <TableRow><TableCell style={{ textAlign: 'center' }}><strong>Percentage</strong><br />{avg}%</TableCell></TableRow>
            </TableBody></Table>
          </SectionCard>

          <div style={{ marginTop: 4 }}>
            <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={signatureImg} alt="Head of School's Signature" style={{ height: 50, objectFit: 'contain' }} />
            </div>
            <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}><strong>Head of School's Signature</strong></div>
            <div style={{ marginTop: 12, fontSize: '14px' }}>{sessionTerm?.closing_date || '2026-07-12'}</div>
            <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}><strong>Date</strong></div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TemplateEight;
