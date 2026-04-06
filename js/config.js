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
  // Türkiye
  TURKEY_SUPER_LIG: { id: 203, name: 'Süper Lig', flag: '🇹🇷', country: 'Turkey' },
  TURKEY_1_LIG: { id: 204, name: '1. Lig', flag: '🇹🇷', country: 'Turkey' },
  
  // İngiltere
  ENGLAND_PREMIER: { id: 39, name: 'Premier Lig', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_CHAMPIONSHIP: { id: 40, name: 'Championship', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_LEAGUE_1: { id: 41, name: 'League One', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_LEAGUE_2: { id: 42, name: 'League Two', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  ENGLAND_FA_CUP: { id: 45, name: 'FA Cup', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', country: 'England' },
  
  // İspanya
  SPAIN_LA_LIGA: { id: 140, name: 'La Liga', flag: '🇪🇸', country: 'Spain' },
  SPAIN_SEGUNDA: { id: 141, name: 'Segunda Division', flag: '🇪🇸', country: 'Spain' },
  SPAIN_COPA: { id: 143, name: 'Copa del Rey', flag: '🇪🇸', country: 'Spain' },
  
  // Almanya
  GERMANY_BUNDESLIGA: { id: 78, name: 'Bundesliga', flag: '🇩🇪', country: 'Germany' },
  GERMANY_2_BUNDESLIGA: { id: 79, name: '2. Bundesliga', flag: '🇩🇪', country: 'Germany' },
  GERMANY_DFB_POKAL: { id: 81, name: 'DFB Pokal', flag: '🇩🇪', country: 'Germany' },
  
  // İtalya
  ITALY_SERIE_A: { id: 135, name: 'Serie A', flag: '🇮🇹', country: 'Italy' },
  ITALY_SERIE_B: { id: 136, name: 'Serie B', flag: '🇮🇹', country: 'Italy' },
  ITALY_COPPA: { id: 137, name: 'Coppa Italia', flag: '🇮🇹', country: 'Italy' },
  
  // Fransa
  FRANCE_LIGUE_1: { id: 61, name: 'Ligue 1', flag: '🇫🇷', country: 'France' },
  FRANCE_LIGUE_2: { id: 62, name: 'Ligue 2', flag: '🇫🇷', country: 'France' },
  FRANCE_COUPE: { id: 66, name: 'Coupe de France', flag: '🇫🇷', country: 'France' },
  
  // Hollanda
  NETHERLANDS_EREDIVISIE: { id: 88, name: 'Eredivisie', flag: '🇳🇱', country: 'Netherlands' },
  
  // Portekiz
  PORTUGAL_PRIMEIRA: { id: 94, name: 'Primeira Liga', flag: '🇵🇹', country: 'Portugal' },
  
  // Belçika
  BELGIUM_FIRST: { id: 144, name: 'Pro League', flag: '🇧🇪', country: 'Belgium' },
  
  // İskoçya
  SCOTLAND_PREMIERSHIP: { id: 179, name: 'Premiership', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Scotland' },
  
  // Avusturya
  AUSTRIA_BUNDESLIGA: { id: 218, name: 'Bundesliga', flag: '🇦🇹', country: 'Austria' },
  
  // İsviçre
  SWITZERLAND_SUPER: { id: 207, name: 'Super League', flag: '🇨🇭', country: 'Switzerland' },
  
  // Danimarka
  DENMARK_SUPERLIGA: { id: 119, name: 'Superliga', flag: '🇩🇰', country: 'Denmark' },
  
  // İsveç
  SWEDEN_ALLSVENSKAN: { id: 113, name: 'Allsvenskan', flag: '🇸🇪', country: 'Sweden' },
  
  // Norveç
  NORWAY_ELITESERIEN: { id: 103, name: 'Eliteserien', flag: '🇳🇴', country: 'Norway' },
  
  // Polonya
  POLAND_EKSTRAKLASA: { id: 106, name: 'Ekstraklasa', flag: '🇵🇱', country: 'Poland' },
  
  // Çekya
  CZECH_FIRST: { id: 197, name: 'First League', flag: '🇨🇿', country: 'Czech-Republic' },
  
  // Ukrayna
  UKRAINE_PREMIER: { id: 333, name: 'Premier League', flag: '🇺🇦', country: 'Ukraine' },
  
  // Rusya
  RUSSIA_PREMIER: { id: 235, name: 'Premier League', flag: '🇷🇺', country: 'Russia' },
  
  // Yunanistan
  GREECE_SUPER: { id: 197, name: 'Super League', flag: '🇬🇷', country: 'Greece' },
  
  // Hırvatistan
  CROATIA_FIRST: { id: 210, name: 'Prva Liga', flag: '🇭🇷', country: 'Croatia' },
  
  // Sırbistan
  SERBIA_SUPER: { id: 286, name: 'Super Liga', flag: '🇷🇸', country: 'Serbia' },
  
  // Bulgaristan
  BULGARIA_FIRST: { id: 172, name: 'First League', flag: '🇧🇬', country: 'Bulgaria' },
  
  // Romanya
  ROMANIA_LIGA_1: { id: 283, name: 'Liga I', flag: '🇷🇴', country: 'Romania' },
  
  // Macaristan
  HUNGARY_NB1: { id: 271, name: 'NB I', flag: '🇭🇺', country: 'Hungary' },
  
  // Slovenya
  SLOVENIA_FIRST: { id: 246, name: 'Prva Liga', flag: '🇸🇮', country: 'Slovenia' },
  
  // Slovakya
  SLOVAKIA_SUPER: { id: 287, name: 'Super Liga', flag: '🇸🇰', country: 'Slovakia' },
  
  // UEFA Turnuvaları
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World' },
  CONFERENCE_LEAGUE: { id: 848, name: 'Konferans Ligi', flag: '🇪🇺', country: 'World' },
  
  // Uluslararası
  WORLD_CUP: { id: 1, name: 'Dünya Kupası', flag: '🌍', country: 'World' },
  EURO_CHAMPIONSHIP: { id: 4, name: 'Avrupa Şampiyonası', flag: '🇪🇺', country: 'World' },
  NATIONS_LEAGUE: { id: 5, name: 'Uluslar Ligi', flag: '🇪🇺', country: 'World' },
  
  // Güney Amerika
  BRAZIL_SERIE_A: { id: 71, name: 'Série A', flag: '🇧🇷', country: 'Brazil' },
  ARGENTINA_PRIMERA: { id: 128, name: 'Primera División', flag: '🇦🇷', country: 'Argentina' },
  COPA_LIBERTADORES: { id: 13, name: 'Copa Libertadores', flag: '🌎', country: 'World' },
  COPA_SUDAMERICANA: { id: 11, name: 'Copa Sudamericana', flag: '🌎', country: 'World' },
  
  // MLS
  MLS: { id: 253, name: 'MLS', flag: '🇺🇸', country: 'USA' },
  
  // Asya
  JAPAN_J1: { id: 98, name: 'J1 League', flag: '🇯🇵', country: 'Japan' },
  KOREA_K_LEAGUE: { id: 292, name: 'K League 1', flag: '🇰🇷', country: 'South-Korea' },
  CHINA_SUPER: { id: 169, name: 'Super League', flag: '🇨🇳', country: 'China' },
  
  // Orta Doğu
  SAUDI_PROFESSIONAL: { id: 307, name: 'Pro League', flag: '🇸🇦', country: 'Saudi-Arabia' },
  UAE_PRO_LEAGUE: { id: 301, name: 'Pro League', flag: '🇦🇪', country: 'UAE' },
  QATAR_STARS: { id: 305, name: 'Stars League', flag: '🇶🇦', country: 'Qatar' }
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
  API_KEY: 'ta_api_key',
  DAILY_COUPON: 'ta_daily_coupon',
  PREMIUM_COUPON: 'ta_premium_coupon',
  FINISHED_MATCHES: 'ta_finished',
  USER_PICKS: 'ta_picks',
  USER_COUPON: 'ta_user_coupon' // Yeni: Kullanıcının kupon maçları
};
