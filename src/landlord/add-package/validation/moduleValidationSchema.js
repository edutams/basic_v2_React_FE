import * as yup from 'yup';

export const moduleValidationSchema = yup.object({
  module_name: yup
    .string()
    .min(3, 'Module name must be at least 3 characters')
    .max(50, 'Module name must be less than 50 characters')
    .required('Module name is required'),
  module_description: yup
    .string()
    .min(10, 'Module description must be at least 10 characters')
    .max(500, 'Module description must be less than 500 characters')
    .required('Module description is required'),
  module_status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
  module_links: yup.object({
    link: yup
      .string()
      .matches(/^\/[a-zA-Z0-9\-_\/]*$/, 'Link must start with / and contain only valid characters')
      .required('Module link is required'),
    permission: yup
      .string()
      .matches(/^[a-zA-Z0-9\-_.]+$/, 'Permission must contain only valid characters (letters, numbers, dots, hyphens, underscores)')
      .required('Module permission is required'),
  }).required('Module links are required'),
});

export const createModuleValidationSchema = moduleValidationSchema;

export const updateModuleValidationSchema = moduleValidationSchema;

export default moduleValidationSchema;
