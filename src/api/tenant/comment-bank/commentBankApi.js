import tenantApi from '@/api/tenant/tenant_api';

// ── Comment Bank API ────────────────────────────────────────────
// Backed by the /comment-bank routes in routes/tenant/comment_bank.php
const commentBankApi = {
  // Every comment grade (row) joined with the current user's comment-bank
  // cells (columns), plus completion stats and role meta.
  // GET /comment-bank/matrix
  getMatrix: () => tenantApi.get('/comment-bank/matrix'),

  // Save one cell. POST /comment-bank/matrix/cell { comment_grade_id, field, value }
  saveCell: (data) => tenantApi.post('/comment-bank/matrix/cell', data),

  // "AI Comment Assistant" — Auto-fill Empty Comments. `cells` omitted
  // fills every empty cell; passed, fills only that selection.
  // POST /comment-bank/matrix/auto-fill { cells?, tone? }
  autoFill: (data) => tenantApi.post('/comment-bank/matrix/auto-fill', data),

  // "AI Comment Assistant" — Improve All Comments.
  // POST /comment-bank/matrix/improve { cells?, tone? }
  improve: (data) => tenantApi.post('/comment-bank/matrix/improve', data),

  // Quick Action — Copy from higher range. `cells` required.
  // POST /comment-bank/matrix/copy-from-higher { cells }
  copyFromHigher: (data) => tenantApi.post('/comment-bank/matrix/copy-from-higher', data),

  // Quick Action — Clear selected cells. `cells` required.
  // POST /comment-bank/matrix/clear { cells }
  clear: (data) => tenantApi.post('/comment-bank/matrix/clear', data),

  // Quick Action — Reset to default. `cells` omitted resets everything.
  // POST /comment-bank/matrix/reset-default { cells? }
  resetDefault: (data) => tenantApi.post('/comment-bank/matrix/reset-default', data),

  // Bulk-apply an imported CSV (round-trips with the matrix export).
  // POST /comment-bank/matrix/import { cells }
  importCells: (data) => tenantApi.post('/comment-bank/matrix/import', data),

  // ── General Comments (freeform, not tied to a score range) ──────
  getGeneralComments: () => tenantApi.get('/comment-bank/general'),
  createGeneralComment: (data) => tenantApi.post('/comment-bank/general', data),
  updateGeneralComment: (id, data) => tenantApi.put(`/comment-bank/general/${id}`, data),
  deleteGeneralComment: (id) => tenantApi.delete(`/comment-bank/general/${id}`),
};

export default commentBankApi;
