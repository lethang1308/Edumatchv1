import api from './api';
import { sharedGet } from './sharedGet';

export function buildVerificationFormData(documents, centerDetails = null) {
  const data = new FormData();
  documents.forEach((document, index) => {
    for (const field of [
      'document_type',
      'document_name',
      'issuing_authority',
      'issued_year',
      'file',
    ]) {
      data.append(`documents[${index}][${field}]`, document[field]);
    }
  });
  if (centerDetails) {
    Object.entries(centerDetails).forEach(([field, value]) => {
      data.append(`center_details[${field}]`, String(value || ''));
    });
  }
  return data;
}

export const verificationService = {
  list: (page = 1) => sharedGet('/verifications', { page }),
  submit: (documents, centerDetails = null) =>
    api.post('/verifications', buildVerificationFormData(documents, centerDetails), {
      headers: { 'Content-Type': undefined },
    }),
  document: (id) => api.get(`/verifications/documents/${id}`, { responseType: 'blob' }),
};
