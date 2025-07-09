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
  package_type: yup
    .string()
    .oneOf(['Monthly', 'Yearly', 'One-time'], 'Package type must be Monthly, Yearly, or One-time')
    .required('Package type is required'),
  price: yup
    .number()
    .min(0, 'Price must be a positive number')
    .max(99999.99, 'Price must be less than $100,000')
    .required('Price is required'),
  features: yup
    .array()
    .of(yup.string())
    .min(1, 'At least one feature is required')
    .required('Features are required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});

export const createPackageValidationSchema = packageValidationSchema;

export const updatePackageValidationSchema = packageValidationSchema;

export default packageValidationSchema;
