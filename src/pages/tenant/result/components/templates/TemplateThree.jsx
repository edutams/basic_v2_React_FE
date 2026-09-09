import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { IconCheck } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #000' };

const responsiveCSS = `
  .tpl3-school-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; justify-content: center; flex-wrap: wrap; text-align: center; }
  .tpl3-school-header .school-name { font-size: 22px; font-weight: 700; text-transform: underline; }
  .tpl3-info-row { display: flex; flex-wrap: wrap; gap: 0; }
  .tpl3-info-row > div { flex: 1 1 0%; min-width: 0; }
  .tpl3-affective-row { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; }
  .tpl3-affective-row > div { flex: 1 1 0%; min-width: 0; }
  .tpl3-comment-row { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 20px; }
  .tpl3-comment-row > div:first-child { flex: 2 1 0%; min-width: 0; }
  .tpl3-comment-row > div:last-child { flex: 1 1 0%; min-width: 0; }
  .tpl3-subject-table { overflow-x: auto; }
  @media (max-width: 900px) {
    .tpl3-affective-row, .tpl3-comment-row { flex-direction: column; }
    .tpl3-affective-row > div, .tpl3-comment-row > div { flex: 1 1 100%; }
  }
  @media (max-width: 600px) {
    .tpl3-school-header .school-name { font-size: 14px; }
  }
`;

const TemplateThree = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      {/* ── School Header ──────────────────────────────── */}
      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── Class / Session Title ──────────────────────── */}
      <Typography variant="h6" sx={{ textAlign: 'center', textDecoration: 'underline', mt: 2 }}>
        {className} ({sessionTerm?.label})
      </Typography>

      {/* ── Student Info Row ───────────────────────────── */}
      <div className="tpl3-info-row" style={{ mt: 16 }}>
        <div>
          <p><strong>STUDENT ID:</strong> <span style={{ fontSize: 18 }}>{student?.user_id}</span></p>
        </div>
        <div>
          <p style={{ textAlign: 'right' }}><strong>CLASS POPULATION:</strong> <span style={{ fontSize: 18 }}>{report.class_population}</span></p>
        </div>
      </div>
      <div className="tpl3-info-row">
        <div>
          <p><strong>STUDENT NAME:</strong> <span style={{ fontSize: 18 }}>{student?.lname} {student?.fname} {student?.mname}</span></p>
        </div>
        <div>
          <p style={{ textAlign: 'right' }}><strong>SEX:</strong> <span style={{ fontSize: 18, textTransform: 'capitalize' }}>{student?.sex}</span></p>
        </div>
      </div>

      {/* ── Height / Weight Table ──────────────────────── */}
      <TableContainer style={{ ...innerCellBorder, marginTop: 16, marginBottom: 10 }}>
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

      {/* ── PERFORMANCE IN SUBJECTS ────────────────────── */}
      <Typography variant="h6" sx={{ textAlign: 'center', textDecoration: 'underline', mt: 3 }}>
        PERFORMANCE IN SUBJECTS
      </Typography>

      <div className="tpl3-subject-table" style={{ marginTop: 12, marginBottom: 10 }}>
        <TableContainer style={{ border: '1px solid #000' }}>
          <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 700 }}>
            <TableHead>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}></TableCell>
                <TableCell style={{ ...innerCellBorder, fontWeight: 700, textAlign: 'center' }}>Marks Obtainable</TableCell>
                {report.subjects.map((s, i) => (
                  <TableCell key={i} style={{ ...innerCellBorder, fontWeight: 700, textAlign: 'center' }}>
                    <div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>
                      {s.subject_name}
                    </div>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Cont. Assess. Scores</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>20</TableCell>
                {report.subjects.map((s, i) => (
                  <TableCell key={i} style={innerCellBorder} align="center">{(s.ca1 ?? 0) + (s.ca2 ?? 0)}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Exam Scores</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>80</TableCell>
                {report.subjects.map((s, i) => (
                  <TableCell key={i} style={innerCellBorder} align="center">{s.exam ?? '-'}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Weighted Average</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>100</TableCell>
                {report.subjects.map((s, i) => (
                  <TableCell key={i} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.total ?? '-'}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Grade</TableCell>
                <TableCell style={innerCellBorder}></TableCell>
                {report.subjects.map((s, i) => (
                  <TableCell key={i} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>{s.grade ?? '-'}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Remark</TableCell>
                <TableCell style={innerCellBorder}></TableCell>
                {report.subjects.map((s, i) => (
                  <TableCell key={i} style={innerCellBorder} align="center">{s.remark ?? '-'}</TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* ── Comments + Promotion Status ────────────────── */}
      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ flex: '2 1 0%', minWidth: 0 }}>
            <p><strong>Class Teacher's Comment:</strong> {report.teacherComment}</p>
            <p><strong>Head of School Comment:</strong> {report.adminComment}</p>
          </div>
          <div style={{ flex: '1 1 0%', minWidth: 0 }}>
            <div>
              <u><strong>Promotion Status</strong></u>
              <p>Promoted to {className}</p>
            </div>
            <div style={{ marginTop: 8 }}>
              <p><strong>No. of times school opened:</strong> {report.attendance.opened} times</p>
              <p><strong>Total number of times present:</strong> {report.attendance.present} times</p>
              <p><strong>Total number of times absent:</strong> {report.attendance.absent} times</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Affective + Psychomotor side by side ───────── */}
      <div className="tpl3-affective-row">
        {/* Affective Domain */}
        <div>
          <Typography variant="h6" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
            SPECIAL REPORTS ON AFFECTIVE DOMAIN
          </Typography>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, width: 30, textAlign: 'center' }}></TableCell>
                    <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}></TableCell>
                    {[1, 2, 3, 4, 5].map(n => (
                      <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 30 }}>{n}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(report.affective).map(([key, val], i) => (
                    <TableRow key={key}>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>{i + 1}</TableCell>
                      <TableCell style={innerCellBorder}>{key}</TableCell>
                      {[1, 2, 3, 4, 5].map(n => (
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
        </div>

        {/* Psychomotor Domain */}
        <div>
          <Typography variant="h6" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
            REPORTS ON PSYCHOMOTOR/SKILLS
          </Typography>
          <div style={{ overflowX: 'auto', marginTop: 8 }}>
            <TableContainer style={{ border: '1px solid #000' }}>
              <Table size="small" style={{ borderCollapse: 'collapse' }}>
                <TableHead>
                  <TableRow>
                    <TableCell style={{ ...innerCellBorder, width: 30, textAlign: 'center' }}></TableCell>
                    <TableCell style={{ ...innerCellBorder, fontWeight: 700 }}>Skills</TableCell>
                    {[1, 2, 3, 4, 5].map(n => (
                      <TableCell key={n} style={{ ...innerCellBorder, textAlign: 'center', width: 30 }}>{n}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.entries(report.psychomotor).map(([key, val], i) => (
                    <TableRow key={key}>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>{i + 1}</TableCell>
                      <TableCell style={innerCellBorder}>{key}</TableCell>
                      {[1, 2, 3, 4, 5].map(n => (
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

          {/* Summary and Ratings */}
          <div style={{ marginTop: 12 }}>
            <p><strong>Summary:</strong></p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <div style={{ flex: '0 0 auto' }}>
                <p>Obtainable =</p>
                <p>Obtained =</p>
              </div>
              <div style={{ flex: '0 0 auto', textDecoration: 'underline', marginTop: 12 }}><strong>Rating</strong></div>
            </div>
            <div style={{ marginTop: 4 }}>
              {[
                ['Excellent', 5],
                ['Good', 4],
                ['Average', 3],
                ['Below Avg.', 2],
                ['Unsatisfactory', 1],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', gap: 8 }}>
                  <span style={{ width: 120 }}>{label}</span>
                  <span>=</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Physical Development & Health ──────────────── */}
      <Typography variant="h6" sx={{ textAlign: 'center', textDecoration: 'underline', mt: 3 }}>
        PHYSICAL DEVELOPMENT & HEALTH
      </Typography>
      <div style={{ overflowX: 'auto', marginTop: 8 }}>
        <TableContainer style={{ border: '1px solid #000' }}>
          <Table size="small" style={{ borderCollapse: 'collapse' }}>
            <TableHead>
              <TableRow>
                <TableCell colSpan={2} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>HEIGHT</TableCell>
                <TableCell colSpan={2} style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>WEIGHT</TableCell>
                <TableCell rowSpan={2} style={{ ...innerCellBorder, textAlign: 'center' }}>No. of Days Absent Due to illness</TableCell>
                <TableCell rowSpan={2} style={{ ...innerCellBorder, textAlign: 'center' }}>Nature of illness</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>Beginning of Term</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>End of Term</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>Beginning of Term</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>End of Term</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>m</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>m</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>Kg</TableCell>
                <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}>Kg</TableCell>
                <TableCell style={innerCellBorder}></TableCell>
                <TableCell style={innerCellBorder}></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      {/* ── Clubs, Youth Organizations ─────────────────── */}
      <Typography variant="h6" sx={{ textAlign: 'center', textDecoration: 'underline', mt: 3 }}>
        CLUBS, YOUTH ORGANIZATIONS, ETC
      </Typography>
      <TableContainer style={{ border: '1px solid #000', marginTop: 8 }}>
        <Table size="small" style={{ borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Organization</TableCell>
              <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700 }}>Office Head</TableCell>
              <TableCell style={{ ...innerCellBorder, textAlign: 'center', fontWeight: 700, padding: '12px 8px' }}>Significant Contributions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell style={innerCellBorder}></TableCell>
              <TableCell style={innerCellBorder}></TableCell>
              <TableCell style={innerCellBorder}></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Teacher / Principal / Parent Signatures ────── */}
      <div className="tpl3-comment-row" style={{ marginTop: 40 }}>
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ flex: '1 1 0%', minWidth: 0 }}>
              <p><strong>Teacher's General Comments:</strong></p>
              <p>{report.teacherComment}</p>
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <p><strong>Signature:</strong></p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
            <div style={{ flex: '1 1 0%', minWidth: 0 }}>
              <p><strong>Principal's Remarks:</strong></p>
              <p>{report.adminComment}</p>
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <p><strong>Signature/Stamp:</strong></p>
            </div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
            <div style={{ flex: '1 1 0%', minWidth: 0 }}>
              <p><strong>Parent Name:</strong></p>
            </div>
            <div style={{ flex: '0 0 120px' }}>
              <p><strong>Signature:</strong></p>
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <p><strong>( Please return this card to the school on: {sessionTerm?.closing_date || '2026-07-12'} )</strong></p>
          </div>
        </div>

        <div>
          <div style={{ height: 80, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <img src={signatureImg} alt="Head of School's Signature" style={{ height: 80, objectFit: 'contain' }} />
          </div>
          <div style={{ borderTop: '1px solid #000', paddingTop: 4 }}>
            <strong>Head of School's Signature</strong>
          </div>
          <div style={{ marginTop: 20, fontSize: '14px' }}>{sessionTerm?.closing_date || '2026-07-12'}</div>
          <div style={{ borderTop: '1px solid #000', paddingTop: 4 }}>
            <strong>Date</strong>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default TemplateThree;
