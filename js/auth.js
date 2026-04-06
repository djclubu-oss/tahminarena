// ===== Authentication Service =====

class AuthService {
  constructor() {
    this.session = null;
    this.loadSession();
  }

  // Load session from storage
  loadSession() {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    this.session = session ? JSON.parse(session) : null;
  }

  // Check if logged in
  isLoggedIn() {
    return this.session !== null;
  }

  // Check if premium
  isPremium() {
    if (!this.session) return false;
    if (this.session.email === ADMIN_EMAIL) return true;
    return this.session.premium === true;
  }

  // Check if admin
  isAdmin() {
    return this.session?.email === ADMIN_EMAIL;
  }

  // Login
  login(email, password) {
    // Demo account
    if (email === 'demo@tahminarena.com' && password === 'demo123') {
      const user = { name: 'Demo Kullanıcı', email, premium: false };
      this.setSession(user);
      return { success: true, user };
    }

    // Admin account
    if (email === ADMIN_EMAIL) {
      const users = this.getUsers();
      const admin = users.find(u => u.email === ADMIN_EMAIL && u.password === this.hashPassword(password));
      if (admin) {
        this.setSession(admin);
        return { success: true, user: admin };
      }
    }

    // Regular users
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === this.hashPassword(password));
    
    if (user) {
      this.setSession(user);
      return { success: true, user };
    }

    return { success: false, error: 'E-posta veya şifre hatalı!' };
  }

  // Register
  register(name, email, password) {
    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Bu e-posta zaten kayıtlı!' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Şifre en az 6 karakter olmalı!' };
    }

    const newUser = {
      name,
      email,
      password: this.hashPassword(password),
      premium: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    this.setSession(newUser);
    return { success: true, user: newUser };
  }

  // Logout
  logout() {
    this.session = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // Set session
  setSession(user) {
    this.session = user;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  }

  // Get current user
  getCurrentUser() {
    return this.session;
  }

  // Get all users (for admin)
  getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  // Make user premium (admin only)
  makePremium(email) {
    if (!this.isAdmin()) return { success: false, error: 'Yetkisiz işlem!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanıcı bulunamadı!' };
    }

    users[userIndex].premium = true;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update session if it's the current user
    if (this.session?.email === email) {
      this.session.premium = true;
      this.setSession(this.session);
    }

    return { success: true };
  }

  // Remove premium (admin only)
  removePremium(email) {
    if (!this.isAdmin()) return { success: false, error: 'Yetkisiz işlem!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanıcı bulunamadı!' };
    }

    users[userIndex].premium = false;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    if (this.session?.email === email) {
      this.session.premium = false;
      this.setSession(this.session);
    }

    return { success: true };
  }

  // Hash password (simple base64 for demo)
  hashPassword(password) {
    return btoa(password);
  }

  // Protect route
  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = './index.html';
      return false;
    }
    return true;
  }

  // Protect admin route
  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = './dashboard.html';
      return false;
    }
    return true;
  }
}

// Create global instance
const authService = new AuthService();
