import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #000' };

const responsiveCSS = `
  .tpl6-main { display: flex; flex-wrap: wrap; gap: 16px; }
  .tpl6-left { flex: 9 1 0%; min-width: 0; }
  .tpl6-right { flex: 3 1 0%; min-width: 0; }
  .tpl6-subject-table { overflow-x: auto; }
  .tpl6-header-row { display: grid; grid-template-columns: 1fr 3fr; gap: 0; border: 1px solid #000; margin-bottom: 8px; }
  .tpl6-header-row > div { border: 1px solid #000; padding: 4px 8px; }
  .tpl6-info-table { width: 100%; margin-bottom: 12px; }
  .tpl6-passport { display: flex; gap: 16px; align-items: flex-start; margin-bottom: 16px; }
  .tpl6-passport > div:first-child { flex: 9 1 0%; min-width: 0; overflow: auto; }
  .tpl6-passport > div:last-child { flex: 0 0 auto; }
  @media (max-width: 900px) {
    .tpl6-main { flex-direction: column; }
    .tpl6-left, .tpl6-right { flex: 1 1 100%; }
    .tpl6-passport { flex-direction: column; }
  }
`;

const TemplateSix = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── Student's Report Sheet Title ───────────────── */}
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <span style={{ background: '#f5f5f5', padding: '4px 16px', borderRadius: 20, border: '1px solid #ddd' }}>
          <strong>STUDENT'S REPORT SHEET ({sessionTerm?.label})</strong>
        </span>
      </div>

      {/* ── Student Info + Passport ────────────────────── */}
      <div className="tpl6-passport">
        <div>
          <TableContainer style={{ border: '1px solid #000' }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableBody>
                <TableRow>
                  <TableCell style={{ ...innerCellBorder, width: '30%', fontWeight: 700 }}>Student Name</TableCell>
                  <TableCell style={{ ...innerCellBorder, gridColumn: 'span 3' }}>{student?.lname} {student?.fname} {student?.mname}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Admission No: {student?.user_id}</TableCell>
                  <TableCell style={{ ...innerCellBorder }}>School</TableCell>
                  <TableCell style={{ ...innerCellBorder }}>Sports</TableCell>
                  <TableCell style={{ ...innerCellBorder }}>Other Organized Activities</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>No. of Times School Opened/Activities Held:</TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>No. of Times Present:</TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>No. of Times Punctual:</TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>No. of Times Absent:</TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                  <TableCell style={innerCellBorder}></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <div>
          <div style={{ width: 200, height: 200, border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
            <span style={{ color: '#999', fontSize: 13 }}>Student Photo</span>
          </div>
        </div>
      </div>

      {/* ── Height/Weight Table ────────────────────────── */}
      <TableContainer style={{ ...innerCellBorder, marginBottom: 16 }}>
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

      {/* ── Main: Performance + Domains ────────────────── */}
      <div className="tpl6-main">
        {/* ── Left: Performance Table ───────────────────── */}
        <div className="tpl6-left">
          <div className="tpl6-subject-table">
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>S/N</TableCell>
                    <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Subjects</TableCell>
                    {report.subjects[0]?.ca1 !== undefined && (
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Test 1</TableCell>
                    )}
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Test 2</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>CA Total</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Exam</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Total Score</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Highest</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Lowest</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Grade</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Remark</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.subjects.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell style={innerCellBorder}>{i + 1}</TableCell>
                      <TableCell style={innerCellBorder}>{s.subject_name}</TableCell>
                      {report.subjects[0]?.ca1 !== undefined && (
                        <TableCell style={innerCellBorder} align="center">{s.ca1 ?? '-'}</TableCell>
                      )}
                      <TableCell style={innerCellBorder} align="center">{s.ca2 ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{(s.ca1 ?? 0) + (s.ca2 ?? 0)}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.exam ?? '-'}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.highest ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.lowest ?? '-'}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.grade ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.remark ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Comments */}
          <div style={{ marginTop: 16 }}>
            <p><strong>Class Teacher's Comment:</strong> {report.teacherComment}</p>
            <p style={{ marginTop: 8 }}><strong>Name & Sign:</strong></p>
            <p style={{ marginTop: 8 }}><strong>Principal's Comment:</strong> {report.adminComment}</p>
            <p style={{ marginTop: 8 }}><strong>Signature/Date/School Stamp</strong></p>
          </div>
        </div>

        {/* ── Right: Domains + Rating ──────────────────── */}
        <div className="tpl6-right">
          {/* Affective Domain */}
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2} style={{ ...innerCellBorder, fontWeight: 700 }}>Affective</TableCell>
                    {[1,2,3,4,5].map(n => <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 24 }}>{n}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(report.affective).map(([key, val], i) => (
                    <TableRow key={key}>
                      <TableCell style={{ ...innerCellBorder, width: 24, textAlign: 'center', fontSize: 11 }}>{i + 1}</TableCell>
                      <TableCell style={{ ...innerCellBorder, fontSize: 11 }}>{key}</TableCell>
                      {[1,2,3,4,5].map(n => (
                        <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center' }}>
                          {n === val ? <IconCheck size={12} color="#000" /> : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Psychomotor/Skills */}
          <div style={{ overflowX: 'auto', marginBottom: 12 }}>
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2} style={{ ...innerCellBorder, fontWeight: 700 }}>Psychomotor/Skills</TableCell>
                    {[1,2,3,4,5].map(n => <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 24 }}>{n}</TableCell>)}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(report.psychomotor).map(([key, val], i) => (
                    <TableRow key={key}>
                      <TableCell style={{ ...innerCellBorder, width: 24, textAlign: 'center', fontSize: 11 }}>{i + 1}</TableCell>
                      <TableCell style={{ ...innerCellBorder, fontSize: 11 }}>{key}</TableCell>
                      {[1,2,3,4,5].map(n => (
                        <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center' }}>
                          {n === val ? <IconCheck size={12} color="#000" /> : ''}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Key to Rating */}
          <div style={{ border: '1px solid #000', marginBottom: 12 }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableBody>
                <TableRow><TableCell style={{ ...innerCellBorder, fontWeight: 700, textAlign: 'center' }}>KEY TO RATING</TableCell><TableCell style={{ ...innerCellBorder, fontWeight: 700, textAlign: 'center' }}>Code</TableCell></TableRow>
                {[['Excellent', 5], ['Maintains High Level', 4], ['Acceptance Level', 3], ['Minimal Level', 2], ['No Regard', 1]].map(([label, val]) => (
                  <TableRow key={label}>
                    <TableCell style={innerCellBorder}>{label}</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>={val}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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

export default TemplateSix;
