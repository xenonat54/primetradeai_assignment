let currentFilter = 'all';
let allTasks = [];
let editingTaskId = null;

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function showAlert(alertId, message, type = 'error') {
  const el = document.getElementById(alertId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert ${type === 'error' ? 'alert-error' : 'alert-success'} show`;
  setTimeout(() => el.classList.remove('show'), 5000);
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(pageId).classList.add('active');
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('login-form').style.display  = target === 'login'    ? 'block' : 'none';
    document.getElementById('register-form').style.display = target === 'register' ? 'block' : 'none';
    document.getElementById('auth-alert').classList.remove('show');
  });
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Registering...';

  try {
    const data = await AuthAPI.register({ name, email, password });
    Auth.setSession(data.token, data.user);
    showToast('Account created! Welcome 🎉', 'success');
    loadDashboard();
  } catch (err) {
    showAlert('auth-alert', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Create Account';
  }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Signing in...';

  try {
    const data = await AuthAPI.login({ email, password });
    Auth.setSession(data.token, data.user);
    showToast(`Welcome back, ${data.user.name}!`, 'success');
    loadDashboard();
  } catch (err) {
    showAlert('auth-alert', err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Sign In';
  }
});

document.getElementById('logout-btn').addEventListener('click', () => {
  Auth.clearSession();
  showPage('auth-page');
  showToast('Logged out successfully.', 'info');
});

async function loadDashboard() {
  showPage('dashboard-page');
  const user = Auth.getUser();

  document.getElementById('nav-username').textContent = user.name;
  document.getElementById('nav-role').textContent = user.role;
  document.getElementById('nav-role').className = `role-badge role-${user.role}`;

  document.getElementById('admin-section').style.display = user.role === 'admin' ? 'block' : 'none';

  await fetchTasks();
  if (user.role === 'admin') await fetchAdminUsers();
}

async function fetchTasks() {
  try {
    const data = await TasksAPI.getAll();
    allTasks = data.tasks;
    renderTasks();
    updateStats();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function renderTasks() {
  const list = document.getElementById('task-list');
  const user = Auth.getUser();

  let filtered = allTasks;
  if (currentFilter !== 'all') {
    filtered = allTasks.filter(t => t.status === currentFilter);
  }

  if (filtered.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <p>No tasks here yet. Create one above!</p>
      </div>`;
    return;
  }

  list.innerHTML = filtered.map(task => `
    <div class="task-item" id="task-${task._id}">
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
          <span class="badge badge-${task.status}">${task.status}</span>
          <span class="badge badge-${task.priority}">${task.priority} priority</span>
          ${user.role === 'admin' && task.owner ? `<span class="task-owner">👤 ${task.owner.name}</span>` : ''}
          <span style="font-size:11px; color:var(--text-muted)">${formatDate(task.createdAt)}</span>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn btn-outline btn-sm" onclick="startEditTask('${task._id}')">✏️ Edit</button>
        <button class="btn btn-danger btn-sm" onclick="deleteTask('${task._id}')">🗑️</button>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  document.getElementById('stat-total').textContent    = allTasks.length;
  document.getElementById('stat-pending').textContent  = allTasks.filter(t => t.status === 'pending').length;
  document.getElementById('stat-progress').textContent = allTasks.filter(t => t.status === 'in-progress').length;
  document.getElementById('stat-done').textContent     = allTasks.filter(t => t.status === 'completed').length;
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderTasks();
  });
});

document.getElementById('task-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const btn = document.getElementById('task-submit-btn');
  const payload = {
    title:       document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    status:      document.getElementById('task-status').value,
    priority:    document.getElementById('task-priority').value,
  };

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span>';

  try {
    if (editingTaskId) {
      await TasksAPI.update(editingTaskId, payload);
      showToast('Task updated!', 'success');
      cancelEdit();
    } else {
      await TasksAPI.create(payload);
      showToast('Task created!', 'success');
    }
    e.target.reset();
    await fetchTasks();
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = editingTaskId ? 'Update Task' : 'Add Task';
  }
});

function startEditTask(id) {
  const task = allTasks.find(t => t._id === id);
  if (!task) return;
  editingTaskId = id;

  document.getElementById('task-title').value    = task.title;
  document.getElementById('task-desc').value     = task.description || '';
  document.getElementById('task-status').value   = task.status;
  document.getElementById('task-priority').value = task.priority;

  document.getElementById('task-submit-btn').textContent = 'Update Task';
  document.getElementById('cancel-edit-btn').style.display = 'inline-flex';
  document.getElementById('task-form-title').textContent = '✏️ Edit Task';
  document.querySelector('.card').scrollIntoView({ behavior: 'smooth' });
}

function cancelEdit() {
  editingTaskId = null;
  document.getElementById('task-form').reset();
  document.getElementById('task-submit-btn').textContent = 'Add Task';
  document.getElementById('cancel-edit-btn').style.display = 'none';
  document.getElementById('task-form-title').textContent = '➕ New Task';
}

document.getElementById('cancel-edit-btn').addEventListener('click', cancelEdit);

async function deleteTask(id) {
  if (!confirm('Delete this task? This cannot be undone.')) return;
  try {
    await TasksAPI.delete(id);
    showToast('Task deleted.', 'info');
    await fetchTasks();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function fetchAdminUsers() {
  try {
    const data = await AdminAPI.getUsers();
    const list = document.getElementById('admin-user-list');
    if (!data.users.length) {
      list.innerHTML = '<p style="color:var(--text-muted); font-size:13px;">No users found.</p>';
      return;
    }
    list.innerHTML = data.users.map(u => `
      <div class="task-item">
        <div class="task-info">
          <div class="task-title">${escapeHtml(u.name)}</div>
          <div class="task-meta">
            <span style="font-size:12px; color:var(--text-muted)">${escapeHtml(u.email)}</span>
            <span class="role-badge role-${u.role}">${u.role}</span>
            <span style="font-size:11px; color:var(--text-muted)">${formatDate(u.createdAt)}</span>
          </div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="adminDeleteUser('${u._id}')">🗑️ Remove</button>
      </div>
    `).join('');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function adminDeleteUser(id) {
  if (!confirm('Delete this user permanently?')) return;
  try {
    await AdminAPI.deleteUser(id);
    showToast('User deleted.', 'info');
    await fetchAdminUsers();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

(function init() {
  if (Auth.isLoggedIn()) {
    loadDashboard();
  } else {
    showPage('auth-page');
  }
})();
