// ===== Authentication Service =====

const AUTH_STORAGE_KEYS = {
  SESSION: 'ta_session',
  USERS: 'ta_users'
};

class AuthService {
  constructor() {
    this.session = null;
    this.loadSession();
  }

  getKeys() {
    return typeof STORAGE_KEYS !== 'undefined' ? STORAGE_KEYS : AUTH_STORAGE_KEYS;
  }

  loadSession() {
    const keys = this.getKeys();
    const session = localStorage.getItem(keys.SESSION);
    this.session = session ? JSON.parse(session) : null;
  }

  isLoggedIn() {
    return this.session !== null;
  }

  isPremium() {
    if (!this.session) return false;
    if (this.session.email === 'djclubu@tahminarena.com') return true;
    return this.session.premium === true;
  }

  isAdmin() {
    return this.session?.email === 'djclubu@tahminarena.com';
  }

  login(email, password) {
    if (email === 'demo@tahminarena.com' && password === 'demo123') {
      const user = { name: 'Demo Kullanıcı', email, premium: false };
      this.setSession(user);
      return { success: true, user };
    }

    if (email === 'djclubu@tahminarena.com') {
      const users = this.getUsers();
      const admin = users.find(u => u.email === 'djclubu@tahminarena.com' && u.password === this.hashPassword(password));
      if (admin) {
        this.setSession(admin);
        return { success: true, user: admin };
      }
    }

    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === this.hashPassword(password));
    
    if (user) {
      this.setSession(user);
      return { success: true, user };
    }

    return { success: false, error: 'E-posta veya şifre hatalı!' };
  }

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
    const keys = this.getKeys();
    localStorage.setItem(keys.USERS, JSON.stringify(users));
    
    this.setSession(newUser);
    return { success: true, user: newUser };
  }

  logout() {
    this.session = null;
    const keys = this.getKeys();
    localStorage.removeItem(keys.SESSION);
  }

  setSession(user) {
    this.session = user;
    const keys = this.getKeys();
    localStorage.setItem(keys.SESSION, JSON.stringify(user));
  }

  getCurrentUser() {
    return this.session;
  }

  getUsers() {
    const keys = this.getKeys();
    const users = localStorage.getItem(keys.USERS);
    return users ? JSON.parse(users) : [];
  }

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = '/';
      return false;
    }
    return true;
  }

  hashPassword(password) {
    return btoa(password);
  }
}

const authService = new AuthService();
