import tenantApi from '@/api/tenant/tenant_api';

const BASE = '/communication';

const communicationApi = {
  // Chats
  chatUsers: (search = '') => tenantApi.post(`${BASE}/chats/users`, { filters: search }),
  chatMessages: (receiverId) => tenantApi.get(`${BASE}/chats/get_messages`, { params: { id: receiverId } }),
  chatCreate: (receiverId, message) => tenantApi.post(`${BASE}/chats/create`, { receiverId, message }),
  chatFile: (fileData, receiverId) => tenantApi.post(`${BASE}/chats/file`, { fileData, receiverId }),
  chatDelete: (id) => tenantApi.post(`${BASE}/chats/delete`, { id }),

  // Mail
  mailUsers: (filters = '') => tenantApi.post(`${BASE}/mail/users`, { filters }),
  mailSearchedUsers: (filters = '') => tenantApi.post(`${BASE}/mail/searched_users`, { filters }),
  mailSave: (payload) => tenantApi.post(`${BASE}/mail/save`, payload),
  mailInbox: (page = 1) => tenantApi.post(`${BASE}/mail/inbox`, { page }),
  mailSent: (page = 1) => tenantApi.post(`${BASE}/mail/sent`, { page }),
  mailArchive: (page = 1) => tenantApi.post(`${BASE}/mail/archive`, { page }),
  mailViewInbox: (id) => tenantApi.post(`${BASE}/mail/view_inbox`, { id }),
  mailViewSent: (id) => tenantApi.post(`${BASE}/mail/view_sent`, { id }),
  mailViewArchive: (id) => tenantApi.post(`${BASE}/mail/view_archive`, { id }),
  mailUnreadCount: () => tenantApi.get(`${BASE}/mail/unread_count`),
  mailStatistics: () => tenantApi.get(`${BASE}/mail/statistics`),
  mailArchiveInbox: (id) => tenantApi.post(`${BASE}/mail/archive_inbox`, { id }),
  mailDeleteInbox: (id) => tenantApi.post(`${BASE}/mail/delete_inbox`, { id }),
  mailArchiveSent: (id) => tenantApi.post(`${BASE}/mail/archive_sent`, { id }),
  mailDeleteSent: (id) => tenantApi.post(`${BASE}/mail/delete_sent`, { id }),
  mailDeleteArchive: (id) => tenantApi.post(`${BASE}/mail/delete_archive`, { id }),
  mailRestoreArchive: (id) => tenantApi.post(`${BASE}/mail/restore_archive`, { id }),

  // SMS
  smsUsers: (filters = {}) => tenantApi.post(`${BASE}/sms/users`, { filters }),
  smsUserSearch: (filters = {}) => tenantApi.post(`${BASE}/sms/user_search`, { filters }),
  smsMoreUsers: (filters = '') => tenantApi.post(`${BASE}/sms/more_users`, { filters }),
  smsClasses: () => tenantApi.get(`${BASE}/sms/classes`),
  smsSave: (payload) => tenantApi.post(`${BASE}/sms/save`, payload),
  smsStatistics: () => tenantApi.get(`${BASE}/sms/statistics`),
  smsPricing: () => tenantApi.get(`${BASE}/sms/pricing`),
  whatsappPricing: () => tenantApi.get(`${BASE}/sms/get_whatapp_pricing`),
  smsSubscription: () => tenantApi.get(`${BASE}/sms/subscription`),
  smsTransactionCreate: (payload) => tenantApi.post(`${BASE}/sms/subscription_transaction/create`, payload),
  smsTransactionResponse: (transref, units) =>
    tenantApi.get(`${BASE}/sms/subscription_transaction/response`, { params: { transref, units } }),
  smsTransactionsHistory: (filters = {}) => tenantApi.post(`${BASE}/sms/transactions_history`, { filters }),

  // Result messaging
  resultProgrammes: () => tenantApi.get(`${BASE}/result/programmes`),
  resultClasses: (progId) => tenantApi.post(`${BASE}/result/classes`, { progId }),
  resultPopulate: (channel, filter) => tenantApi.post(`${BASE}/result/${channel}/populate`, { filter }),
  resultFetch: (channel, filter) => tenantApi.post(`${BASE}/result/${channel}/fetch`, { filter }),
  resultSend: (channel, payload) => tenantApi.post(`${BASE}/result/${channel}/send`, payload),
  resultDelete: (channel, payload) => tenantApi.post(`${BASE}/result/${channel}/delete`, payload),
  resultAnalytic: (channel) => tenantApi.get(`${BASE}/result/${channel}/analytic`),
  resultUpdatePhone: (channel, payload) => tenantApi.post(`${BASE}/result/${channel}/update_phone`, payload),
  resultEditEmail: (payload) => tenantApi.post(`${BASE}/result/email/edit`, payload),
};

export default communicationApi;
