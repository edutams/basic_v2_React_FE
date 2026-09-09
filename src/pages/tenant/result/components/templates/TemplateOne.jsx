import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const cellBorder = { border: '2px solid #1a1a1a' };
const innerCellBorder = { border: '1px solid #1a1a1a' };

const responsiveCSS = `
  .tpl1-header-box { display: flex; flex-wrap: wrap; gap: 0; border: 2px solid #000; border-radius: 0; overflow: hidden; width: 100%; }
  .tpl1-header-box > div { flex: 1 1 200px; padding: 8px; min-width: 0; box-sizing: border-box; }
  .tpl1-header-box > div:not(:last-child) { border-right: 2px solid #000; }
  .tpl1-main { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 16px; }
  .tpl1-cognitive { flex: 3 1 0%; min-width: 0; overflow: hidden; }
  .tpl1-affective { flex: 1 1 0%; min-width: 0; overflow: hidden; }
  .tpl1-bottom-row { display: flex; flex-wrap: wrap; gap: 4px; }
  .tpl1-bottom-row > div { flex: 1 1 0%; min-width: 0; }
  .tpl1-hw-table { width: 100%; overflow-x: auto; }
  .tpl1-school-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; justify-content: center; flex-wrap: wrap; text-align: center; }
  .tpl1-school-header .school-name { font-size: 22px; font-weight: 700; text-transform: uppercase; }
  @media (max-width: 900px) {
    .tpl1-main { flex-direction: column; }
    .tpl1-cognitive, .tpl1-affective { flex: 1 1 100%; }
    .tpl1-bottom-row { flex-direction: column; }
    .tpl1-bottom-row > div { flex: 1 1 100%; }
    .tpl1-header-box > div { flex: 1 1 100%; border-right: none !important; border-bottom: 2px solid #000; }
    .tpl1-header-box > div:last-child { border-bottom: none; }
  }
  @media (max-width: 600px) {
    .tpl1-school-header .school-name { font-size: 14px; }
    .tpl1-hw-table table { font-size: 11px; }
    .tpl1-hw-table table td { padding: 2px 4px !important; }
  }
`;

const TemplateOne = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <Box sx={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: { xs: 0, md: 900 } }}>
      <style>{responsiveCSS}</style>

      {/* ── School Header ──────────────────────────────── */}
      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── Header Box (3 boxes) ───────────────────────── */}
      <div className="tpl1-header-box">
        <div>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: 4 }}>Name</TableCell><TableCell style={{ border: 'none', padding: 4, textAlign: 'right', fontWeight: 700 }}>{student?.lname} {student?.fname} {student?.mname}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: 4 }}>Gender</TableCell><TableCell style={{ border: 'none', padding: 4, textAlign: 'right', fontWeight: 700, textTransform: 'uppercase' }}>{student?.sex}</TableCell></TableRow>
          </TableBody></Table>
        </div>
        <div>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: 4 }}>Class</TableCell><TableCell style={{ border: 'none', padding: 4, textAlign: 'right', fontWeight: 700 }}>{className}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: 4 }}>Class Population</TableCell><TableCell style={{ border: 'none', padding: 4, textAlign: 'right', fontWeight: 700 }}>{report.class_population}</TableCell></TableRow>
          </TableBody></Table>
        </div>
        <div>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: 4 }}>Student's Avg</TableCell><TableCell style={{ border: 'none', padding: 4, textAlign: 'right', fontWeight: 700 }}>{avg}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: 4 }}>Session/Term</TableCell><TableCell style={{ border: 'none', padding: 4, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.label}</TableCell></TableRow>
          </TableBody></Table>
        </div>
      </div>

      {/* ── Height/Weight Table ────────────────────────── */}
      <div className="tpl1-hw-table" style={{ border: '2px solid #1a1a1a', marginBottom: 8 }}>
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
      </div>

      {/* ── Student ID ─────────────────────────────────── */}
      <Box style={{ marginBottom: 8 }}><strong>Student ID:</strong> ({student?.user_id})</Box>

      {/* ── Main Body: Cognitive + Affective side by side ─ */}
      <div className="tpl1-main">
        {/* ── Cognitive Domain ──────────────────────────── */}
        <div className="tpl1-cognitive">
          <Box style={{ borderRadius: '6px 6px 0 0', border: '2px solid #000', padding: 8, marginBottom: 0 }}>
            <strong>Cognitive Domain</strong>
          </Box>
          <div style={{ overflowX: 'auto' }}>
            <TableContainer style={{ border: '2px solid #000', marginBottom: 8 }}>
              <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, width: '30%', verticalAlign: 'bottom', fontWeight: 700 }}>Subject</TableCell>
                    {report.subjects[0]?.ca1 !== undefined && (
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>
                        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Test 1 (10%)</div>
                      </TableCell>
                    )}
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Test 2 (10%)</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Average (20%)</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Exam (80%)</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Total(100%)</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Highest</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Lowest</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Position</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Grade</div></TableCell>
                    <TableCell style={{ ...innerCellBorder, verticalAlign: 'bottom', textAlign: 'center', fontWeight: 700 }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.subjects.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell style={innerCellBorder}>{s.subject_name}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.ca1 ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.ca2 ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.total ? Math.round(s.total / 2) : '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.exam ?? '-'}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.highest ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.lowest ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.position ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.grade ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.remark ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* ── Comment / Observation ──────────────────── */}
          <Box style={{ borderRadius: '6px 6px 0 0', border: '2px solid #000', padding: 8, marginBottom: 0 }}>
            <strong>Comment / Observation</strong>
          </Box>
          <TableContainer style={{ border: '2px solid #000', marginBottom: 8 }}>
            <Table size="small"><TableBody>
              <TableRow>
                <TableCell style={innerCellBorder}>
                  <u><strong>Class teacher's Comment</strong></u>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{report.teacherComment}</Typography>
                  <u><strong>Head of School's Comment</strong></u>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>{report.adminComment}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={innerCellBorder}>
                  <u><strong>Promotion Status</strong></u>
                  <Typography variant="body2" sx={{ mt: 0.5 }}>Promoted to {className}</Typography>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={innerCellBorder}>
                  <strong>No. of times school opened:</strong> {report.attendance.opened} times<br />
                  <strong>Total number of times present:</strong> {report.attendance.present} times<br />
                  <strong>Total number of times absent:</strong> {report.attendance.absent} times
                </TableCell>
              </TableRow>
            </TableBody></Table>
          </TableContainer>

          {/* ── Cognitive Keys + Term Dates side by side ─ */}
          <div className="tpl1-bottom-row">
            <div>
              <Box style={{ border: '2px solid #000', borderRadius: 4, marginBottom: 8 }}>
                <Table size="small"><TableHead>
                  <TableRow>
                    <TableCell style={{ fontWeight: 700, borderBottom: '2px solid #000' }}>Score Range</TableCell>
                    <TableCell style={{ fontWeight: 700, borderBottom: '2px solid #000' }}>Remark</TableCell>
                  </TableRow>
                </TableHead><TableBody>
                  {gradeScale.map((g, i) => (
                    <TableRow key={i}>
                      <TableCell style={innerCellBorder}>{g.range}</TableCell>
                      <TableCell style={innerCellBorder}>{g.remark}</TableCell>
                    </TableRow>
                  ))}
                </TableBody></Table>
              </Box>
            </div>
            <div>
              <Box style={{ border: '2px solid #000', borderRadius: 4, marginBottom: 8 }}>
                <Table size="small"><TableBody>
                  <TableRow><TableCell style={innerCellBorder}>This Term Ends</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.closing_date || '2026-07-12'}</TableCell></TableRow>
                  <TableRow><TableCell style={innerCellBorder}>Next Term Begins</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
                  <TableRow><TableCell style={innerCellBorder}>Boarding Resumption Date</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
                </TableBody></Table>
              </Box>
            </div>
          </div>
        </div>

        {/* ── Affective + Psychomotor Domain ────────────── */}
        <div className="tpl1-affective">
          {/* Affective Domain */}
          <div style={{ border: '2px solid #000', padding: '4px 8px', borderRadius: '6px 6px 0 0', marginBottom: 0, background: '#f5f5f5' }}><strong>Affective Domain</strong></div>
          <TableContainer style={{ border: '2px solid #000', marginBottom: 8 }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}><TableHead>
              <tr style={{ border: '1px solid #000' }}>
                <td rowSpan={2} style={{ ...innerCellBorder, padding: '3px 6px', fontWeight: 700 }}>Behaviours</td>
                <td colSpan={5} style={{ ...innerCellBorder, textAlign: 'center', padding: '3px 6px' }}>Rating</td>
              </tr>
              <tr>
                {[5, 4, 3, 2, 1].map(n => (
                  <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 32, padding: '2px 4px', fontSize: 12 }}>{n}</td>
                ))}
              </tr>
            </TableHead><TableBody>
              {Object.entries(report.affective).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ ...innerCellBorder, padding: '2px 6px', fontSize: 12 }}>{key}</td>
                  {[5, 4, 3, 2, 1].map(n => (
                    <td key={n} style={{ ...innerCellBorder, textAlign: 'center', padding: '2px 4px' }}>
                      {n === val ? <IconCheck size={13} color="#000" /> : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </TableBody></Table>
          </TableContainer>

          {/* Psychomotor Domain */}
          <div style={{ border: '2px solid #000', padding: '4px 8px', borderRadius: '6px 6px 0 0', marginBottom: 0, background: '#f5f5f5' }}><strong>Psychomotor Domain</strong></div>
          <TableContainer style={{ border: '2px solid #000', marginBottom: 8 }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}><TableHead>
              <tr style={{ border: '1px solid #000' }}>
                <td rowSpan={2} style={{ ...innerCellBorder, padding: '3px 6px', fontWeight: 700 }}>Skills</td>
                <td colSpan={5} style={{ ...innerCellBorder, textAlign: 'center', padding: '3px 6px' }}>Rating</td>
              </tr>
              <tr>
                {[5, 4, 3, 2, 1].map(n => (
                  <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 32, padding: '2px 4px', fontSize: 12 }}>{n}</td>
                ))}
              </tr>
            </TableHead><TableBody>
              {Object.entries(report.psychomotor).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ ...innerCellBorder, padding: '2px 6px', fontSize: 12 }}>{key}</td>
                  {[5, 4, 3, 2, 1].map(n => (
                    <td key={n} style={{ ...innerCellBorder, textAlign: 'center', padding: '2px 4px' }}>
                      {n === val ? <IconCheck size={13} color="#000" /> : ''}
                    </td>
                  ))}
                </tr>
              ))}
            </TableBody></Table>
          </TableContainer>

          {/* ── Summary Box ─────────────────────────────── */}
          <Box style={{ border: '2px solid #000', borderRadius: 4, marginBottom: 8 }}>
            <Table size="small"><TableBody>
              <TableRow><TableCell style={{ textAlign: 'center', borderBottom: '2px solid #000' }}><strong>Total Score</strong><br />{report.total_score}/{report.subjects.length * 100}</TableCell></TableRow>
              <TableRow><TableCell style={{ textAlign: 'center', borderBottom: '2px solid #000' }}><strong>Class Position</strong><br />{report.position}</TableCell></TableRow>
              <TableRow><TableCell style={{ textAlign: 'center', borderBottom: '2px solid #000' }}><strong>Percentage</strong><br />{avg}%</TableCell></TableRow>
              <TableRow><TableCell style={{ textAlign: 'center' }}>
                <div style={{ height: 50, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <img src={signatureImg} alt="Head of School's Signature" style={{ height: 50, objectFit: 'contain' }} />
                </div>
                <div style={{ borderTop: '1px solid #000', paddingTop: 2, marginTop: 4 }}><strong>Head of School's Signature</strong></div>
                <div style={{ marginTop: 8, fontSize: '14px' }}>{sessionTerm?.closing_date || '2026-07-12'}</div>
                <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}><strong>Date</strong></div>
              </TableCell></TableRow>
            </TableBody></Table>
          </Box>
        </div>
      </div>
    </Box>
    </div>
  );
};

export default TemplateOne;
