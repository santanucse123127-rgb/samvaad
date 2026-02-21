import API from './api.js';

export const clipboardAPI = {
    /** Push a new clipboard item to the server (persisted + broadcast) */
    push: (data) => API.post('/clipboard', data),

    /** Fetch clipboard history (last 50 items, decrypted by server) */
    getHistory: () => API.get('/clipboard'),

    /** Delete a single item by ID */
    deleteItem: (id) => API.delete(`/clipboard/${id}`),

    /** Clear all clipboard history */
    clearAll: () => API.delete('/clipboard'),
};
