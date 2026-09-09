import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #000' };

const responsiveCSS = `
  .tpl10-main { display: flex; flex-wrap: wrap; gap: 16px; }
  .tpl10-left { flex: 3 1 0%; min-width: 0; }
  .tpl10-right { flex: 1 1 0%; min-width: 0; }
  .tpl10-bottom-row { display: flex; flex-wrap: wrap; gap: 4px; }
  .tpl10-bottom-row > div { flex: 1 1 0%; min-width: 0; }
  .tpl10-subject-table { overflow-x: auto; }
  @media (max-width: 900px) {
    .tpl10-main { flex-direction: column; }
    .tpl10-left, .tpl10-right { flex: 1 1 100%; }
    .tpl10-bottom-row { flex-direction: column; }
    .tpl10-bottom-row > div { flex: 1 1 100%; }
  }
`;

const TemplateTen = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;
  const obtainable = report.subjects.length * 100;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── Student Info ──────────────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, border: '1px solid #000', marginBottom: 12 }}>
        <div style={{ flex: '0 0 30%', padding: '4px 8px', borderRight: '1px solid #000', fontWeight: 700 }}>Name</div>
        <div style={{ flex: 1, padding: '4px 8px' }}>{student?.lname} {student?.fname} {student?.mname}</div>
        <div style={{ flex: '0 0 15%', padding: '4px 8px', borderLeft: '1px solid #000', borderRight: '1px solid #000', fontWeight: 700 }}>Gender</div>
        <div style={{ flex: '0 0 10%', padding: '4px 8px', textTransform: 'capitalize' }}>{student?.sex}</div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, border: '1px solid #000', marginBottom: 12 }}>
        <div style={{ flex: '0 0 30%', padding: '4px 8px', borderRight: '1px solid #000', fontWeight: 700 }}>Class</div>
        <div style={{ flex: 1, padding: '4px 8px' }}>{className}</div>
        <div style={{ flex: '0 0 15%', padding: '4px 8px', borderLeft: '1px solid #000', borderRight: '1px solid #000', fontWeight: 700 }}>Class Population</div>
        <div style={{ flex: '0 0 10%', padding: '4px 8px' }}>{report.class_population}</div>
      </div>

      {/* ── Height/Weight Table ────────────────────────── */}
      <TableContainer style={{ ...innerCellBorder, marginBottom: 12 }}>
        <Table size="small"><TableBody>
          <TableRow>
            <TableCell style={{ ...innerCellBorder, width: '15%' }}>Beginning Of Term Weight:</TableCell>
            <TableCell style={{ ...innerCellBorder, width: '10%', fontWeight: 700 }}>32 kg</TableCell>
            <TableCell style={{ ...innerCellBorder, width: '15%' }}>End Of Term Weight:</TableCell>
            <TableCell style={{ ...innerCellBorder, width: '10%', fontWeight: 700 }}>34 kg</TableCell>
            <TableCell style={{ ...innerCellBorder, width: '15%' }}>Cleanliness Rating:</TableCell>
            <TableCell style={{ ...innerCellBorder, width: '10%', fontWeight: 700 }}>Good</TableCell>
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

      {/* ── Student ID ─────────────────────────────────── */}
      <div style={{ marginBottom: 8 }}><strong>Student ID:</strong> ({student?.user_id})</div>

      {/* ── Main: Cognitive + Domains ──────────────────── */}
      <div className="tpl10-main">
        <div className="tpl10-left">
          <div style={{ border: '2px solid #000', padding: 4, borderRadius: '6px 6px 0 0' }}><strong>Cognitive Domain</strong></div>
          <div className="tpl10-subject-table">
            <TableContainer style={{ border: '2px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, width: '25%', fontWeight: 700 }}>Subject</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>CA (20)</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Exam (80)</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Total (100)</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Highest</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Lowest</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Position</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Grade</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.subjects.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell style={innerCellBorder}>{s.subject_name}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{(s.ca1 ?? 0) + (s.ca2 ?? 0)}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.exam ?? '-'}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.highest ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.lowest ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.position ?? '-'}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.grade ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.remark ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Comments - HoS first, then Teacher */}
          <div style={{ marginTop: 12 }}>
            <p><strong>Head of School's Comment:</strong> {report.adminComment}</p>
            <p style={{ marginTop: 8 }}><strong>Class teacher's Comment:</strong> {report.teacherComment}</p>
          </div>

          {/* Promotion Status */}
          <div style={{ marginTop: 8 }}>
            <u><strong>Promotion Status</strong></u>
            <p>Promoted to {className}</p>
          </div>

          {/* Attendance */}
          <div style={{ marginTop: 8 }}>
            <p><strong>No. of times school opened:</strong> {report.attendance.opened} times</p>
            <p><strong>Total number of times present:</strong> {report.attendance.present} times</p>
            <p><strong>Total number of times absent:</strong> {report.attendance.absent} times</p>
          </div>

          {/* Cognitive Keys + Term Dates */}
          <div className="tpl10-bottom-row" style={{ marginTop: 12 }}>
            <div>
              <div style={{ border: '1px solid #000', borderRadius: 4 }}>
                <Table size="small">
                  <TableHead><TableRow>
                    <TableCell style={{ fontWeight: 700, borderBottom: '1px solid #000' }}>Score Range</TableCell>
                    <TableCell style={{ fontWeight: 700, borderBottom: '1px solid #000' }}>Remark</TableCell>
                  </TableRow></TableHead>
                  <TableBody>{gradeScale.map((g, i) => <TableRow key={i}><TableCell style={innerCellBorder}>{g.range}</TableCell><TableCell style={innerCellBorder}>{g.remark}</TableCell></TableRow>)}</TableBody>
                </Table>
              </div>
            </div>
            <div>
              <div style={{ border: '1px solid #000', borderRadius: 4 }}>
                <Table size="small"><TableBody>
                  <TableRow><TableCell style={innerCellBorder}>This Term Ends</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.closing_date || '2026-07-12'}</TableCell></TableRow>
                  <TableRow><TableCell style={innerCellBorder}>Next Term Begins</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
                  <TableRow><TableCell style={innerCellBorder}>Boarding Resumption</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
                </TableBody></Table>
              </div>
            </div>
          </div>

          {/* Points Obtainable / Obtained */}
          <div style={{ marginTop: 12, padding: '8px 0' }}>
            <p><strong>Points Obtainable:</strong> {obtainable}</p>
            <p><strong>Points Obtained:</strong> {report.total_score}</p>
          </div>
        </div>

        {/* ── Right: Domains ───────────────────────────── */}
        <div className="tpl10-right">
          {/* Affective */}
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <div style={{ border: '2px solid #000', padding: 4, borderRadius: '6px 6px 0 0' }}><strong>Affective Domain</strong></div>
            <TableContainer style={{ border: '2px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2} style={{ ...innerCellBorder, fontWeight: 700 }}>Behaviours</TableCell>
                    <TableCell colSpan={5} style={{ ...innerCellBorder, textAlign: 'center' }}>Rating</TableCell>
                  </TableRow>
                  <TableRow>
                    {[5,4,3,2,1].map(n => <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 28 }}>{n}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(report.affective).map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell style={innerCellBorder}>{key}</TableCell>
                      {[5,4,3,2,1].map(n => (
                        <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center' }}>
                          {n === val ? <IconCheck size={14} color="#000" /> : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Psychomotor */}
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <div style={{ border: '2px solid #000', padding: 4, borderRadius: '6px 6px 0 0' }}><strong>Psychomotor Domain</strong></div>
            <TableContainer style={{ border: '2px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell rowSpan={2} style={{ ...innerCellBorder, fontWeight: 700 }}>Skills</TableCell>
                    <TableCell colSpan={5} style={{ ...innerCellBorder, textAlign: 'center' }}>Rating</TableCell>
                  </TableRow>
                  <TableRow>
                    {[5,4,3,2,1].map(n => <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 28 }}>{n}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(report.psychomotor).map(([key, val]) => (
                    <TableRow key={key}>
                      <TableCell style={innerCellBorder}>{key}</TableCell>
                      {[5,4,3,2,1].map(n => (
                        <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center' }}>
                          {n === val ? <IconCheck size={14} color="#000" /> : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Signature */}
          <div>
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
  );
};

export default TemplateTen;
