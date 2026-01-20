import * as yup from 'yup';

export const sessionValidationSchema = yup.object({
  sessionName: yup
    .string()
    .min(3, 'Session name must be at least 3 characters')
    .max(50, 'Session name must be less than 50 characters')
    .required('Session name is required'),
  status: yup
    .string()
    .oneOf(['Active', 'Completed', 'Pending'], 'Invalid status')
    .required('Status is required'),
  isCurrent: yup
    .boolean()
    .nullable(),
});

export const createSessionValidationSchema = sessionValidationSchema;

export default sessionValidationSchema;