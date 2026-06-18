import * as yup from 'yup';

export const createAgentValidationSchema = (canEditDomain = true, canSelectColor = true) => {
  const schema = {
    organizationName: yup
      .string()
      .min(2, 'Organization name must be at least 2 characters')
      .max(100, 'Organization name must be less than 100 characters')
      .required('Organization name is required'),
    contactDetails: yup
      .string()
      .email('Enter a valid email address')
      .required('Agent email is required'),
    agentPhone: yup
      .string()
      .matches(
        /^(\+234|234|0)?[789][01]\d{8}$/,
        'Enter a valid Nigerian phone number (e.g., +2348012345678)',
      )
      .required('Agent phone is required'),
    contactAddress: yup
      .string()
      .required('Contact address is required'),
    stateFilter: yup.string().required('State selection is required'),
    lga: yup.string().required('LGA is required'),
    fname: yup.string().required('First name is required'),
    lname: yup.string().required('Last name is required'),
    mname: yup.string().nullable(),
    email: yup.string().email('Enter a valid email address').required('Admin email is required'),
    phone: yup.string().required('Admin phone is required'),
    organizationLogo: yup.string().nullable(),
    adminAvatar: yup.string().nullable(),
  };

  // Only add domain validation if user can edit domain
  if (canEditDomain) {
    schema.organizationDomain = yup
      .string()
      .required('Organization domain is required');
  }

  // Only add color validation if user can select color
  if (canSelectColor) {
    schema.primaryColor = yup.string().nullable();
  }

  return yup.object(schema);
};

// Keep the original for backward compatibility
export const agentValidationSchema = createAgentValidationSchema();

export default agentValidationSchema;
