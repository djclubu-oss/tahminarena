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
  ENGLAND_PREMIER: { id: 39, name: 'Premier Lig', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England', category: 'Avrupa' },
  ENGLAND_CHAMPIONSHIP: { id: 40, name: 'Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England', category: 'Avrupa' },
  SPAIN_LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain', category: 'Avrupa' },
  SPAIN_SEGUNDA: { id: 141, name: 'La Liga 2', flag: '🇪🇸', country: 'Spain', category: 'Avrupa' },
  GERMANY_BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany', category: 'Avrupa' },
  GERMANY_2_BUNDESLIGA: { id: 79, name: '2. Bundesliga', flag: '🇩🇪', country: 'Germany', category: 'Avrupa' },
  ITALY_SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy', category: 'Avrupa' },
  ITALY_SERIE_B: { id: 136, name: 'Serie B', flag: '🇮🇹', country: 'Italy', category: 'Avrupa' },
  FRANCE_LIGUE_1: { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France', category: 'Avrupa' },
  FRANCE_LIGUE_2: { id: 62, name: 'Ligue 2', flag: '🇫🇷', country: 'France', category: 'Avrupa' },
  
  // Türkiye
  TURKEY_SUPER_LIG: { id: 203, name: 'Süper Lig', flag: '🇹🇷', country: 'Turkey', category: 'Türkiye' },
  TURKEY_1_LIG: { id: 204, name: '1. Lig', flag: '🇹🇷', country: 'Turkey', category: 'Türkiye' },
  
  // Güney Amerika
  BRAZIL_SERIE_A: { id: 71, name: 'Brasileirão', flag: '🇧🇷', country: 'Brazil', category: 'Güney Amerika' },
  BRAZIL_SERIE_B: { id: 72, name: 'Brasileirão B', flag: '🇧🇷', country: 'Brazil', category: 'Güney Amerika' },
  ARGENTINA_PRIMERA: { id: 128, name: 'Liga Profesional', flag: '🇦🇷', country: 'Argentina', category: 'Güney Amerika' },
  ARGENTINA_B_NACIONAL: { id: 129, name: 'Primera B', flag: '🇦🇷', country: 'Argentina', category: 'Güney Amerika' },
  COPA_LIBERTADORES: { id: 13, name: 'Copa Libertadores', flag: '🌎', country: 'World', category: 'Güney Amerika' },
  COPA_SUDAMERICANA: { id: 11, name: 'Copa Sudamericana', flag: '🌎', country: 'World', category: 'Güney Amerika' },
  
  // Asya
  SAUDI_PRO_LEAGUE: { id: 307, name: 'Saudi Pro League', flag: '🇸🇦', country: 'Saudi-Arabia', category: 'Asya' },
  SAUDI_FIRST_DIVISION: { id: 308, name: 'Saudi First Division', flag: '🇸🇦', country: 'Saudi-Arabia', category: 'Asya' },
  JAPAN_J1: { id: 98, name: 'J1 League', flag: '🇯🇵', country: 'Japan', category: 'Asya' },
  JAPAN_J2: { id: 99, name: 'J2 League', flag: '🇯🇵', country: 'Japan', category: 'Asya' },
  KOREA_K_LEAGUE_1: { id: 292, name: 'K League 1', flag: '🇰🇷', country: 'South-Korea', category: 'Asya' },
  KOREA_K_LEAGUE_2: { id: 293, name: 'K League 2', flag: '🇰🇷', country: 'South-Korea', category: 'Asya' },
  CHINA_SUPER: { id: 169, name: 'Super League', flag: '🇨🇳', country: 'China', category: 'Asya' },
  UAE_PRO_LEAGUE: { id: 301, name: 'Pro League', flag: '🇦🇪', country: 'UAE', category: 'Asya' },
  QATAR_STARS: { id: 305, name: 'Stars League', flag: '🇶🇦', country: 'Qatar', category: 'Asya' },
  
  // Kuzey Amerika
  MLS: { id: 253, name: 'MLS', flag: '🇺🇸', country: 'USA', category: 'Kuzey Amerika' },
  MEXICO_LIGA_MX: { id: 262, name: 'Liga MX', flag: '🇲🇽', country: 'Mexico', category: 'Kuzey Amerika' },
  MEXICO_LIGA_EXPANSION: { id: 263, name: 'Liga de Expansión', flag: '🇲🇽', country: 'Mexico', category: 'Kuzey Amerika' },
  CANADA_PREMIER: { id: 254, name: 'Canadian Premier', flag: '🇨🇦', country: 'Canada', category: 'Kuzey Amerika' },
  
  // Afrika
  MOROCCO_BOTOLA: { id: 200, name: 'Botola Pro', flag: '🇲🇦', country: 'Morocco', category: 'Afrika' },
  EGYPT_PREMIER: { id: 233, name: 'Egyptian Premier', flag: '🇪🇬', country: 'Egypt', category: 'Afrika' },
  TUNISIA_LIGUE_1: { id: 202, name: 'Ligue 1', flag: '🇹🇳', country: 'Tunisia', category: 'Afrika' },
  ALGERIA_LIGUE_1: { id: 203, name: 'Ligue 1', flag: '🇩🇿', country: 'Algeria', category: 'Afrika' },
  
  // UEFA Turnuvaları
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World', category: 'UEFA' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World', category: 'UEFA' },
  CONFERENCE_LEAGUE: { id: 848, name: 'Konferans Ligi', flag: '🇪🇺', country: 'World', category: 'UEFA' },
  EUROPA_CONFERENCE: { id: 4, name: 'Avrupa Konferans', flag: '🇪🇺', country: 'World', category: 'UEFA' }
};

const ALL_LEAGUE_IDS = Object.values(LEAGUES).map(l => l.id).join('-');

const CURRENT_SEASON = 2024;
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

const STORAGE_KEYS = {
  SESSION: 'ta_session',
  USERS: 'ta_users',
  USER_COUPON: 'ta_user_coupon'
};
