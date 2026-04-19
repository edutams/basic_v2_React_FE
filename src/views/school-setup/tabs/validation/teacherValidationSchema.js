import * as yup from 'yup';

export const teacherValidationSchema = yup.object({
  staff_id: yup.string().required('Staff ID is required'),

  surname: yup.string().required('Surname is required'),

  first_name: yup.string().required('First name is required'),

  middle_name: yup.string(),

  phone_number: yup
    .string()
    .matches(/^[0-9]+$/, 'Phone number must contain only digits')
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number must be less than 15 digits'),

  gender: yup
    .string()
    .oneOf(['Male', 'Female'], 'Gender must be either Male or Female')
    .required('Gender is required'),

  email: yup.string().email('Invalid email address').required('Email is required'),

  is_class_teacher: yup.boolean(),

  class_arm_id: yup.string().when('is_class_teacher', {
    is: true,
    then: (schema) => schema.required('Class arm is required for class teachers'),
    otherwise: (schema) => schema,
  }),

  staff_type: yup.string().when('is_class_teacher', {
    is: false,
    then: (schema) => schema.required('Staff type is required'),
    otherwise: (schema) => schema,
  }),
});
