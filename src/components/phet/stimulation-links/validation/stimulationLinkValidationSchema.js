import * as yup from 'yup';

export const stimulationLinkValidationSchema = yup.object({
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be less than 100 characters')
    .required('Title is required'),
  topic: yup
    .string()
    .min(2, 'Topic must be at least 2 characters')
    .max(50, 'Topic must be less than 50 characters')
    .required('Topic is required'),
  link: yup
    .string()
    .url('Must be a valid URL')
    .required('Link is required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
}); 