import { useContext } from 'react';
import { TenantAuthContext } from '../context/TenantContext/auth';
import { getFullImageUrl } from '../helpers/ImageHelper';

/**
 * Shared tenant branding (school name, uploaded logo, address, phone) for
 * report-card headers and anywhere else that must show the school's own
 * identity instead of placeholder content.
 *
 * Reads the tenantInfo already fetched by TenantAuthProvider
 * (/school_setup/get_current_tenant + get_academic_info) — no extra
 * request. logo_url (get_academic_info) is already absolute; school_logo
 * (get_current_tenant) is a relative storage path, so it goes through
 * getFullImageUrl. Outside a TenantAuthProvider it degrades to blanks
 * rather than throwing, so template previews never crash.
 */
export const useTenantBranding = () => {
  let tenantInfo = null;
  try {
    const ctx = useContext(TenantAuthContext);
    tenantInfo = ctx?.tenantInfo ?? null;
  } catch {
    // Rendered outside a TenantAuthProvider — fall back to blanks.
  }

  const rawLogo = tenantInfo?.logo_url || tenantInfo?.school_logo || null;

  return {
    schoolName: tenantInfo?.tenant_name || '',
    schoolLogo: rawLogo ? getFullImageUrl(rawLogo) : null,
    address: tenantInfo?.address || '',
    phone: tenantInfo?.phone || tenantInfo?.tenant_phone || '',
  };
};

export default useTenantBranding;
