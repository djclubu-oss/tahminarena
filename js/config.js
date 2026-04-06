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
  
  // ===== BREZİLYA LİGLERİ =====
  BRAZIL_SERIE_A: { id: 71, name: 'Brasileirão Série A', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_SERIE_B: { id: 72, name: 'Brasileirão Série B', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_SERIE_C: { id: 75, name: 'Brasileirão Série C', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_COPA: { id: 73, name: 'Copa do Brasil', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_PAULISTA: { id: 476, name: 'Paulista Série A', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_CARIOCA: { id: 477, name: 'Carioca Série A', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_GAUCHO: { id: 478, name: 'Gaúcho Série A', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_MINEIRO: { id: 479, name: 'Mineiro Série A', flag: '🇧🇷', country: 'Brazil' },
  
  // ===== ARJANTİN LİGLERİ =====
  ARGENTINA_PRIMERA: { id: 128, name: 'Liga Profesional', flag: '🇦🇷', country: 'Argentina' },
  ARGENTINA_B_NACIONAL: { id: 129, name: 'Primera Nacional', flag: '🇦🇷', country: 'Argentina' },
  ARGENTINA_COPA: { id: 130, name: 'Copa Argentina', flag: '🇦🇷', country: 'Argentina' },
  ARGENTINA_PRIMERA_B: { id: 131, name: 'Primera B', flag: '🇦🇷', country: 'Argentina' },
  
  // ===== URUGUAY LİGLERİ =====
  URUGUAY_PRIMERA: { id: 268, name: 'Primera División', flag: '🇺🇾', country: 'Uruguay' },
  URUGUAY_SEGUNDA: { id: 269, name: 'Segunda División', flag: '🇺🇾', country: 'Uruguay' },
  
  // ===== PARAGUAY LİGLERİ =====
  PARAGUAY_PRIMERA: { id: 250, name: 'Primera División', flag: '🇵🇾', country: 'Paraguay' },
  PARAGUAY_SEGUNDA: { id: 251, name: 'Segunda División', flag: '🇵🇾', country: 'Paraguay' },
  
  // ===== KOLOMBİYA LİGLERİ =====
  COLOMBIA_PRIMERA: { id: 239, name: 'Primera A', flag: '🇨🇴', country: 'Colombia' },
  COLOMBIA_SEGUNDA: { id: 240, name: 'Primera B', flag: '🇨🇴', country: 'Colombia' },
  COLOMBIA_COPA: { id: 241, name: 'Copa Colombia', flag: '🇨🇴', country: 'Colombia' },
  
  // ===== ŞİLİ LİGLERİ =====
  CHILE_PRIMERA: { id: 265, name: 'Primera División', flag: '🇨🇱', country: 'Chile' },
  CHILE_SEGUNDA: { id: 266, name: 'Primera B', flag: '🇨🇱', country: 'Chile' },
  
  // ===== EKVADOR LİGLERİ =====
  ECUADOR_PRIMERA: { id: 242, name: 'Primera A', flag: '🇪🇨', country: 'Ecuador' },
  
  // ===== PERU LİGLERİ =====
  PERU_PRIMERA: { id: 244, name: 'Primera División', flag: '🇵🇪', country: 'Peru' },
  
  // ===== BOLİVYA LİGLERİ =====
  BOLIVIA_PRIMERA: { id: 246, name: 'Primera División', flag: '🇧🇴', country: 'Bolivia' },
  
  // ===== VENEZUELA LİGLERİ =====
  VENEZUELA_PRIMERA: { id: 247, name: 'Primera División', flag: '🇻🇪', country: 'Venezuela' },
  
  // Güney Amerika Kupalari
  COPA_LIBERTADORES: { id: 13, name: 'Copa Libertadores', flag: '🌎', country: 'World' },
  COPA_SUDAMERICANA: { id: 11, name: 'Copa Sudamericana', flag: '🌎', country: 'World' },
  RECOPA_SUDAMERICANA: { id: 12, name: 'Recopa Sudamericana', flag: '🌎', country: 'World' },
  
  // Asya
  SAUDI_PRO_LEAGUE: { id: 307, name: 'Saudi Pro League', flag: '🇸🇦', country: 'Saudi-Arabia' },
  SAUDI_FIRST_DIVISION: { id: 308, name: 'Saudi First Division', flag: '🇸🇦', country: 'Saudi-Arabia' },
  JAPAN_J1: { id: 98, name: 'J1 League', flag: '🇯🇵', country: 'Japan' },
  JAPAN_J2: { id: 99, name: 'J2 League', flag: '🇯🇵', country: 'Japan' },
  KOREA_K_LEAGUE_1: { id: 292, name: 'K League 1', flag: '🇰🇷', country: 'South-Korea' },
  KOREA_K_LEAGUE_2: { id: 293, name: 'K League 2', flag: '🇰🇷', country: 'South-Korea' },
  CHINA_SUPER: { id: 169, name: 'Super League', flag: '🇨🇳', country: 'China' },
  UAE_PRO_LEAGUE: { id: 301, name: 'Pro League', flag: '🇦🇪', country: 'UAE' },
  QATAR_STARS: { id: 305, name: 'Stars League', flag: '🇶🇦', country: 'Qatar' },
  
  // Kuzey Amerika
  MLS: { id: 253, name: 'MLS', flag: '🇺🇸', country: 'USA' },
  MEXICO_LIGA_MX: { id: 262, name: 'Liga MX', flag: '🇲🇽', country: 'Mexico' },
  MEXICO_LIGA_EXPANSION: { id: 263, name: 'Liga de Expansión', flag: '🇲🇽', country: 'Mexico' },
  CANADA_PREMIER: { id: 254, name: 'Canadian Premier', flag: '🇨🇦', country: 'Canada' },
  
  // Afrika
  MOROCCO_BOTOLA: { id: 200, name: 'Botola Pro', flag: '🇲🇦', country: 'Morocco' },
  EGYPT_PREMIER: { id: 233, name: 'Egyptian Premier', flag: '🇪🇬', country: 'Egypt' },
  
  // UEFA Turnuvaları
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World' },
  CONFERENCE_LEAGUE: { id: 848, name: 'Konferans Ligi', flag: '🇪🇺', country: 'World' }
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
  USER_COUPON: 'ta_user_coupon'
};
