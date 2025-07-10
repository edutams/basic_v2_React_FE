import * as yup from 'yup';

export const moduleValidationSchema = yup.object({
  mod_name: yup
    .string()
    .min(3, 'Module name must be at least 3 characters')
    .max(50, 'Module name must be less than 50 characters')
    .required('Module name is required'),
  mod_description: yup
    .string()
    .min(10, 'Module description must be at least 10 characters')
    .max(200, 'Module description must be less than 200 characters')
    .required('Module description is required'),
  mod_status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});

export const updateModuleValidationSchema = moduleValidationSchema;

export default moduleValidationSchema;
