import * as yup from 'yup';

export const schoolValidationScheme = yup.object({
  institutionName: yup
    .string()
    .min(2, 'institution name must be at least 2 characters')
    .max(100, 'institution name must be less than 100 characters')
    .required('institution name is required'),
  institutionShortName: yup
    .string()
    .min(2, 'Institution short name must be at least 2 characters')
    .max(100, 'Institution short name must be less than 100 characters')
    .required('Institution short name is required'),
     institutionAddress: yup
    .string()
    .min(10, 'Institution address must be at least 10 characters')
    .max(200, 'Institution address must be less than 200 characters')
    .required('Institution address is required'),
  administratorFirstName: yup
    .string()
    .min(2, 'Administrator First Name must be at least 2 characters')
    .max(100, 'Administrator First Name must be less than 100 characters')
    .required('Administrator First Name is required'),
     administratorLastName: yup
    .string()
    .min(2, 'Administrator Last Name must be at least 2 characters')
    .max(100, 'Administrator Last Name must be less than 100 characters')
    .required('Administrator Last Name is required'),
  administratorEmail: yup
    .string()
    .email('Enter a valid email address')
    .required('Administrator email is required'),
  administratorPhone: yup
    .string()
    .matches(
     /^(?:\+234|0)[789][01]\d{8}$/,
      'Enter a valid Nigerian phone number (e.g., +234-801-234-5678)',
    )
    .required('Administrator phone is required'),
 stateFilter: yup
  .string().required('State selection is required'),
  lga: yup
    .string()
    .min(2, 'LGA must be at least 2 characters')
    .max(50, 'LGA must be less than 50 characters')
    .required('LGA is required'),
  moduleType: yup
    .string()
    .required('Module Type is required'),
    headerColor: yup.string().nullable(),
sidebarColor: yup.string().nullable(),
bodyColor: yup.string().nullable(),

});

export default schoolValidationScheme;