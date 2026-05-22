import * as Yup from 'yup';

export const wardValidationSchema = Yup.object({
  surname:         Yup.string().required('Surname is required'),
  first_name:      Yup.string().required('First name is required'),
  other_name:      Yup.string().nullable(),
  dob:             Yup.string().required('Date of birth is required'),
  gender:          Yup.string().required('Gender is required'),
  state_of_origin: Yup.string().required('State of origin is required'),
  lga:             Yup.string().required('LGA is required'),
  home_address:    Yup.string().required('Home address is required'),
});
