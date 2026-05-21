import * as Yup from 'yup';

export const academicInfoValidationSchema = Yup.object({
  has_previous_school: Yup.boolean(),

  // Previous school — only required when has_previous_school is true
  previous_school_name: Yup.string().when('has_previous_school', {
    is: true,
    then: (s) => s.required('Previous school name is required'),
    otherwise: (s) => s.nullable(),
  }),
  previous_school_state: Yup.string().when('has_previous_school', {
    is: true,
    then: (s) => s.required('State is required'),
    otherwise: (s) => s.nullable(),
  }),
  previous_school_lga: Yup.string().when('has_previous_school', {
    is: true,
    then: (s) => s.required('LGA is required'),
    otherwise: (s) => s.nullable(),
  }),
  previous_class: Yup.string().when('has_previous_school', {
    is: true,
    then: (s) => s.required('Previous class is required'),
    otherwise: (s) => s.nullable(),
  }),

  // Intending class — always required
  programme_id: Yup.string().required('Programme is required'),
  class_id:     Yup.string().required('Class choice is required'),
  boarding_status: Yup.string().required('Boarding status is required'),
  
});
