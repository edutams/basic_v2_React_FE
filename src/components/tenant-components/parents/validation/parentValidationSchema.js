import * as Yup from 'yup';

export const parentValidationSchema = Yup.object({
  first_name:   Yup.string().required('First name is required'),
  last_name:    Yup.string().required('Last name is required'),
  middle_name:  Yup.string(),
  gender:       Yup.string().required('Gender is required'),
  email:        Yup.string().email('Enter a valid email').nullable(),
  phone:        Yup.string().required('Phone number is required'),
  relationship: Yup.string().required('Relationship is required'),
  occupation:   Yup.string().nullable(),
  address:      Yup.string().required('Address is required'),
});
