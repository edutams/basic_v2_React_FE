import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #000' };

const responsiveCSS = `
  .tpl5-main { display: flex; flex-wrap: wrap; gap: 16px; }
  .tpl5-left { flex: 9 1 0%; min-width: 0; }
  .tpl5-right { flex: 3 1 0%; min-width: 0; }
  .tpl5-subject-table { overflow-x: auto; }
  .tpl5-info-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 0; border: 1px solid #000; margin-bottom: 12px; }
  .tpl5-info-grid > div { border: 1px solid #000; padding: 4px 8px; font-size: 13px; }
  .tpl5-info-grid > div:nth-child(odd) { font-weight: 700; background: #f9f9f9; }
  @media (max-width: 900px) {
    .tpl5-main { flex-direction: column; }
    .tpl5-left, .tpl5-right { flex: 1 1 100%; }
    .tpl5-info-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

const TemplateFive = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── Student's Report Sheet Title ───────────────── */}
      <div style={{ textAlign: 'center', margin: '16px 0' }}>
        <span style={{ background: '#f5f5f5', padding: '4px 16px', borderRadius: 20, border: '1px solid #ddd' }}>
          <strong>STUDENT'S REPORT SHEET</strong>
        </span>
      </div>

      {/* ── Student Info Grid ──────────────────────────── */}
      <div className="tpl5-info-grid">
        <div>STUDENT NAME</div>
        <div style={{ gridColumn: 'span 3' }}>{student?.lname} {student?.fname} {student?.mname}</div>
        <div>STUDENT ID</div>
        <div>{student?.user_id}</div>
      </div>
      <div className="tpl5-info-grid">
        <div>Session/Term</div>
        <div>{sessionTerm?.label}</div>
        <div>Class</div>
        <div>{className}</div>
        <div>No. of Subjects</div>
        <div>{report.subjects.length}</div>
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

      {/* ── COGNITIVE DOMAIN ───────────────────────────── */}
      <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 8 }}>
        <strong>COGNITIVE DOMAIN</strong>
      </div>
      <div className="tpl5-main">
        {/* ── Left: Subject Table ───────────────────────── */}
        <div className="tpl5-left">
          <div className="tpl5-subject-table">
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>S/N</TableCell>
                    <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Subjects {'{WGT}'}</TableCell>
                    {report.subjects[0]?.ca1 !== undefined && (
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Test 1</TableCell>
                    )}
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Test 2</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>CA Total</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Exam</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Total Score</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Grade</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={innerCellBorder}></TableCell>
                    <TableCell style={innerCellBorder}></TableCell>
                    {report.subjects[0]?.ca1 !== undefined && (
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>10</TableCell>
                    )}
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>10</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>20</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>80</TableCell>
                    <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>100</TableCell>
                    <TableCell style={innerCellBorder}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.subjects.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell style={innerCellBorder}>{i + 1}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textTransform: 'uppercase' }}>{s.subject_name}</TableCell>
                      {report.subjects[0]?.ca1 !== undefined && (
                        <TableCell style={innerCellBorder} align="center">{s.ca1 ?? '-'}</TableCell>
                      )}
                      <TableCell style={innerCellBorder} align="center">{s.ca2 ?? '-'}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{(s.ca1 ?? 0) + (s.ca2 ?? 0)}</TableCell>
                      <TableCell style={innerCellBorder} align="center">{s.exam ?? '-'}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.grade ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Class Teacher's Comment */}
          <div style={{ marginTop: 16 }}>
            <p><strong>Class Teacher's Comment:</strong> {report.teacherComment}</p>
            <p style={{ marginTop: 8 }}><strong>Name & Sign:</strong></p>
            <p style={{ marginTop: 8 }}><strong>Principal's Comment:</strong> {report.adminComment}</p>
            <p style={{ marginTop: 8 }}><strong>Signature/Date/School Stamp</strong></p>
          </div>
        </div>

        {/* ── Right: Domains ───────────────────────────── */}
        <div className="tpl5-right">
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

export default TemplateFive;
