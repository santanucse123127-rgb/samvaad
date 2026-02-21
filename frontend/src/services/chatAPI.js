// // API Service
// const API_URL = 'http://localhost:5000/api';

// const api = {
//   async getConversations(token) {
//     const response = await fetch(`${API_URL}/conversations`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     return response.json();
//   },

//   async getMessages(conversationId, token, page = 1) {
//     const response = await fetch(`${API_URL}/messages/${conversationId}?page=${page}&limit=50`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     return response.json();
//   },

//   async sendMessage(data, token) {
//     const response = await fetch(`${API_URL}/messages/send`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify(data)
//     });
//     return response.json();
//   },

//   async uploadMedia(formData, token) {
//     const response = await fetch(`${API_URL}/messages/upload-media`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`
//       },
//       body: formData
//     });
//     return response.json();
//   },

//   async markAsRead(messageId, token) {
//     const response = await fetch(`${API_URL}/messages/${messageId}/read`, {
//       method: 'PUT',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     return response.json();
//   },

//   async deleteMessage(messageId, deleteFor, token) {
//     const response = await fetch(`${API_URL}/messages/${messageId}`, {
//       method: 'DELETE',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ deleteFor })
//     });
//     return response.json();
//   },

//   async searchUsers(query, token) {
//     const response = await fetch(`${API_URL}/users/search?q=${encodeURIComponent(query)}`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//     return response.json();
//   },

//   async createConversation(participantId, token) {
//     const response = await fetch(`${API_URL}/conversations/create`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ participantId, type: 'one-on-one' })
//     });
//     return response.json();
//   },

//   async createGroupConversation(participantIds, name, token) {
//     const response = await fetch(`${API_URL}/conversations`, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       },
//       body: JSON.stringify({ participantIds, name, type: 'group' })
//     });
//     return response.json();
//   }
// };

// API Service
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    const response = await fetch(`${API_URL}/conversations/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ participants: participantIds, groupName: name, type: 'group' })
    });
    return response.json();
  },

  async updateGroupInfo(conversationId, data, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/group`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },

  async sendGroupInvite(conversationId, userId, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/invite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  async respondGroupInvite(conversationId, accept, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/invite/respond`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ accept })
    });
    return response.json();
  },

  async addParticipant(conversationId, userId, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/participants`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  async removeParticipant(conversationId, userId, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/participants`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  async leaveGroup(conversationId, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/leave`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.json();
  },

  async makeAdmin(conversationId, userId, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/admins`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  async removeAdmin(conversationId, userId, token) {
    const response = await fetch(`${API_URL}/conversations/${conversationId}/admins`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId })
    });
    return response.json();
  },

  async votePoll(messageId, optionIndex, token) {
    const response = await fetch(`${API_URL}/messages/${messageId}/vote`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ optionIndex })
    });
    return response.json();
  },

  async subscribePush(subscription, token) {
    const response = await fetch(`${API_URL}/users/subscribe-push`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
    return response.json();
  },

  async unsubscribePush(endpoint, token) {
    const response = await fetch(`${API_URL}/users/unsubscribe-push`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ endpoint })
    });
    return response.json();
  }
};

// ✅ FIX: Export getUsers function properly
export const getUsers = async (token) => {
  const response = await fetch(`${API_URL}/users`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  return response.json();
};

// ✅ Export all other methods
export const getConversations = api.getConversations;
export const getMessages = api.getMessages;
export const sendMessage = api.sendMessage;
export const uploadMedia = api.uploadMedia;
export const markAsRead = api.markAsRead;
export const deleteMessage = api.deleteMessage;
export const searchUsers = api.searchUsers;
export const createConversation = api.createConversation;
export const createGroupConversation = api.createGroupConversation;
export const addParticipant = api.addParticipant;
export const removeParticipant = api.removeParticipant;
export const leaveGroup = api.leaveGroup;
export const makeAdmin = api.makeAdmin;
export const removeAdmin = api.removeAdmin;
export const votePoll = api.votePoll;
export const updateGroupInfo = api.updateGroupInfo;
export const sendGroupInvite = api.sendGroupInvite;
export const respondGroupInvite = api.respondGroupInvite;
export const subscribePush = api.subscribePush;
export const unsubscribePush = api.unsubscribePush;

export default api;