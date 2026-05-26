import * as Yup from 'yup';

export const academicInfoValidationSchema = Yup.object({
  has_previous_school: Yup.boolean(),

  // Previous school — only required when has_previous_school is true
  prev_school_name: Yup.string().when('has_previous_school', {
    is: true,
    then: (s) => s.required('Previous school name is required'),
    otherwise: (s) => s.nullable(),
  }),
  prev_school_state: Yup.string().when('has_previous_school', {
    is: true,
    then: (s) => s.required('State is required'),
    otherwise: (s) => s.nullable(),
  }),
  prev_school_lga: Yup.string().when('has_previous_school', {
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
  intending_programme_id: Yup.string().required('Programme is required'),
  intending_class_id: Yup.string().required('Class choice is required'),
  study_mode: Yup.string().required('Boarding status is required'),
  
});
