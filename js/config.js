// ===== API-Football Configuration =====
const API_CONFIG = {
  KEY: 'e8287b49fa0bb657f2b4582bb13a496e',
  BASE_URL: 'https://v3.football.api-sports.io',
  HEADERS: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': 'e8287b49fa0bb657f2b4582bb13a496e'
  }
};

// ===== Selected Leagues =====
const LEAGUES = {
  // Avrupa - Büyük 5 Lig
  ENGLAND_PREMIER: { id: 39, name: 'Premier Lig', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_CHAMPIONSHIP: { id: 40, name: 'Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  SPAIN_LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
  SPAIN_SEGUNDA: { id: 141, name: 'La Liga 2', flag: '🇪🇸', country: 'Spain' },
  GERMANY_BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
  GERMANY_2_BUNDESLIGA: { id: 79, name: '2. Bundesliga', flag: '🇩🇪', country: 'Germany' },
  ITALY_SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
  ITALY_SERIE_B: { id: 136, name: 'Serie B', flag: '🇮🇹', country: 'Italy' },
  FRANCE_LIGUE_1: { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
  FRANCE_LIGUE_2: { id: 62, name: 'Ligue 2', flag: '🇫🇷', country: 'France' },
  
  // Türkiye
  TURKEY_SUPER_LIG: { id: 203, name: 'Süper Lig', flag: '🇹🇷', country: 'Turkey' },
  TURKEY_1_LIG: { id: 204, name: '1. Lig', flag: '🇹🇷', country: 'Turkey' },
  
  // Brezilya
  BRAZIL_SERIE_A: { id: 71, name: 'Brasileirão', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_SERIE_B: { id: 72, name: 'Série B', flag: '🇧🇷', country: 'Brazil' },
  
  // Arjantin
  ARGENTINA_PRIMERA: { id: 128, name: 'Liga Profesional', flag: '🇦🇷', country: 'Argentina' },
  ARGENTINA_B_NACIONAL: { id: 129, name: 'Primera Nacional', flag: '🇦🇷', country: 'Argentina' },
  
  // Uruguay
  URUGUAY_PRIMERA: { id: 268, name: 'Primera División', flag: '🇺🇾', country: 'Uruguay' },
  
  // Paraguay
  PARAGUAY_PRIMERA: { id: 250, name: 'Primera División', flag: '🇵🇾', country: 'Paraguay' },
  
  // Kolombiya
  COLOMBIA_PRIMERA: { id: 239, name: 'Primera A', flag: '🇨🇴', country: 'Colombia' },
  
  // Şili
  CHILE_PRIMERA: { id: 265, name: 'Primera División', flag: '🇨🇱', country: 'Chile' },
  
  // Asya
  SAUDI_PRO_LEAGUE: { id: 307, name: 'Saudi Pro League', flag: '🇸🇦', country: 'Saudi-Arabia' },
  JAPAN_J1: { id: 98, name: 'J1 League', flag: '🇯🇵', country: 'Japan' },
  KOREA_K_LEAGUE_1: { id: 292, name: 'K League 1', flag: '🇰🇷', country: 'South-Korea' },
  
  // Kuzey Amerika
  MLS: { id: 253, name: 'MLS', flag: '🇺🇸', country: 'USA' },
  MEXICO_LIGA_MX: { id: 262, name: 'Liga MX', flag: '🇲🇽', country: 'Mexico' },
  
  // Afrika
  MOROCCO_BOTOLA: { id: 200, name: 'Botola Pro', flag: '🇲🇦', country: 'Morocco' },
  EGYPT_PREMIER: { id: 233, name: 'Egyptian Premier', flag: '🇪🇬', country: 'Egypt' },
  
  // UEFA
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World' }
};

const ALL_LEAGUE_IDS = Object.values(LEAGUES).map(l => l.id).join('-');
const CURRENT_SEASON = 2024;
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

const STORAGE_KEYS = {
  SESSION: 'ta_session',
  USERS: 'ta_users',
  USER_COUPON: 'ta_user_coupon'
};
