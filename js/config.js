// ===== API-Football Configuration =====
const API_CONFIG = {
  KEY: 'e8287b49fa0bb657f2b4582bb13a496e',
  BASE_URL: 'https://v3.football.api-sports.io',
  HEADERS: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': 'e8287b49fa0bb657f2b4582bb13a496e'
  }
};

// ===== ALL Leagues (Ultra Membership - 75,000 requests/day) =====
const LEAGUES = {
  // Türkiye
  TURKEY_SUPER_LIG: { id: 203, name: 'Süper Lig', flag: '🇹🇷', country: 'Turkey' },
  TURKEY_1_LIG: { id: 204, name: '1. Lig', flag: '🇹🇷', country: 'Turkey' },
  
  // İngiltere
  ENGLAND_PREMIER: { id: 39, name: 'Premier Lig', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_CHAMPIONSHIP: { id: 40, name: 'Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_LEAGUE_1: { id: 41, name: 'League One', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_LEAGUE_2: { id: 42, name: 'League Two', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  
  // İspanya
  SPAIN_LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
  SPAIN_SEGUNDA: { id: 141, name: 'Segunda Division', flag: '🇪🇸', country: 'Spain' },
  
  // Almanya
  GERMANY_BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
  GERMANY_2_BUNDESLIGA: { id: 79, name: '2. Bundesliga', flag: '🇩🇪', country: 'Germany' },
  
  // İtalya
  ITALY_SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
  ITALY_SERIE_B: { id: 136, name: 'Serie B', flag: '🇮🇹', country: 'Italy' },
  
  // Fransa
  FRANCE_LIGUE_1: { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
  FRANCE_LIGUE_2: { id: 62, name: 'Ligue 2', flag: '🇫🇷', country: 'France' },
  
  // Hollanda
  NETHERLANDS_EREDIVISIE: { id: 88, name: 'Eredivisie', flag: '🇳🇱', country: 'Netherlands' },
  
  // Portekiz
  PORTUGAL_PRIMEIRA: { id: 94, name: 'Primeira Liga', flag: '🇵🇹', country: 'Portugal' },
  
  // Belçika
  BELGIUM_FIRST: { id: 144, name: 'Pro League', flag: '🇧🇪', country: 'Belgium' },
  
  // İskoçya
  SCOTLAND_PREMIERSHIP: { id: 179, name: 'Premiership', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Scotland' },
  
  // Brezilya
  BRAZIL_SERIE_A: { id: 71, name: 'Brasileirão Série A', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_SERIE_B: { id: 72, name: 'Brasileirão Série B', flag: '🇧🇷', country: 'Brazil' },
  
  // Arjantin
  ARGENTINA_PRIMERA: { id: 128, name: 'Liga Profesional', flag: '🇦🇷', country: 'Argentina' },
  
  // UEFA Turnuvaları
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World' },
  CONFERENCE_LEAGUE: { id: 848, name: 'Konferans Ligi', flag: '🇪🇺', country: 'World' },
  
  // Asya
  SAUDI_PRO_LEAGUE: { id: 307, name: 'Saudi Pro League', flag: '🇸🇦', country: 'Saudi-Arabia' },
  JAPAN_J1: { id: 98, name: 'J1 League', flag: '🇯🇵', country: 'Japan' },
  KOREA_K_LEAGUE_1: { id: 292, name: 'K League 1', flag: '🇰🇷', country: 'South-Korea' },
  
  // Kuzey Amerika
  MLS: { id: 253, name: 'MLS', flag: '🇺🇸', country: 'USA' },
  MEXICO_LIGA_MX: { id: 262, name: 'Liga MX', flag: '🇲🇽', country: 'Mexico' }
};

// Get all league IDs for API calls
const ALL_LEAGUE_IDS = Object.values(LEAGUES).map(l => l.id).join('-');

// ===== Season =====
const CURRENT_SEASON = 2024;

// ===== Admin Email =====
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

// ===== LocalStorage Keys =====
const STORAGE_KEYS = {
  SESSION: 'ta_session',
  USERS: 'ta_users',
  USER_COUPON: 'ta_user_coupon',
  AI_ANALYSES: 'ta_ai_analyses',
  PREMIUM_COUPONS: 'ta_premium_coupons',
  DAILY_COUPON: 'ta_daily_coupon',
  SUCCESSFUL_PREDICTIONS: 'ta_successful',
  API_REQUESTS: 'ta_api_requests'
};
