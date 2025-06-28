import * as yup from 'yup';

export const packageValidationSchema = yup.object({
  pac_name: yup
    .string()
    .min(3, 'Package name must be at least 3 characters')
    .max(50, 'Package name must be less than 50 characters')
    .required('Package name is required'),
  pac_description: yup
    .string()
    .min(10, 'Package description must be at least 10 characters')
    .max(500, 'Package description must be less than 500 characters')
    .required('Package description is required'),
  pac_status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
  pac_icon: yup
    .string()
    .required('Icon is required'),
});

export const createPackageValidationSchema = packageValidationSchema;

export const updatePackageValidationSchema = packageValidationSchema;

export default packageValidationSchema;
