import * as yup from 'yup';

export const gatewayValidationSchema = yup.object({
  gateway_name: yup
    .string()
    .min(3, 'Gateway name must be at least 3 characters')
    .max(50, 'Gateway name must be less than 50 characters')
    .required('Gateway name is required'),
  
  gateway_status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});
