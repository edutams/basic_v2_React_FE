import * as yup from 'yup';

export const topicValidationSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Topic name must be at least 2 characters')
    .max(50, 'Topic name must be less than 50 characters')
    .required('Topic name is required'),
  code: yup
    .string()
    .min(2, 'Topic code must be at least 2 characters')
    .max(10, 'Topic code must be less than 10 characters')
    .required('Topic code is required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
}); 