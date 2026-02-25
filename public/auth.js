// v2026-02-25
// Authentication Module for Debt Consolidation Empire Dashboard

const Auth = {
  // Demo users
  users: [
    {
      email: 'agent@demo.com',
      password: 'demo',
      role: 'agent',
      agentId: 'AGT001',
      name: 'John Smith',
      avatar: 'https://ui-avatars.com/api/?name=John+Smith&background=3B82F6&color=fff'
    },
    {
      email: 'manager@demo.com',
      password: 'demo',
      role: 'manager',
      agentId: 'MGR001',
      name: 'Sarah Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=06B6D4&color=fff'
    },
    {
      email: 'owner@demo.com',
      password: 'demo',
      role: 'owner',
      agentId: 'OWN001',
      name: 'Patrick Chinery',
      avatar: 'https://ui-avatars.com/api/?name=Patrick+Chinery&background=22C55E&color=fff'
    }
  ],

  // Initialize auth system
  init() {
    this.checkSession();
  },

  // Check if user is logged in
  checkSession() {
    const session = this.getSession();
    if (!session) {
      this.showLogin();
      return false;
    }
    return true;
  },

  // Get current session
  getSession() {
    const sessionData = localStorage.getItem('debt_empire_session');
    if (!sessionData) return null;
    
    try {
      const session = JSON.parse(sessionData);
      // Check if session is expired (24 hours)
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        this.logout();
        return null;
      }
      return session;
    } catch (e) {
      return null;
    }
  },

  // Login function
  login(email, password) {
    const user = this.users.find(u => u.email === email && u.password === password);
    
    if (!user) {
      return {
        success: false,
        message: 'Invalid email or password'
      };
    }

    // Create session
    const session = {
      userId: user.agentId,
      email: user.email,
      role: user.role,
      name: user.name,
      avatar: user.avatar,
      timestamp: Date.now()
    };

    localStorage.setItem('debt_empire_session', JSON.stringify(session));

    return {
      success: true,
      session: session
    };
  },

  // Logout function
  logout() {
    localStorage.removeItem('debt_empire_session');
    window.location.hash = '#login';
    this.showLogin();
  },

  // Show login page
  showLogin() {
    const app = document.getElementById('app');
    if (!app) return;

    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0f1a] via-[#0f172a] to-[#1e293b] p-4">
        <div class="w-full max-w-md">
          <!-- Logo/Brand -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl mb-4">
              <i data-lucide="shield-check" class="w-8 h-8 text-white"></i>
            </div>
            <h1 class="text-3xl font-bold text-white font-['Orbitron']">Debt Empire</h1>
            <p class="text-gray-400 mt-2">Debt Consolidation Management</p>
          </div>

          <!-- Login Card -->
          <div class="bg-[rgba(15,23,42,0.8)] backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-800">
            <h2 class="text-2xl font-bold text-white mb-6">Sign In</h2>

            <form id="loginForm" class="space-y-4">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input 
                  type="email" 
                  id="loginEmail" 
                  class="w-full px-4 py-3 bg-[#0a0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                  required
                >
              </div>

              <!-- Password -->
              <div>
                <label class="block text-sm font-medium text-gray-300 mb-2">Password</label>
                <input 
                  type="password" 
                  id="loginPassword" 
                  class="w-full px-4 py-3 bg-[#0a0f1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  required
                >
              </div>

              <!-- Error Message -->
              <div id="loginError" class="hidden text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20"></div>

              <!-- Submit Button -->
              <button 
                type="submit"
                class="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Sign In
              </button>
            </form>

            <!-- Demo Credentials -->
            <div class="mt-6 p-4 bg-[#0a0f1a] rounded-lg border border-gray-800">
              <p class="text-xs text-gray-400 mb-2 font-semibold">Demo Credentials:</p>
              <div class="space-y-1 text-xs text-gray-500">
                <div class="flex items-center justify-between">
                  <span>Agent:</span>
                  <button onclick="Auth.quickLogin('agent@demo.com', 'demo')" class="text-blue-400 hover:text-blue-300">agent@demo.com / demo</button>
                </div>
                <div class="flex items-center justify-between">
                  <span>Manager:</span>
                  <button onclick="Auth.quickLogin('manager@demo.com', 'demo')" class="text-cyan-400 hover:text-cyan-300">manager@demo.com / demo</button>
                </div>
                <div class="flex items-center justify-between">
                  <span>Owner:</span>
                  <button onclick="Auth.quickLogin('owner@demo.com', 'demo')" class="text-green-400 hover:text-green-300">owner@demo.com / demo</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Re-render lucide icons
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    // Attach form handler
    document.getElementById('loginForm').addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;
      this.handleLogin(email, password);
    });
  },

  // Quick login helper
  quickLogin(email, password) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;
    this.handleLogin(email, password);
  },

  // Handle login submission
  handleLogin(email, password) {
    const result = this.login(email, password);
    
    if (result.success) {
      // Show success and redirect
      Toast.success('Login successful!');
      setTimeout(() => {
        window.location.hash = '#dashboard';
        window.location.reload();
      }, 500);
    } else {
      // Show error
      const errorDiv = document.getElementById('loginError');
      errorDiv.textContent = result.message;
      errorDiv.classList.remove('hidden');
      setTimeout(() => {
        errorDiv.classList.add('hidden');
      }, 3000);
    }
  },

  // Check if user has permission
  hasPermission(permission) {
    const session = this.getSession();
    if (!session) return false;

    const permissions = {
      agent: ['view_leads', 'call_leads', 'update_leads', 'view_own_stats'],
      manager: ['view_leads', 'call_leads', 'update_leads', 'view_own_stats', 'view_team', 'assign_leads', 'view_reports'],
      owner: ['all']
    };

    const userPermissions = permissions[session.role] || [];
    return userPermissions.includes(permission) || userPermissions.includes('all');
  },

  // Get role badge HTML
  getRoleBadge(role) {
    const badges = {
      agent: '<span class="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">Agent</span>',
      manager: '<span class="px-2 py-1 bg-cyan-500/20 text-cyan-400 text-xs rounded-full">Manager</span>',
      owner: '<span class="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Owner</span>'
    };
    return badges[role] || '';
  }
};

// Toast notification system
const Toast = {
  show(message, type = 'info') {
    const container = document.getElementById('toastContainer') || this.createContainer();
    
    const colors = {
      success: 'from-green-500 to-emerald-500',
      error: 'from-red-500 to-rose-500',
      warning: 'from-yellow-500 to-orange-500',
      info: 'from-blue-500 to-cyan-500'
    };

    const icons = {
      success: 'check-circle',
      error: 'x-circle',
      warning: 'alert-triangle',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${colors[type]} text-white rounded-lg shadow-lg transform transition-all duration-300 translate-x-full`;
    toast.innerHTML = `
      <i data-lucide="${icons[type]}" class="w-5 h-5"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }

    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  success(message) {
    this.show(message, 'success');
  },

  error(message) {
    this.show(message, 'error');
  },

  warning(message) {
    this.show(message, 'warning');
  },

  info(message) {
    this.show(message, 'info');
  },

  createContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
    return container;
  }
};
