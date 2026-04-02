import * as yup from 'yup';

export const agentValidationSchema = yup.object({
  organizationName: yup
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .required('Organization name is required'),
  // agentDetails: yup
  //   .string()
  //   .min(2, 'Agent name must be at least 2 characters')
  //   .max(100, 'Agent name must be less than 100 characters')
  //   .required('Agent name is required'),
  organizationDomain: yup
    .string()
    .required('Organization domain is required'),
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
});

export default agentValidationSchema;
