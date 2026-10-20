import api from './api';
import { sharedGet } from './sharedGet';

export function buildVerificationFormData(documents) {
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
  return data;
}

export const verificationService = {
  list: (page = 1) => sharedGet('/verifications', { page }),
  submit: (documents) =>
    api.post('/verifications', buildVerificationFormData(documents), {
      headers: { 'Content-Type': undefined },
    }),
  document: (id) => api.get(`/verifications/documents/${id}`, { responseType: 'blob' }),
};
