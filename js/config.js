// ===== API-Football Configuration =====
const API_CONFIG = {
  KEY: 'e8287b49fa0bb657f2b4582bb13a496e',
  BASE_URL: 'https://v3.football.api-sports.io',
  HEADERS: {
    'x-rapidapi-host': 'v3.football.api-sports.io',
    'x-rapidapi-key': 'e8287b49fa0bb657f2b4582bb13a496e'
  }
};

// ===== ALL Leagues (Ultra Membership) =====
const LEAGUES = {
  TURKEY_SUPER_LIG: { id: 203, name: 'Süper Lig', flag: '🇹🇷', country: 'Turkey' },
  TURKEY_1_LIG: { id: 204, name: '1. Lig', flag: '🇹🇷', country: 'Turkey' },
  ENGLAND_PREMIER: { id: 39, name: 'Premier Lig', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_CHAMPIONSHIP: { id: 40, name: 'Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_LEAGUE_1: { id: 41, name: 'League One', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_LEAGUE_2: { id: 42, name: 'League Two', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  SPAIN_LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
  SPAIN_SEGUNDA: { id: 141, name: 'Segunda Division', flag: '🇪🇸', country: 'Spain' },
  GERMANY_BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
  GERMANY_2_BUNDESLIGA: { id: 79, name: '2. Bundesliga', flag: '🇩🇪', country: 'Germany' },
  ITALY_SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
  ITALY_SERIE_B: { id: 136, name: 'Serie B', flag: '🇮🇹', country: 'Italy' },
  FRANCE_LIGUE_1: { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
  FRANCE_LIGUE_2: { id: 62, name: 'Ligue 2', flag: '🇫🇷', country: 'France' },
  NETHERLANDS_EREDIVISIE: { id: 88, name: 'Eredivisie', flag: '🇳🇱', country: 'Netherlands' },
  PORTUGAL_PRIMEIRA: { id: 94, name: 'Primeira Liga', flag: '🇵🇹', country: 'Portugal' },
  BELGIUM_FIRST: { id: 144, name: 'Pro League', flag: '🇧🇪', country: 'Belgium' },
  SCOTLAND_PREMIERSHIP: { id: 179, name: 'Premiership', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Scotland' },
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World' },
  BRAZIL_SERIE_A: { id: 71, name: 'Série A', flag: '🇧🇷', country: 'Brazil' },
  ARGENTINA_PRIMERA: { id: 128, name: 'Primera División', flag: '🇦🇷', country: 'Argentina' },
  MLS: { id: 253, name: 'MLS', flag: '🇺🇸', country: 'USA' }
};

const ALL_LEAGUE_IDS = Object.values(LEAGUES).map(l => l.id).join('-');
const CURRENT_SEASON = 2024;
const ADMIN_EMAIL = 'djclubu@tahminarena.com';

const STORAGE_KEYS = {
  SESSION: 'ta_session',
  USERS: 'ta_users',
  USER_COUPON: 'ta_user_coupon'
};
