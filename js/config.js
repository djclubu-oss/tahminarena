// ===== API-Football Configuration =====
const API_CONFIG = {
  KEY: 'e8287b49fa0bb657f2b4582bb13a496e',
  BASE_URL: 'https://v3.football.api-sports.io',
  HEADERS: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': 'e8287b49fa0bb657f2b4582bb13a496e'
  }
};

// ===== League IDs =====
const LEAGUES = {
  TURKEY_SUPER_LIG: { id: 203, name: 'Süper Lig', flag: '🇹🇷', country: 'Turkey' },
  ENGLAND_PREMIER: { id: 39, name: 'Premier Lig', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  SPAIN_LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
  GERMANY_BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
  ITALY_SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
  FRANCE_LIGUE_1: { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World' }
};

// ===== Season =====
const CURRENT_SEASON = 2024;

// ===== Admin Email =====
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

// ===== LocalStorage Keys =====
const STORAGE_KEYS = {
  SESSION: 'ta_session',
  USERS: 'ta_users',
  API_KEY: 'ta_api_key',
  DAILY_COUPON: 'ta_daily_coupon',
  PREMIUM_COUPON: 'ta_premium_coupon',
  FINISHED_MATCHES: 'ta_finished',
  USER_PICKS: 'ta_picks'
};
