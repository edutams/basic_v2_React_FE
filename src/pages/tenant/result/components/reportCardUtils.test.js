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

  it('averages the terms the student sat, instead of summing them', () => {
    const report = buildReportProp(
      reportWith({ first_term_score: 72, second_term_score: 68, third_term_score: 80 }),
    );

    expect(report.subjects[0].weighted_annual).toBe(73.33);
  });

  it('only counts the terms that have a score', () => {
    const report = buildReportProp(reportWith({ first_term_score: 72, third_term_score: 80 }));

    expect(report.subjects[0].weighted_annual).toBe(76);
  });

  it('averages a mid-session entrant over the terms sat, not all three', () => {
    const report = buildReportProp(reportWith({ second_term_score: 70, third_term_score: 80 }));

    expect(report.subjects[0].weighted_annual).toBe(75);
  });

  it('re-bases the term weights for a student who joined in the second term', () => {
    const report = buildReportProp({
      ...reportWith({ second_term_score: 70, third_term_score: 80 }),
      mark_config: {
        exam_max_score: 70,
        ca_max_score: 30,
        ca_content: [],
        term_percentage: { first_term: 30, second_term: 30, third_term: 40 },
      },
    });

    // (70*30 + 80*40) / (30 + 40) — the unused 1st term weight is not lost.
    expect(report.subjects[0].weighted_annual).toBe(75.71);
  });

  it('weights the terms when the mark configuration sets term percentages', () => {
    const report = buildReportProp({
      ...reportWith({ first_term_score: 90, second_term_score: 60, third_term_score: 70 }),
      mark_config: {
        exam_max_score: 70,
        ca_max_score: 30,
        ca_content: [],
        term_percentage: { first_term: 20, second_term: 30, third_term: 50 },
      },
    });

    expect(report.subjects[0].weighted_annual).toBe(71);
  });

  it('never reports more than 100 for the weighted annual score', () => {
    const report = buildReportProp({
      ...reportWith({ first_term_score: 100, second_term_score: 100, third_term_score: 100 }),
      mark_config: {
        exam_max_score: 70,
        ca_max_score: 30,
        ca_content: [],
        term_percentage: { first_term: 60, second_term: 60, third_term: 60 },
      },
    });

    expect(report.subjects[0].weighted_annual).toBe(100);
  });

  it('leaves the weighted annual score null when the student has no term scores', () => {
    const report = buildReportProp(reportWith({}));

    expect(report.subjects[0].weighted_annual).toBeNull();
  });
});
