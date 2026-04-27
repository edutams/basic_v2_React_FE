import * as Yup from 'yup';

export const parentValidationSchema = Yup.object({
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
  middle_name: Yup.string(),
  gender: Yup.string().required('Gender is required'),
  email: Yup.string().email('Enter a valid email').nullable(),
  phone: Yup.string().nullable(),
  relationship: Yup.string().nullable(),
  occupation: Yup.string().nullable(),
  address: Yup.string().nullable(),
});
