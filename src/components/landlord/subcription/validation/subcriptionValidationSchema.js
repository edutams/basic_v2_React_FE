import * as yup from 'yup';

export const stimulationLinkValidationSchema = yup.object({
  subscriptionMode: yup
    .string()
    .oneOf(['perTerm', 'perSession'], 'Subscription mode must be either Per Term or Per Session')
    .required('Subscription mode is required'),
  session: yup.string().required('Session is required'),
  term: yup.string().when('subscriptionMode', {
    is: 'perTerm',
    then: (schema) => schema.required('Term is required for Per Term mode'),
    otherwise: (schema) => schema.notRequired(),
  }),
  studentpopulation: yup.string().required('Student population is required'),
  availableplan: yup.string().required('Available plan is required'),
  status: yup
    .string()
    .oneOf(['active', 'inactive'], 'Status must be either active or inactive')
    .required('Status is required'),
});
