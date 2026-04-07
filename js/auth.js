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
        name: 'Demo Kullanici', 
        email: email, 
        premium: false,
        premiumApproved: false,
        createdAt: new Date().toISOString()
      };
      this.setSession(user);
      return { success: true, user: user };
    }

    // Premium demo account
    if (email === 'premium@tahminarena.com' && password === 'premium123') {
      const user = { 
        name: 'Premium Kullanici', 
        email: email, 
        premium: true,
        premiumApproved: true,
        createdAt: new Date().toISOString()
      };
      this.setSession(user);
      return { success: true, user: user };
    }

    // Admin account - hardcoded password
    if (email === ADMIN_EMAIL && password === 'Selcuk123)))') {
      const adminUser = {
        name: 'Admin',
        email: ADMIN_EMAIL,
        premium: true,
        premiumApproved: true,
        createdAt: new Date().toISOString()
      };
      this.setSession(adminUser);
      return { success: true, user: adminUser };
    }

    // Regular users
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === this.hashPassword(password));
    
    if (user) {
      this.setSession(user);
      return { success: true, user: user };
    }

    return { success: false, error: 'E-posta veya sifre hatali!' };
  }

  register(name, email, password, password2) {
    if (password !== password2) {
      return { success: false, error: 'Sifreler eslesmiyor!' };
    }

    const users = this.getUsers();
    
    if (users.find(u => u.email === email)) {
      return { success: false, error: 'Bu e-posta zaten kayitli!' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Sifre en az 6 karakter olmali!' };
    }

    const newUser = {
      name: name,
      email: email,
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

  requestPremium() {
    if (!this.session) return { success: false, error: 'Giris yapmalisiniz!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === this.session.email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanici bulunamadi!' };
    }

    users[userIndex].premiumRequest = true;
    users[userIndex].premiumRequestDate = new Date().toISOString();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    this.session.premiumRequest = true;
    this.setSession(this.session);

    return { success: true, message: 'Premium talebiniz alindi. Admin onayi bekleniyor.' };
  }

  approvePremium(email) {
    if (!this.isAdmin()) return { success: false, error: 'Yetkisiz islem!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanici bulunamadi!' };
    }

    users[userIndex].premium = true;
    users[userIndex].premiumApproved = true;
    users[userIndex].premiumRequest = false;
    users[userIndex].premiumApprovedDate = new Date().toISOString();
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    if (this.session && this.session.email === email) {
      this.session.premium = true;
      this.session.premiumApproved = true;
      this.setSession(this.session);
    }

    return { success: true, message: 'Premium uyelik onaylandi.' };
  }

  removePremium(email) {
    if (!this.isAdmin()) return { success: false, error: 'Yetkisiz islem!' };
    
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.email === email);
    
    if (userIndex === -1) {
      return { success: false, error: 'Kullanici bulunamadi!' };
    }

    users[userIndex].premium = false;
    users[userIndex].premiumApproved = false;
    users[userIndex].premiumRequest = false;
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    
    if (this.session && this.session.email === email) {
      this.session.premium = false;
      this.session.premiumApproved = false;
      this.setSession(this.session);
    }

    return { success: true, message: 'Premium uyelik kaldirildi.' };
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

const authService = new AuthService();
