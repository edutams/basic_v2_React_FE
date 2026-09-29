import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #000' };

const responsiveCSS = `
  .tpl11-main { display: flex; flex-wrap: wrap; gap: 16px; }
  .tpl11-left { flex: 2 1 0%; min-width: 0; }
  .tpl11-right { flex: 1 1 0%; min-width: 0; }
  .tpl11-subject-table { overflow-x: auto; }
  @media (max-width: 900px) {
    .tpl11-main { flex-direction: column; }
    .tpl11-left, .tpl11-right { flex: 1 1 100%; }
  }
`;

const TemplateEleven = ({ student, report, sessionTerm, className, gradeScale }) => {
  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── END OF TERM REPORT ─────────────────────────── */}
      <div style={{ textAlign: 'center', margin: '16px 0 8px', fontWeight: 700, fontSize: 16, textDecoration: 'underline' }}>
        END OF TERM REPORT
      </div>

      {/* ── Learner Info (3 boxes) ─────────────────────── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 0, border: '2px solid #000', borderRadius: 4, marginBottom: 10 }}>
        <div style={{ flex: '1 1 200px', padding: '2px 4px', borderRight: '2px solid #000' }}>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Name</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{student?.lname} {student?.fname} {student?.mname}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Gender</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700, textTransform: 'uppercase' }}>{student?.sex}</TableCell></TableRow>
          </TableBody></Table>
        </div>
        <div style={{ flex: '1 1 200px', padding: '2px 4px', borderRight: '2px solid #000' }}>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Class</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{className}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Class Population</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{report.class_population}</TableCell></TableRow>
          </TableBody></Table>
        </div>
        <div style={{ flex: '1 1 200px', padding: '2px 4px' }}>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Student's Avg</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{avg}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Session/Term</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.label}</TableCell></TableRow>
          </TableBody></Table>
        </div>
      </div>

      {/* ── Student ID ─────────────────────────────────── */}
      <div style={{ marginBottom: 8 }}><strong>Student ID:</strong> ({student?.user_id})</div>

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

      {/* ── CLASS TEACHER label ────────────────────────── */}
      <div style={{ textAlign: 'center', fontWeight: 700, marginBottom: 12, fontSize: 16 }}>CLASS TEACHER:</div>

      {/* ── Main: Subjects + Domains ───────────────────── */}
      <div className="tpl11-main">
        {/* ── Left: Subject Remarks ────────────────────── */}
        <div className="tpl11-left">
          <div className="tpl11-subject-table">
            <TableContainer style={{ border: '2px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, width: '30%', fontWeight: 700 }}>SUBJECTS</TableCell>
                    <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>TEACHER'S REMARKS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.subjects.map((s, i) => (
                    <TableRow key={i}>
                      <TableCell style={innerCellBorder}>{s.subject_name}</TableCell>
                      <TableCell style={innerCellBorder}>{s.remark ?? '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          {/* Comments */}
          <div style={{ border: '2px solid #000', padding: 8, marginTop: 12 }}>
            <p><strong>Class Teacher's Comment:</strong> {report.teacherComment}</p>
            <p style={{ marginTop: 8 }}><strong>Head of School's Comment:</strong> {report.adminComment}</p>
          </div>

          {/* Term Dates */}
          <div style={{ border: '1px solid #000', borderRadius: 4, marginTop: 12 }}>
            <Table size="small"><TableBody>
              <TableRow><TableCell style={innerCellBorder}>This Term Ends</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.closing_date || '2026-07-12'}</TableCell></TableRow>
              <TableRow><TableCell style={innerCellBorder}>Next Term Begins</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
              <TableRow><TableCell style={innerCellBorder}>Boarding Resumption Date</TableCell><TableCell style={{ ...innerCellBorder, textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
            </TableBody></Table>
          </div>
        </div>

        {/* ── Right: Domains + Signature ───────────────── */}
        <div className="tpl11-right">
          {/* Affective Domain */}
          <div style={{ border: '2px solid #000', padding: '4px 8px', borderRadius: '6px 6px 0 0', marginBottom: 0, background: '#f5f5f5' }}><strong>Affective Domain</strong></div>
          <TableContainer style={{ border: '2px solid #000', marginBottom: 12 }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <tr style={{ border: '1px solid #000' }}>
                  <td rowSpan={2} style={{ ...innerCellBorder, fontWeight: 700, padding: '3px 6px' }}>Behaviours</td>
                  <td colSpan={5} style={{ ...innerCellBorder, textAlign: 'center', padding: '3px 6px' }}>Rating</td>
                </tr>
                <tr>
                  {[5,4,3,2,1].map(n => <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 32, padding: '2px 4px', fontSize: 12 }}>{n}</td>)}
                </tr>
              </TableHead>
              <TableBody>
                {Object.entries(report.affective).map(([key, val]) => (
                  <tr key={key}>
                    <td style={{ ...innerCellBorder, padding: '2px 6px', fontSize: 12 }}>{key}</td>
                    {[5,4,3,2,1].map(n => (
                      <td key={n} style={{ ...innerCellBorder, textAlign: 'center', padding: '2px 4px' }}>
                        {n === val ? <IconCheck size={13} color="#000" /> : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Psychomotor Domain */}
          <div style={{ border: '2px solid #000', padding: '4px 8px', borderRadius: '6px 6px 0 0', marginBottom: 0, background: '#f5f5f5' }}><strong>Psychomotor Domain</strong></div>
          <TableContainer style={{ border: '2px solid #000', marginBottom: 12 }}>
            <Table size="small" style={{ borderCollapse: 'collapse' }}>
              <TableHead>
                <tr style={{ border: '1px solid #000' }}>
                  <td rowSpan={2} style={{ ...innerCellBorder, fontWeight: 700, padding: '3px 6px' }}>Skills</td>
                  <td colSpan={5} style={{ ...innerCellBorder, textAlign: 'center', padding: '3px 6px' }}>Rating</td>
                </tr>
                <tr>
                  {[5,4,3,2,1].map(n => <td key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 32, padding: '2px 4px', fontSize: 12 }}>{n}</td>)}
                </tr>
              </TableHead>
              <TableBody>
                {Object.entries(report.psychomotor).map(([key, val]) => (
                  <tr key={key}>
                    <td style={{ ...innerCellBorder, padding: '2px 6px', fontSize: 12 }}>{key}</td>
                    {[5,4,3,2,1].map(n => (
                      <td key={n} style={{ ...innerCellBorder, textAlign: 'center', padding: '2px 4px' }}>
                        {n === val ? <IconCheck size={13} color="#000" /> : ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

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

export default TemplateEleven;
