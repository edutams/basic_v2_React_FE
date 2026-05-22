import * as yup from 'yup';

export const holidayValidationSchema = yup.object({
  holiday_date: yup
    .date()
    .required('Holiday date is required'),
  holiday_description: yup
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(100, 'Description must be less than 100 characters')
    .required('Holiday description is required'),
});

export const createHolidayValidationSchema = holidayValidationSchema;

export default holidayValidationSchema;