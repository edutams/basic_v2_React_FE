import * as yup from 'yup';

export const stimulationLinkValidationSchema = yup.object({
  topic_id: yup.string().required('Topic is required'),
  sub_topic: yup
    .string()
    .min(3, 'Sub topic must be at least 3 characters')
    .max(100, 'Sub topic must be less than 100 characters')
    .required('Sub topic is required'),
  link: yup.string().url('Must be a valid URL').required('Link is required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});
