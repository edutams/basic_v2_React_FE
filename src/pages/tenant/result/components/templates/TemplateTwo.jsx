import { Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Avatar } from '@mui/material';
import { IconStar, IconStarFilled } from '@tabler/icons-react';
import signatureImg from '@/assets/images/signature_img.jpeg';
import SchoolHeader from './SchoolHeader';

const innerCellBorder = { border: '1px solid #999' };

const responsiveCSS = `
  .tpl2-header-box { display: flex; flex-wrap: wrap; gap: 0; margin-bottom: 8px; width: 100%; }
  .tpl2-header-box > div { flex: 1 1 200px; padding: 4px; min-width: 0; box-sizing: border-box; }
  .tpl2-header-box > div:first-child { border: 2px solid #000; border-radius: 4px 0 0 4px; }
  .tpl2-header-box > div:nth-child(2) { border: 2px solid #000; border-left: none; border-right: none; }
  .tpl2-header-box > div:last-child { border: 2px solid #000; border-radius: 0 4px 4px 0; }
  .tpl2-main { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
  .tpl2-cognitive { flex: 3 1 0%; min-width: 0; overflow: hidden; }
  .tpl2-right { flex: 1 1 0%; min-width: 0; overflow: hidden; }
  .tpl2-keys-row { display: flex; flex-wrap: wrap; gap: 4px; }
  .tpl2-keys-row > div { flex: 1 1 0%; min-width: 0; }
  .tpl2-school-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; justify-content: center; flex-wrap: wrap; text-align: center; }
  .tpl2-school-header .school-name { font-size: 22px; font-weight: 700; text-transform: uppercase; }
  @media (max-width: 900px) {
    .tpl2-main { flex-direction: column; }
    .tpl2-cognitive, .tpl2-right { flex: 1 1 100%; }
    .tpl2-keys-row { flex-direction: column; }
    .tpl2-keys-row > div { flex: 1 1 100%; }
    .tpl2-header-box > div { flex: 1 1 100%; border-radius: 0 !important; border-left: 2px solid #000 !important; border-right: 2px solid #000 !important; }
    .tpl2-header-box > div:first-child { border-radius: 4px 4px 0 0 !important; border-bottom: none !important; }
    .tpl2-header-box > div:last-child { border-radius: 0 0 4px 4px !important; border-top: none !important; }
    .tpl2-header-box > div:nth-child(2) { border-top: none !important; border-bottom: none !important; }
  }
  @media (max-width: 600px) {
    .tpl2-school-header .school-name { font-size: 14px; }
  }
`;

const StarRating = ({ value, max = 5 }) => (
  <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
    {Array.from({ length: max }, (_, i) => (
      i < value
        ? <span key={i} style={{ color: '#d4a017' }}><IconStarFilled size={16} /></span>
        : <span key={i} style={{ color: '#ccc' }}><IconStar size={16} /></span>
    ))}
  </div>
);

const AccordionSection = ({ title, children }) => (
  <div style={{ marginBottom: 4 }}>
    <div style={{ padding: '3px 6px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: '4px 4px 0 0' }}>
      <Typography variant="body2" fontWeight={600}>{title}</Typography>
    </div>
    <div style={{ border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 4px 4px', padding: '2px 6px' }}>
      {children}
    </div>
  </div>
);

const TemplateTwo = ({ student, report, sessionTerm, className, gradeScale }) => {
  const avg = report.subjects.length ? +(Math.round((report.total_score / report.subjects.length) * 100) / 100) : 0;
  const affectiveAvg = Object.values(report.affective).length
    ? Math.round(Object.values(report.affective).reduce((a, b) => a + b, 0) / Object.values(report.affective).length)
    : 0;
  const psychomotorAvg = Object.values(report.psychomotor).length
    ? Math.round(Object.values(report.psychomotor).reduce((a, b) => a + b, 0) / Object.values(report.psychomotor).length)
    : 0;

  return (
    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto' }}>
    <div style={{ fontFamily: 'Times New Roman, serif', color: '#000', fontSize: '14px', minWidth: 900 }}>
      <style>{responsiveCSS}</style>

      {/* ── School Header ──────────────────────────────── */}
      <SchoolHeader qrValue={`https://school.edu/verify/${student?.user_id}`} />

      {/* ── Header Box (3 boxes) ───────────────────────── */}
      <div className="tpl2-header-box">
        <div>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Name</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{student?.lname} {student?.fname} {student?.mname}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Gender</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700, textTransform: 'uppercase' }}>{student?.sex}</TableCell></TableRow>
          </TableBody></Table>
        </div>
        <div>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Class</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{className}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Class Population</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{report.class_population}</TableCell></TableRow>
          </TableBody></Table>
        </div>
        <div>
          <Table size="small"><TableBody>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Student's Avg</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{avg}</TableCell></TableRow>
            <TableRow><TableCell style={{ border: 'none', padding: '2px 4px' }}>Session/Term</TableCell><TableCell style={{ border: 'none', padding: '2px 4px', textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.label}</TableCell></TableRow>
          </TableBody></Table>
        </div>
      </div>

      {/* ── Height/Weight Table ────────────────────────── */}
      <div style={{ overflowX: 'auto' }}>
        <TableContainer style={{ border: '1px solid #666', marginBottom: 8 }}>
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
      </div>

      {/* ── Main Body ──────────────────────────────────── */}
      <div className="tpl2-main">
        {/* ── Cognitive Domain ──────────────────────────── */}
        <div className="tpl2-cognitive">
          <AccordionSection title="Cognitive Domain">
            <div style={{ overflowX: 'auto' }}>
              <TableContainer style={{ border: '1px solid #999', marginBottom: 4 }}>
                <Table size="small" style={{ borderCollapse: 'collapse', minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell style={{ ...innerCellBorder, width: '30%', verticalAlign: 'bottom', fontWeight: 700 }}>Subject</TableCell>
                      <TableCell style={{ ...innerCellBorder, textAlign: 'center' }}><div style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', whiteSpace: 'nowrap', fontWeight: 700 }}>Test 1 (10%)</div></TableCell>
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

            {/* Comment / Observation */}
            <AccordionSection title="Comment / Observation">
              <div style={{ padding: '2px 4px' }}>
                <u><strong>Head of School Comment</strong></u>
                <Typography variant="body2" sx={{ mt: 0.25, mb: 0.5 }}>{report.adminComment}</Typography>
                <u><strong>Class Teacher Comment</strong></u>
                <Typography variant="body2" sx={{ mt: 0.25 }}>{report.teacherComment}</Typography>
              </div>
            </AccordionSection>

            {/* Cognitive Keys + Status */}
            <div className="tpl2-keys-row">
              <div>
                <AccordionSection title="Cognitive Keys">
                  <Table size="small">
                    <TableHead><TableRow><TableCell style={{ fontWeight: 700 }}>Score Range</TableCell><TableCell style={{ fontWeight: 700 }}>Remark</TableCell></TableRow></TableHead>
                    <TableBody>
                      {gradeScale.map((g, i) => <TableRow key={i}><TableCell>{g.range}</TableCell><TableCell>{g.remark}</TableCell></TableRow>)}
                    </TableBody>
                  </Table>
                </AccordionSection>
              </div>
              <div>
                <AccordionSection title="STATUS">
                  <Table size="small">
                    <TableBody>
                      <TableRow><TableCell>Promotion</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>Promoted to {className}</TableCell></TableRow>
                      <TableRow><TableCell>This Term Ends</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.closing_date || '2026-07-12'}</TableCell></TableRow>
                      <TableRow><TableCell>Next Term Begins</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
                      <TableRow><TableCell>Boarding Resumption</TableCell><TableCell style={{ textAlign: 'right', fontWeight: 700 }}>{sessionTerm?.resumption_date || '2026-09-08'}</TableCell></TableRow>
                    </TableBody>
                  </Table>
                </AccordionSection>
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* ── Right Side: Performances + Score ──────────── */}
        <div className="tpl2-right">
          <AccordionSection title="PERFORMANCES">
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
          </AccordionSection>

          <AccordionSection title="SCORE">
            <Table size="small">
              <TableBody>
                <TableRow><TableCell style={{ textAlign: 'center', borderBottom: '1px solid grey' }}><strong>Total Score</strong><br />{report.total_score}/{report.subjects.length * 100}</TableCell></TableRow>
                <TableRow><TableCell style={{ textAlign: 'center', borderBottom: '1px solid grey' }}><strong>Class Position</strong><br />{report.position}</TableCell></TableRow>
                <TableRow><TableCell style={{ textAlign: 'center' }}><strong>Percentage</strong><br />{avg}%</TableCell></TableRow>
              </TableBody>
            </Table>
          </AccordionSection>

          <div style={{ marginTop: 8 }}>
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

export default TemplateTwo;
