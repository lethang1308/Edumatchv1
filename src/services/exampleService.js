import api from './api';

/**
 * Example CRUD service pattern for reference
 */
export const exampleService = {
  getAll(params) {
    return api.get('/examples', { params });
  },

  getById(id) {
    return api.get(`/examples/${id}`);
  },

  create(data) {
    return api.post('/examples', data);
  },

  update(id, data) {
    return api.put(`/examples/${id}`, data);
  },

  remove(id) {
    return api.delete(`/examples/${id}`);
  },
};

export default exampleService;
