import * as yup from 'yup';

export const agentValidationSchema = yup.object({
  organizationName: yup
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .required('Organization name is required'),
  organizationTitle: yup
    .string()
    .min(2, 'Organization title must be at least 2 characters')
    .max(100, 'Organization title must be less than 100 characters')
    .required('Organization title is required'),
  agentDetails: yup
    .string()
    .min(2, 'Agent name must be at least 2 characters')
    .max(100, 'Agent name must be less than 100 characters')
    .required('Agent name is required'),
  contactDetails: yup
    .string()
    .email('Enter a valid email address')
    .required('Agent email is required'),
  agentPhone: yup
    .string()
    .matches(
      /^(\+234|234|0)?[789][01]\d{8}$/,
      'Enter a valid Nigerian phone number (e.g., +234-801-234-5678)',
    )
    .required('Agent phone is required'),
  contactAddress: yup
    .string()
    .min(10, 'Contact address must be at least 10 characters')
    .max(200, 'Contact address must be less than 200 characters')
    .required('Contact address is required'),
  stateFilter: yup.string().required('State selection is required'),
  lga: yup
    .string()
    .min(2, 'LGA must be at least 2 characters')
    .max(50, 'LGA must be less than 50 characters')
    .required('LGA is required'),
  level: yup
    .string()
    .required('Agent level is required'),
});

export default agentValidationSchema;
