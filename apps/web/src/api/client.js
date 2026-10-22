const API_BASE = '/api/v1';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('bookleaf_token') || null;
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('bookleaf_token', token);
    } else {
      localStorage.removeItem('bookleaf_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const error = new Error(data?.error?.message || response.statusText || 'Request failed');
        error.status = response.status;
        error.code = data?.error?.code;
        error.details = data?.error?.details;
        throw error;
      }

      return data;
    } catch (err) {
      // If 401 Unauthorized, trigger logout if needed
      if (err.status === 401 && !endpoint.includes('/auth/login')) {
        this.setToken(null);
        window.dispatchEvent(new Event('bookleaf:unauthorized'));
      }
      throw err;
    }
  }

  // --- Auth APIs ---
  async login(email, password) {
    const res = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.data?.token) {
      this.setToken(res.data.token);
    }
    return res;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  // --- Author APIs ---
  async getAuthorDashboard() {
    return this.request('/author/dashboard');
  }

  async getAuthorBooks(params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    return this.request(`/author/books${searchParams ? `?${searchParams}` : ''}`);
  }

  async getAuthorBook(bookId) {
    return this.request(`/author/books/${bookId}`);
  }

  async getAuthorTickets(params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    return this.request(`/author/tickets${searchParams ? `?${searchParams}` : ''}`);
  }

  async getAuthorTicket(ticketId) {
    return this.request(`/author/tickets/${ticketId}`);
  }

  async createAuthorTicket(ticketData) {
    return this.request('/author/tickets', {
      method: 'POST',
      body: JSON.stringify(ticketData)
    });
  }

  async replyAuthorTicket(ticketId, message) {
    return this.request(`/author/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  // --- Admin APIs ---
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  }

  async getAdminTickets(params = {}) {
    const searchParams = new URLSearchParams(params).toString();
    return this.request(`/admin/tickets${searchParams ? `?${searchParams}` : ''}`);
  }

  async getAdminTicket(ticketId) {
    return this.request(`/admin/tickets/${ticketId}`);
  }

  async overrideTicket(ticketId, { category, priority, override_reason }) {
    return this.request(`/admin/tickets/${ticketId}/override`, {
      method: 'PATCH',
      body: JSON.stringify({ category, priority, override_reason })
    });
  }

  async updateTicketStatus(ticketId, status) {
    return this.request(`/admin/tickets/${ticketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  async assignTicket(ticketId, adminId) {
    return this.request(`/admin/tickets/${ticketId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ admin_id: adminId })
    });
  }

  async addInternalNote(ticketId, content) {
    return this.request(`/admin/tickets/${ticketId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  async sendAdminReply(ticketId, { message, status }) {
    return this.request(`/admin/tickets/${ticketId}/reply`, {
      method: 'POST',
      body: JSON.stringify({ message, status })
    });
  }

  async generateAiDraft(ticketId, force = false) {
    return this.request(`/admin/tickets/${ticketId}/draft?force=${force}`, {
      method: 'POST'
    });
  }

  async reassessAi(ticketId) {
    return this.request(`/admin/tickets/${ticketId}/reassess`, {
      method: 'POST'
    });
  }
}

export const api = new ApiClient();
