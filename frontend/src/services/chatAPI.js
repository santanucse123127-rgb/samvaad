// API Service
const API_URL = 'http://localhost:5000/api';

const api = {
  async getConversations(token) {
    const response = await fetch(`${API_URL}/conversations`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async getMessages(conversationId, token, page = 1) {
    const response = await fetch(`${API_URL}/messages/${conversationId}?page=${page}&limit=50`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async sendMessage(data, token) {
    const response = await fetch(`${API_URL}/messages/send`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async uploadMedia(formData, token) {
    const response = await fetch(`${API_URL}/messages/upload-media`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return response.json();
  },

  async markAsRead(messageId, token) {
    const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async deleteMessage(messageId, deleteFor, token) {
    const response = await fetch(`${API_URL}/messages/${messageId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ deleteFor })
    });
    return response.json();
  },

  async searchUsers(query, token) {
    const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async createConversation(participantId, token) {
    const response = await fetch(`${API_URL}/conversations/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ participantId, type: 'one-on-one' })
    });
    return response.json();
  },

  async createGroupConversation(participantIds, name, token) {
    const response = await fetch(`${API_URL}/conversations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ participantIds, name, type: 'group' })
    });
    return response.json();
  }
};