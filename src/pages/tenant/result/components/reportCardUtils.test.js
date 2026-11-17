import { describe, it, expect } from 'vitest';
import { buildReportProp } from './reportCardUtils';

const reportWith = (subject) => ({
  subjects: [
    {
      subject_name: 'Mathematics',
      ca: [],
      ca_total: 30,
      exam_score: 50,
      overall_total: 80,
      highest: 90,
      lowest: 40,
      class_average: 65,
      position: 2,
      grade: 'A',
      remark: 'Excellent',
      ...subject,
    },
  ],
  summary: {},
  mark_config: { exam_max_score: 70, ca_max_score: 30, ca_content: [] },
});

describe('buildReportProp third-term columns', () => {
  it('carries the per-subject 1st/2nd/3rd term totals', () => {
    const report = buildReportProp(
      reportWith({ first_term_score: 72, second_term_score: 68, third_term_score: 80 }),
    );

    expect(report.subjects[0]).toMatchObject({
      first_term: 72,
      second_term: 68,
      third_term: 80,
    });
  });

  it('leaves the term totals null on a first/second term card', () => {
    const report = buildReportProp(reportWith({}));

    expect(report.subjects[0]).toMatchObject({
      first_term: null,
      second_term: null,
      third_term: null,
    });
  });

  it('keeps a genuine zero score instead of treating it as missing', () => {
    const report = buildReportProp(reportWith({ first_term_score: 0 }));

    expect(report.subjects[0].first_term).toBe(0);
  });
});
