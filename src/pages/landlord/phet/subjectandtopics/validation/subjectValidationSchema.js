import * as yup from 'yup';

export const subjectValidationSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Subject name must be at least 2 characters')
    .max(50, 'Subject name must be less than 50 characters')
    .required('Subject name is required'),
  code: yup
    .string()
    .min(2, 'Subject code must be at least 2 characters')
    .max(10, 'Subject code must be less than 10 characters')
    .required('Subject code is required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
}); 