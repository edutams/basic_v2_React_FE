import { useState, useEffect, useCallback } from 'react';
import {
  createAdmissionApplication,
  updateAdmissionApplication,
  updateAdmissionStage,
  getAdmissionApplication,
} from '@/api/tenant/admission/admissionApi';

/**
 * Custom hook for managing admission form state, fully backed by the
 * server — no browser-local persistence. A draft Admission row already
 * exists (created by AdmissionBatchModal the instant "Apply Now" was
 * confirmed) by the time this hook ever runs, so the admission id and every
 * saved field come from `existingAdmission`/the backend, which is what
 * makes resuming from a different device work: there's no local-only state
 * that could be missing on a new browser/device.
 * @param {Object} selectedBatch - The selected admission batch
 * @param {Object} existingAdmission - The admission record to load (its own draft, or one being resumed)
 */
export const useAdmissionForm = (selectedBatch, existingAdmission = null) => {
  const [admissionId, setAdmissionId] = useState(null);
  const [currentStage, setCurrentStage] = useState(0);
  const [formData, setFormData] = useState({
    wardData: null,
    academicData: null,
    documentsData: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Transform backend admission data to form data structure
  const transformAdmissionToFormData = useCallback((admission) => {
    return {
      wardData: {
        surname: admission.surname || '',
        first_name: admission.first_name || '',
        other_name: admission.other_name || '',
        dob: admission.dob || '',
        gender: admission.gender || '',
        state_of_origin: admission.state_of_origin ? parseInt(admission.state_of_origin) : '',
        lga_id: admission.lga_id ? parseInt(admission.lga_id) : '',
        home_address: admission.home_address || '',
        passport_photo: admission.passport_photo || null,
        lga: admission.lga || null,
      },
      academicData: {
        has_previous_school: admission.has_previous_school ?? false,
        prev_school_name: admission.prev_school_name || '',
        prev_school_state: admission.prev_school_state ? parseInt(admission.prev_school_state) : '',
        prev_school_lga: admission.prev_school_lga ? parseInt(admission.prev_school_lga) : '',
        previous_class: admission.previous_class || '',
        intending_programme_id: admission.intending_programme_id ? String(admission.intending_programme_id) : '',
        intending_class_id: admission.intending_class_id ? String(admission.intending_class_id) : '',
        study_mode: admission.study_mode || '',
        // Preserve relationship data for display purposes
        intending_programme: admission.intending_programme || null,
        intending_class: admission.intending_class || null,
      },
      documentsData: {
        birth_cert: admission.birth_cert || null,
        prev_school_report: admission.prev_school_report || null,
        passport_photo: admission.passport_photo || null,
        medical_record: admission.medical_record || null,
      },
      admission_batch: admission.admission_batch || null,
    };
  }, []);

  useEffect(() => {
    const loadAdmissionData = async () => {
      if (!existingAdmission?.id) {
        return;
      }

      // Load what we already have immediately (no loading flicker), then
      // refresh from the backend below to pick up anything saved from
      // another device/tab since this object was fetched.
      setAdmissionId(existingAdmission.id);
      setCurrentStage(existingAdmission.admission_stage || 0);
      setFormData(transformAdmissionToFormData(existingAdmission));

      try {
        setIsLoading(true);

        const response = await getAdmissionApplication(existingAdmission.id);
        const freshAdmission = response?.data;

        if (!freshAdmission) return;

        setAdmissionId(freshAdmission.id);
        setCurrentStage(freshAdmission.admission_stage || 0);
        setFormData(transformAdmissionToFormData(freshAdmission));
      } catch (error) {
        console.error('[useAdmissionForm] Failed to refresh admission from backend:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAdmissionData();
  }, [existingAdmission, transformAdmissionToFormData]);

  // Reset in-memory state after final submit.
  const clearDraft = useCallback(() => {
    setAdmissionId(null);
    setCurrentStage(0);
    setFormData({
      wardData: null,
      academicData: null,
      documentsData: null,
    });
  }, []);

  // Save form data for a specific step
  const saveStepData = useCallback(async (step, data) => {
    setIsLoading(true);
    setErrors({});

    try {
      const updatedFormData = { ...formData };

      // Determine if this is the documents step
      const isDocumentsStep = (step === 2 && !selectedBatch?.require_payment) || (step === 3 && selectedBatch?.require_payment);

      // Update the specific step data
      switch (step) {
        case 0:
          updatedFormData.wardData = data;
          break;
        case 1:
          updatedFormData.academicData = data;
          break;
        case 2:
          if (isDocumentsStep) {
            updatedFormData.documentsData = data;
          }
          break;
        case 3:
          if (isDocumentsStep) {
            updatedFormData.documentsData = data;
          }
          break;
        default:
          break;
      }

      // Prepare payload for backend
      let payload;
      let isFormData = false;

      // For document step, use FormData to handle file uploads
      if (isDocumentsStep) {
        payload = new FormData();
        payload.append('admission_batch_id', selectedBatch?.id);
        payload.append('admission_stage', step);

        // Add ward data
        if (updatedFormData.wardData) {
          Object.entries(updatedFormData.wardData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '' && key !== 'lga') {
              payload.append(key, value);
            }
          });
        }

        // Add academic data
        if (updatedFormData.academicData) {
          Object.entries(updatedFormData.academicData).forEach(([key, value]) => {
            // Skip relationship objects
            if (key === 'intending_programme' || key === 'intending_class') {
              return;
            }

            if (value !== null && value !== undefined && value !== '') {
              // Convert boolean values to 0 or 1 for Laravel
              if (typeof value === 'boolean') {
                payload.append(key, value ? '1' : '0');
              } else {
                payload.append(key, value);
              }
            }
          });
        }

        // Handle documents - data can be { newFiles, existingDocs } or direct files
        if (data) {
          const newFiles = data.newFiles || {};
          const existingDocs = data.existingDocs || {};

          // Add new file uploads
          Object.entries(newFiles).forEach(([key, file]) => {
            if (file instanceof File) {
              payload.append(key, file);
            }
          });

          // Add existing document URLs (keep them) or explicit nulls (remove them)
          Object.entries(existingDocs).forEach(([key, value]) => {
            if (value === null) {
              // Explicitly send empty string to signal removal
              payload.append(key, '');
            } else if (value && typeof value === 'string') {
              // Keep existing document URL
              payload.append(key, value);
            }
          });
        }

        isFormData = true;
      } else {
        // For other steps, use regular JSON payload
        payload = {
          admission_batch_id: selectedBatch?.id,
          admission_stage: step,
          ...updatedFormData.wardData,
          ...updatedFormData.academicData,
        };
      }

      // Save to backend — admissionId is normally already set (the draft
      // was created up front by AdmissionBatchModal), so this is almost
      // always an update; the create branch only remains as a fallback for
      // an admission that somehow arrived here without an id yet.
      let response;
      if (admissionId) {
        response = await updateAdmissionApplication(admissionId, payload, isFormData);
      } else {
        response = await createAdmissionApplication(payload, isFormData);
        setAdmissionId(response.data.id);
      }

      // Update stage
      setCurrentStage(step);

      // Merge backend response data with local form data
      // This ensures we have the latest data including uploaded file URLs
      const backendData = response.data;
      const mergedFormData = {
        wardData: {
          ...updatedFormData.wardData,
          // Merge backend ward data (includes uploaded passport_photo URL, lga relationship, etc.)
          ...(backendData.surname && {
            surname: backendData.surname,
            first_name: backendData.first_name,
            other_name: backendData.other_name,
            dob: backendData.dob,
            gender: backendData.gender,
            state_of_origin: backendData.state_of_origin,
            lga_id: backendData.lga_id,
            home_address: backendData.home_address,
            passport_photo: backendData.passport_photo, // URL from backend
            lga: backendData.lga, // Relationship data
          }),
        },
        academicData: {
          ...updatedFormData.academicData,
          // Merge backend academic data
          ...(backendData.has_previous_school !== undefined && {
            has_previous_school: backendData.has_previous_school,
            prev_school_name: backendData.prev_school_name,
            prev_school_state: backendData.prev_school_state,
            prev_school_lga: backendData.prev_school_lga,
            previous_class: backendData.previous_class,
            intending_programme_id: backendData.intending_programme_id ? String(backendData.intending_programme_id) : '',
            intending_class_id: backendData.intending_class_id ? String(backendData.intending_class_id) : '',
            study_mode: backendData.study_mode,
            intending_programme: backendData.intending_programme,
            intending_class: backendData.intending_class,
          }),
        },
        documentsData: {
          // Start with existing document data
          ...updatedFormData.documentsData,
          // Explicitly merge backend document URLs, including null values (removed documents)
          // Only merge if the backend response has these fields (even if null)
          ...(Object.prototype.hasOwnProperty.call(backendData, 'birth_cert') && {
            birth_cert: backendData.birth_cert
          }),
          ...(Object.prototype.hasOwnProperty.call(backendData, 'prev_school_report') && {
            prev_school_report: backendData.prev_school_report
          }),
          ...(Object.prototype.hasOwnProperty.call(backendData, 'passport_photo') && {
            passport_photo: backendData.passport_photo
          }),
          ...(Object.prototype.hasOwnProperty.call(backendData, 'medical_record') && {
            medical_record: backendData.medical_record
          }),
        },
        admission_batch: backendData.admission_batch,
      };

      // Update state with merged data
      setFormData(mergedFormData);

      return { success: true, data: response.data };
    } catch (error) {
      console.error('Failed to save step data:', error);

      // Handle validation errors
      if (error?.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }

      return {
        success: false,
        error: error?.response?.data?.message || 'Failed to save data',
        errors: error?.response?.data?.errors,
      };
    } finally {
      setIsLoading(false);
    }
  }, [admissionId, formData, selectedBatch]);

  // Update admission stage only (for payment/document steps)
  const updateStage = useCallback(async (stage) => {
    if (!admissionId) return { success: false, error: 'No admission ID' };

    setIsLoading(true);
    try {
      await updateAdmissionStage(admissionId, stage);
      setCurrentStage(stage);
      return { success: true };
    } catch (error) {
      console.error('Failed to update stage:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Failed to update stage',
      };
    } finally {
      setIsLoading(false);
    }
  }, [admissionId]);

  // Submit final application
  const submitApplication = useCallback(async () => {
    if (!admissionId) return { success: false, error: 'No admission ID' };

    setIsLoading(true);
    try {
      await updateAdmissionStage(admissionId, 5);
      clearDraft();
      return { success: true };
    } catch (error) {
      console.error('Failed to submit application:', error);
      return {
        success: false,
        error: error?.response?.data?.message || 'Failed to submit application',
      };
    } finally {
      setIsLoading(false);
    }
  }, [admissionId, clearDraft]);

  return {
    admissionId,
    currentStage,
    formData,
    isLoading,
    errors,
    saveStepData,
    updateStage,
    submitApplication,
    clearDraft,
  };
};
