import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #000' };

const responsiveCSS = `
  .tpl4-main { display: flex; flex-wrap: wrap; gap: 16px; }
  .tpl4-left { flex: 7 1 0%; min-width: 0; }
  .tpl4-right { flex: 5 1 0%; min-width: 0; }
  .tpl4-right-inner { display: flex; flex-wrap: wrap; gap: 8px; }
  .tpl4-right-inner > div { flex: 1 1 0%; min-width: 0; }
  .tpl4-subject-table { overflow-x: auto; }
  .tpl4-info-row { display: flex; flex-wrap: wrap; gap: 0; margin-bottom: 8px; }
  .tpl4-info-row > div { flex: 1 1 0%; min-width: 0; }
  @media (max-width: 900px) {
    .tpl4-main { flex-direction: column; }
    .tpl4-left, .tpl4-right { flex: 1 1 100%; }
    .tpl4-right-inner { flex-direction: column; }
    .tpl4-right-inner > div { flex: 1 1 100%; }
  }
`;

const TemplateFour = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;
  const obtainable = report.subjects.length * 100;

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

      {/* ── Student Info Row ───────────────────────────── */}
      <div className="tpl4-info-row" style={{ marginBottom: 8 }}>
        <div><strong>Name:</strong> <span style={{ fontSize: 16 }}>{student?.lname} {student?.fname} {student?.mname}</span></div>
        <div><strong>Student ID:</strong> <span style={{ fontSize: 16 }}>{student?.user_id}</span></div>
        <div><strong>Class:</strong> <span style={{ fontSize: 16 }}>{className}</span></div>
      </div>
      <div className="tpl4-info-row" style={{ marginBottom: 8 }}>
        <div><strong>Marks Obtainable:</strong> <span style={{ fontSize: 16 }}>{obtainable}</span></div>
        <div><strong>Marks Obtained:</strong> <span style={{ fontSize: 16 }}>{report.total_score}</span></div>
        <div><strong>Position:</strong> <span style={{ fontSize: 16 }}>{report.position}</span></div>
      </div>
      <div className="tpl4-info-row" style={{ marginBottom: 8 }}>
        <div><strong>No. of Students in Class:</strong> <span style={{ fontSize: 16 }}>{report.class_population}</span></div>
        <div><strong>No. of Times School Opened:</strong></div>
        <div><strong>Percentage:</strong> <span style={{ fontSize: 16 }}>{avg}%</span></div>
      </div>
      <div className="tpl4-info-row" style={{ marginBottom: 16 }}>
        <div><strong>Next Term Begins:</strong> {sessionTerm?.resumption_date || '2026-09-08'}</div>
        <div><strong>No. of Times Present:</strong> {report.attendance.present}</div>
        <div></div>
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

      {/* ── Main: Performance + Domains side by side ───── */}
      <div className="tpl4-main">
        {/* ── Left: Performance in Subjects ─────────────── */}
        <div className="tpl4-left">
          <div style={{ border: '1px solid #000', padding: 4, marginBottom: 8 }}>
            <strong>PERFORMANCE IN SUBJECTS</strong>
          </div>
          <div className="tpl4-subject-table">
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, width: '35%', fontWeight: 700 }}></TableCell>
                    {report.subjects.map((s, i) => (
                      <TableCell key={i} style={{ ...innerCellBorder, textAlign: 'center' }}>
                        <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>
                          {s.subject_name}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, fontSize: 13 }}>Continous Assessment Score (20)</TableCell>
                    {report.subjects.map((s, i) => (
                      <TableCell key={i} style={innerCellBorder} align="center">{(s.ca1 ?? 0) + (s.ca2 ?? 0)}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, fontSize: 13 }}>Examination Score (80)</TableCell>
                    {report.subjects.map((s, i) => (
                      <TableCell key={i} style={innerCellBorder} align="center">{s.exam ?? '-'}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, fontSize: 13 }}>Total Score (100)</TableCell>
                    {report.subjects.map((s, i) => (
                      <TableCell key={i} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, fontSize: 13 }}>Highest Score/Term</TableCell>
                    {report.subjects.map((s, i) => (
                      <TableCell key={i} style={innerCellBorder} align="center">{s.highest ?? '-'}</TableCell>
                    ))}
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, fontSize: 13 }}>Lowest Score/Term</TableCell>
                    {report.subjects.map((s, i) => (
                      <TableCell key={i} style={innerCellBorder} align="center">{s.lowest ?? '-'}</TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Comments */}
          <div style={{ marginTop: 16 }}>
            <p><strong>Class Teacher's Comment:</strong> {report.teacherComment}</p>
            <p style={{ marginTop: 8 }}><strong>Name & Sign:</strong></p>
            <p style={{ marginTop: 8 }}><strong>Principal's Comment:</strong> {report.adminComment}</p>
          </div>

          {/* Promotion Status */}
          <div style={{ marginTop: 12 }}>
            <u><strong>Promotion Status</strong></u>
            <p>Promoted to {className}</p>
          </div>
          <div style={{ marginTop: 8 }}>
            <p><strong>No. of times school opened:</strong> {report.attendance.opened} times</p>
            <p><strong>Total number of times present:</strong> {report.attendance.present} times</p>
            <p><strong>Total number of times absent:</strong> {report.attendance.absent} times</p>
          </div>
          <p style={{ marginTop: 12 }}><strong>Signature/Date/School Stamp</strong></p>
        </div>

        {/* ── Right: Domains ───────────────────────────── */}
        <div className="tpl4-right">
          {/* Affective Domain */}
          <div style={{ marginBottom: 12 }}>
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <tr style={{ border: '1px solid #000' }}>
                    <td colSpan={2} style={{ ...innerCellBorder, fontWeight: 700, padding: '3px 6px' }}>AFFECTIVE DOMAIN RATING</td>
                    {[1,2,3,4,5].map(n => <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 32, padding: '2px 4px', fontSize: 12 }}>{n}</td>)}
                  </tr>
                </TableHead>
                <TableBody>
                  {Object.entries(report.affective).map(([key, val], i) => (
                    <tr key={key}>
                      <td style={{ ...innerCellBorder, width: 28, textAlign: 'center', padding: '2px 4px' }}>{i + 1}</td>
                      <td style={{ ...innerCellBorder, padding: '2px 6px', fontSize: 12 }}>{key}</td>
                      {[1,2,3,4,5].map(n => (
                        <td key={n} style={{ ...innerCellBorder, textAlign: 'center', padding: '2px 4px' }}>
                          {n === val ? <IconCheck size={13} color="#000" /> : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Psychomotor/Skills */}
          <div style={{ marginBottom: 12 }}>
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <tr style={{ border: '1px solid #000' }}>
                    <td colSpan={2} style={{ ...innerCellBorder, fontWeight: 700, padding: '3px 6px' }}>PSYCHOMOTOR/SKILLS</td>
                    {[1,2,3,4,5].map(n => <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 32, padding: '2px 4px', fontSize: 12 }}>{n}</td>)}
                  </tr>
                </TableHead>
                <TableBody>
                  {Object.entries(report.psychomotor).map(([key, val], i) => (
                    <tr key={key}>
                      <td style={{ ...innerCellBorder, width: 28, textAlign: 'center', padding: '2px 4px' }}>{i + 1}</td>
                      <td style={{ ...innerCellBorder, padding: '2px 6px', fontSize: 12 }}>{key}</td>
                      {[1,2,3,4,5].map(n => (
                        <td key={n} style={{ ...innerCellBorder, textAlign: 'center', padding: '2px 4px' }}>
                          {n === val ? <IconCheck size={13} color="#000" /> : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Signature */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <img src={signatureImg} alt="Head of School's Signature" style={{ height: 80, objectFit: 'contain' }} />
            </div>
            <div style={{ borderTop: '1px solid #000', paddingTop: 4 }}><strong>Head of School's Signature</strong></div>
            <div style={{ marginTop: 16, fontSize: '14px' }}>{sessionTerm?.closing_date || '2026-07-12'}</div>
            <div style={{ borderTop: '1px solid #000', paddingTop: 4 }}><strong>Date</strong></div>
          </div>

          {/* Key to Rating */}
          <div style={{ border: '1px solid #000', marginBottom: 16 }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <TableRow>
                  <TableCell style={{ ...innerCellBorder, fontWeight: 700, textAlign: 'center' }}>KEY TO RATING</TableCell>
                  <TableCell style={{ ...innerCellBorder, fontWeight: 700, textAlign: 'center' }}>Code</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[['Excellent', 5], ['Maintains High Level', 4], ['Acceptance Level', 3], ['Minimal Level', 2], ['No Regard', 1]].map(([label, val]) => (
                  <TableRow key={label}>
                    <TableCell style={innerCellBorder}>{label}</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>={val}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Clubs/Organizations */}
          <div style={{ border: '1px solid #000', marginBottom: 16 }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableBody>
                <TableRow><TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700, height: 40 }}>CLUB, YOUTH ORGANIZATION ETC.</TableCell></TableRow>
                <TableRow><TableCell style={{ ...innerCellBorder, textAlign: 'center', height: 40 }}>Organization</TableCell></TableRow>
                <TableRow><TableCell style={{ ...innerCellBorder, height: 20 }}></TableCell></TableRow>
                <TableRow><TableCell style={{ ...innerCellBorder, textAlign: 'center', height: 40 }}>Office Held</TableCell></TableRow>
                <TableRow><TableCell style={{ ...innerCellBorder, height: 20 }}></TableCell></TableRow>
                <TableRow><TableCell style={{ ...innerCellBorder, textAlign: 'center', height: 40 }}>Significant Contributions</TableCell></TableRow>
                <TableRow><TableCell style={{ ...innerCellBorder, height: 20 }}></TableCell></TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Physical Development & Health */}
          <div>
            <strong>PHYSICAL DEVELOPMENT & HEALTH</strong>
            <TableContainer style={{ border: '1px solid #000', marginTop: 4 }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell colSpan={2} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>HEIGHT</TableCell>
                    <TableCell colSpan={2} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>WEIGHT</TableCell>
                    <TableCell colSpan={2} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>STUDENT'S HOUSE</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>Beginning of Term</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>End of Term</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>Beginning of Term</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>End of Term</TableCell>
                    <TableCell style={{ ...innerCellBorder }}></TableCell>
                    <TableCell style={{ ...innerCellBorder }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>M</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>M</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>Kg</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontSize: 13 }}>Kg</TableCell>
                    <TableCell style={innerCellBorder}></TableCell>
                    <TableCell style={innerCellBorder}></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TemplateFour;
