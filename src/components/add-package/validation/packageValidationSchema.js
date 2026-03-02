import * as yup from 'yup';

export const packageValidationSchema = yup.object({
  package_name: yup
    .string()
    .min(3, 'Package name must be at least 3 characters')
    .max(50, 'Package name must be less than 50 characters')
    .required('Package name is required'),
  package_description: yup
    .string()
    .min(10, 'Package description must be at least 10 characters')
    .max(500, 'Package description must be less than 500 characters')
    .required('Package description is required'),
  package_status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
  package_icon: yup
    .string()
    .required('Icon is required'),
  package_code: yup
    .string()
    .min(3, 'Package code must be at least 3 characters')
    .max(20, 'Package code must be less than 20 characters')
    .required('Package code is required'),
  package_order: yup
    .number()
    .integer('Order must be an integer')
    .min(0, 'Order must be at least 0')
    .required('Order is required'),
});

export const createPackageValidationSchema = packageValidationSchema;

export const updatePackageValidationSchema = packageValidationSchema;

export default packageValidationSchema;
