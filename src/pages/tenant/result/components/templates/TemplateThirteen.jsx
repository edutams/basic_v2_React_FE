import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #000' };

const responsiveCSS = `
  .tpl13-divBody { display: flex; gap: 6px; }
  .tpl13-cog-domain { flex: 3; }
  .tpl13-cog-domain > p { border-radius: 6px 6px 0 0; border: 2px solid #000; padding: 6px 10px; margin: 0; font-weight: 700; }
  .tpl13-affect-domain { flex: 1; }
  .tpl13-affect-domain > p { border-radius: 6px 6px 0 0; border: 2px solid #000; padding: 6px 10px; margin: 0; font-weight: 700; }
  .tpl13-keys-promotion { display: flex; gap: 6px; margin-top: 6px; }
  .tpl13-keys-promotion > div { flex: 1; }
  .tpl13-subject-table { overflow-x: auto; }
  .tpl13-rotate { writing-mode: vertical-rl; transform: rotateZ(180deg); white-space: nowrap; text-align: center; }
  .tpl13-inner td { border: 1px solid #000; }
  @media (max-width: 900px) {
    .tpl13-divBody { flex-direction: column; }
    .tpl13-cog-domain, .tpl13-affect-domain { flex: 1 1 100%; }
    .tpl13-keys-promotion { flex-direction: column; }
    .tpl13-keys-promotion > div { flex: 1 1 100%; }
  }
`;

const TemplateThirteen = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      {/* ── Header: Photo + School Header ──────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <div style={{ flex: '0 0 auto' }}>
          <img src={student?.image || signatureImg} alt="Student" style={{ width: 80, height: 80, objectFit: 'cover', border: '1px solid #ccc' }} />
        </div>
        <div style={{ flex: 1 }}>
          <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />
        </div>
      </div>

      {/* ── Height/Weight Table ────────────────────────── */}
      <TableContainer style={{ ...innerCellBorder, marginBottom: 10 }}>
        <Table size="small"><TableBody>
          <tr>
            <td style={{ ...innerCellBorder, width: '15%' }}>Beginning Of Term Weight:</td>
            <td style={{ ...innerCellBorder, width: '10%', fontWeight: 700 }}>32 kg</td>
            <td style={{ ...innerCellBorder, width: '15%' }}>End Of Term Weight:</td>
            <td style={{ ...innerCellBorder, width: '10%', fontWeight: 700 }}>34 kg</td>
            <td style={{ ...innerCellBorder, width: '15%' }}>Cleanliness Rating:</td>
            <td style={{ ...innerCellBorder, width: '10%', fontWeight: 700 }}>Good</td>
          </tr>
          <tr>
            <td style={innerCellBorder}>Beginning Of Term Height:</td>
            <td style={{ ...innerCellBorder, fontWeight: 700 }}>140 cm</td>
            <td style={innerCellBorder}>End Of Term Height:</td>
            <td style={{ ...innerCellBorder, fontWeight: 700 }}>142 cm</td>
            <td style={innerCellBorder}></td>
            <td style={innerCellBorder}></td>
          </tr>
        </TableBody></Table>
      </TableContainer>

      {/* ── Student ID ─────────────────────────────────── */}
      <div style={{ marginBottom: 8 }}><strong>Student ID:</strong> ({student?.user_id})</div>

      {/* ── Main Body: Cognitive + Affective/Psychomotor ── */}
      <div className="tpl13-divBody">
        {/* ── Left: Cognitive Domain ───────────────────── */}
        <div className="tpl13-cog-domain">
          <p>Cognitive Domain</p>
          <div className="tpl13-subject-table">
            <TableContainer style={{ border: '2px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
                <TableHead>
                  <tr className="tpl13-inner">
                    <td style={{ ...innerCellBorder, width: '30%', verticalAlign: 'bottom', fontWeight: 700 }}>Subject</td>
                    <td style={{ ...innerCellBorder, textAlign: 'center' }}><div className="tpl13-rotate" style={{ fontWeight: 700 }}>Test 1 (10%)</div></td>
                    <td style={{ ...innerCellBorder, textAlign: 'center' }}><div className="tpl13-rotate" style={{ fontWeight: 700 }}>Test 2 (10%)</div></td>
                    <td style={{ ...innerCellBorder, textAlign: 'center' }}><div className="tpl13-rotate" style={{ fontWeight: 700 }}>Average (20%)</div></td>
                    <td style={{ ...innerCellBorder, textAlign: 'center' }}><div className="tpl13-rotate" style={{ fontWeight: 700 }}>Exam (80%)</div></td>
                    <td style={{ ...innerCellBorder, textAlign: 'center' }}><div className="tpl13-rotate" style={{ fontWeight: 700 }}>Total(100%)</div></td>
                    <td style={{ ...innerCellBorder, textAlign: 'center', verticalAlign: 'bottom', fontWeight: 700 }}>Grade</td>
                    <td style={{ ...innerCellBorder, textAlign: 'center', verticalAlign: 'bottom', fontWeight: 700 }}>Grade Remark</td>
                  </tr>
                </TableHead>
                <TableBody>
                  {report.subjects.map((s, i) => (
                    <tr key={i} className="tpl13-inner">
                      <td style={{ ...innerCellBorder, textTransform: 'uppercase' }}>{s.subject_name}</td>
                      <td style={{ ...innerCellBorder, textAlign: 'center' }}>{s.ca1 ?? '-'}</td>
                      <td style={{ ...innerCellBorder, textAlign: 'center' }}>{s.ca2 ?? '-'}</td>
                      <td style={{ ...innerCellBorder, textAlign: 'center' }}>{s.ca_total ?? '-'}</td>
                      <td style={{ ...innerCellBorder, textAlign: 'center' }}>{s.exam ?? '-'}</td>
                      <td style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</td>
                      <td style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.grade ?? '-'}</td>
                      <td style={{ ...innerCellBorder, textAlign: 'center' }}>{s.remark ?? '-'}</td>
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* ── Comment / Observation ───────────────────── */}
          <p style={{ marginTop: 10, marginBottom: 4 }}>Comment / Observation</p>
          <TableContainer style={{ border: '2px solid #000', marginBottom: 10 }}>
            <Table size="small"><TableBody>
              <tr>
                <td style={{ padding: '4px 8px' }}>
                  <h6 style={{ margin: '4px 0', textDecoration: 'underline' }}><strong>Head of School Comment</strong></h6>
                  <p style={{ margin: '4px 0' }}>{report.adminComment}</p>
                  <h6 style={{ margin: '4px 0', textDecoration: 'underline' }}><strong>Class Teacher Comment</strong></h6>
                  <p style={{ margin: '4px 0' }}>{report.teacherComment}</p>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px' }}>
                  <h6 style={{ margin: '4px 0', textDecoration: 'underline' }}><strong>Promotion Status</strong></h6>
                  <p style={{ margin: '4px 0' }}>Promoted to {className}</p>
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px' }}>
                  <p style={{ margin: '4px 0', fontWeight: 700 }}>No. of times school opened: {report.attendance?.opened} times</p>
                  <p style={{ margin: '4px 0', fontWeight: 700 }}>Total number of times present: {report.attendance?.present} times</p>
                  <p style={{ margin: '4px 0', fontWeight: 700 }}>Total number of times absent: {report.attendance?.absent} times</p>
                </td>
              </tr>
            </TableBody></Table>
          </TableContainer>

          {/* ── Keys + Term Dates ───────────────────────── */}
          <div className="tpl13-keys-promotion">
            <div>
              <p style={{ border: '2px solid #000', borderRadius: '6px 6px 0 0', padding: '6px 10px', margin: 0, fontWeight: 700 }}>Cognitive Keys</p>
              <TableContainer style={{ border: '2px solid #000' }}>
                <Table size="small">
                  <TableHead>
                    <tr className="tpl13-inner">
                      <th style={{ ...innerCellBorder, fontWeight: 700 }}>Score Range</th>
                      <th style={{ ...innerCellBorder, fontWeight: 700 }}>Remark</th>
                    </tr>
                  </TableHead>
                  <TableBody>
                    {gradeScale.map((g, i) => (
                      <tr key={i} className="tpl13-inner">
                        <td style={innerCellBorder}>{g.range}</td>
                        <td style={innerCellBorder}>{g.remark}</td>
                      </tr>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div>
              <p style={{ border: '2px solid #000', borderRadius: '6px 6px 0 0', padding: '6px 10px', margin: 0, fontWeight: 700 }}>Term Dates</p>
              <TableContainer style={{ border: '2px solid #000' }}>
                <Table size="small"><TableBody>
                  <tr className="tpl13-inner">
                    <td style={{ ...innerCellBorder, padding: '4px 8px' }}>This Term Ends</td>
                    <td style={{ ...innerCellBorder, padding: '4px 8px', textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.closing_date || '2026-07-12'}</td>
                  </tr>
                  <tr className="tpl13-inner">
                    <td style={{ ...innerCellBorder, padding: '4px 8px' }}>Next Term Begins</td>
                    <td style={{ ...innerCellBorder, padding: '4px 8px', textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</td>
                  </tr>
                  <tr className="tpl13-inner">
                    <td style={{ ...innerCellBorder, padding: '4px 8px' }}>Boarding Resumption Date</td>
                    <td style={{ ...innerCellBorder, padding: '4px 8px', textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</td>
                  </tr>
                </TableBody></Table>
              </TableContainer>
            </div>
          </div>
        </div>

        {/* ── Right: Affective + Psychomotor ───────────── */}
        <div className="tpl13-affect-domain">
          <p>Affective Domain</p>
          <TableContainer style={{ border: '2px solid #000' }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <tr className="tpl13-inner">
                  <td rowSpan={2} style={{ ...innerCellBorder, fontWeight: 700 }}>Behaviours</td>
                  <td colSpan={5} style={{ ...innerCellBorder, textAlign: 'center' }}>Rating</td>
                </tr>
                <tr className="tpl13-inner">
                  {[5,4,3,2,1].map(n => <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 28 }}>{n}</td>)}
                </tr>
              </TableHead>
              <TableBody>
                {Object.entries(report.affective).map(([key, val]) => (
                  <tr key={key} className="tpl13-inner">
                    <td style={innerCellBorder}>{key}</td>
                    {[5,4,3,2,1].map(n => (
                      <td key={n} style={{ ...innerCellBorder, textAlign: 'center' }}>
                        {n === val ? <IconCheck size={14} color="#000" /> : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <p style={{ marginTop: 10 }}>Psychomotor Domain</p>
          <TableContainer style={{ border: '2px solid #000' }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <tr className="tpl13-inner">
                  <td rowSpan={2} style={{ ...innerCellBorder, fontWeight: 700 }}>Skills</td>
                  <td colSpan={5} style={{ ...innerCellBorder, textAlign: 'center' }}>Rating</td>
                </tr>
                <tr className="tpl13-inner">
                  {[5,4,3,2,1].map(n => <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 28 }}>{n}</td>)}
                </tr>
              </TableHead>
              <TableBody>
                {Object.entries(report.psychomotor).map(([key, val]) => (
                  <tr key={key} className="tpl13-inner">
                    <td style={innerCellBorder}>{key}</td>
                    {[5,4,3,2,1].map(n => (
                      <td key={n} style={{ ...innerCellBorder, textAlign: 'center' }}>
                        {n === val ? <IconCheck size={14} color="#000" /> : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* ── Total Score + Signature ─────────────────── */}
          <div style={{ border: '2px solid #000', borderRadius: 8, marginTop: 10 }}>
            <Table size="small"><TableBody>
              <tr>
                <td style={{ textAlign: 'center', borderBottom: '2px solid #000', padding: '4px 8px' }}><strong>Total Score</strong><br />{report.total_score}/{report.subjects.length * 100}</td>
              </tr>
              <tr>
                <td style={{ textAlign: 'center', padding: '4px 8px' }}><strong>Percentage</strong><br />{avg}%</td>
              </tr>
            </TableBody></Table>
            <div style={{ padding: '4px 8px' }}>
              <div style={{ height: 60, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img src={signatureImg} alt="Head of School's Signature" style={{ height: 60, objectFit: 'contain' }} />
              </div>
              <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}><strong>Head of School's Signature</strong></div>
              <div style={{ marginTop: 12, fontSize: '14px' }}>{sessionTerm?.closing_date || '2026-07-12'}</div>
              <div style={{ borderTop: '1px solid #000', paddingTop: 2 }}><strong>Date</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TemplateThirteen;
