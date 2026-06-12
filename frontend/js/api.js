const API_BASE = 'http://localhost:5000/api/v1';

const Auth = {
  getToken: () => localStorage.getItem('token'),
  getUser: () => JSON.parse(localStorage.getItem('user') || 'null'),
  setSession: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },
  clearSession: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
};

async function apiRequest(endpoint, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  const data = await response.json();

  if (!response.ok) {
    const msg = data.errors
      ? data.errors.map(e => e.message).join(', ')
      : data.message || 'Something went wrong.';
    throw new Error(msg);
  }

  return data;
}

const AuthAPI = {
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login:    (payload) => apiRequest('/auth/login',    { method: 'POST', body: JSON.stringify(payload) }),
  me:       ()        => apiRequest('/auth/me'),
};

const TasksAPI = {
  getAll:    ()       => apiRequest('/tasks'),
  getById:   (id)     => apiRequest(`/tasks/${id}`),
  create:    (data)   => apiRequest('/tasks',      { method: 'POST',   body: JSON.stringify(data) }),
  update:    (id, data) => apiRequest(`/tasks/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:    (id)     => apiRequest(`/tasks/${id}`, { method: 'DELETE' }),
};

const AdminAPI = {
  getUsers:   () => apiRequest('/admin/users'),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, { method: 'DELETE' }),
  getAllTasks: () => apiRequest('/tasks/admin/all'),
};
