// ===== Enhanced Authentication Service =====

class AuthService {
  constructor() {
    this.session = null;
    this.loadSession();
  }

  loadSession() {
    const session = localStorage.getItem(STORAGE_KEYS.SESSION);
    this.session = session ? JSON.parse(session) : null;
  }

  isLoggedIn() {
    return this.session !== null;
  }

  isPremium() {
    if (!this.session) return false;
    if (this.session.email === ADMIN_EMAIL) return true;
    return this.session.premium === true || this.session.premiumApproved === true;
  }

  isAdmin() {
    return this.session?.email === ADMIN_EMAIL;
  }

  login(email, password) {
    // Demo account
    if (email === 'demo@tahminarena.com' && password === 'demo123') {
      const user = { 
        name: 'Demo Kullanıcı', 
        email, 
        premium: false,
        premiumApproved: false,
        createdAt: new Date().toISOString()
      };
      this.setSession(user);
      return { success: true, user };
    }

    // Premium demo account
    if (email === 'premium@tahminarena.com' && password === 'premium123') {
      const user = { 
        name: 'Premium Kullanıcı', 
        email, 
        premium: true,
        premiumApproved: true,
        createdAt: new Date().toISOString()
      };
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

  register(name, email, password, password2) {
    if (password !== password2) {
      return { success: false, error: 'Şifreler eşleşmiyor!' };
    }

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
      premiumApproved: false,
      premiumRequest: false,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    this.setSession(newUser);
    return { success: true, user: newUser };
  }

  logout() {
    this.session = null;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  setSession(user) {
    this.session = user;
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  }

  getCurrentUser() {
    return this.session;
  }

  getUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  }

  // ===== PREMIUM MANAGEMENT =====
  
  requestPremium() {
    if (!this.session) return { success: false, error: 'Giriş yapmalısınız!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === this.session.email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanıcı bulunamadı!' };
    }

    users[userIndex].premiumRequest = true;
    users[userIndex].premiumRequestDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update session
    this.session.premiumRequest = true;
    this.setSession(this.session);

    return { success: true, message: 'Premium talebiniz alındı. Admin onayı bekleniyor.' };
  }

  approvePremium(email) {
    if (!this.isAdmin()) return { success: false, error: 'Yetkisiz işlem!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanıcı bulunamadı!' };
    }

    users[userIndex].premium = true;
    users[userIndex].premiumApproved = true;
    users[userIndex].premiumRequest = false;
    users[userIndex].premiumApprovedDate = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    // Update session if it's the current user
    if (this.session?.email === email) {
      this.session.premium = true;
      this.session.premiumApproved = true;
      this.setSession(this.session);
    }

    return { success: true, message: 'Premium üyelik onaylandı.' };
  }

  removePremium(email) {
    if (!this.isAdmin()) return { success: false, error: 'Yetkisiz işlem!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanıcı bulunamadı!' };
    }

    users[userIndex].premium = false;
    users[userIndex].premiumApproved = false;
    users[userIndex].premiumRequest = false;
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    if (this.session?.email === email) {
      this.session.premium = false;
      this.session.premiumApproved = false;
      this.setSession(this.session);
    }

    return { success: true, message: 'Premium üyelik kaldırıldı.' };
  }

  getPendingPremiumRequests() {
    if (!this.isAdmin()) return [];
    
    const users = this.getUsers();
    return users.filter(u => u.premiumRequest === true && u.premiumApproved !== true);
  }

  hashPassword(password) {
    return btoa(password);
  }

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = './index.html';
      return false;
    }
    return true;
  }

  requireAdmin() {
    if (!this.isAdmin()) {
      window.location.href = './dashboard.html';
      return false;
    }
    return true;
  }

  requirePremium() {
    if (!this.isLoggedIn()) {
      window.location.href = './index.html';
      return false;
    }
    return this.isPremium();
  }
}

// Create global instance
const authService = new AuthService();
