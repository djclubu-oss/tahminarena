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
  // ===== AVRUPA =====
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
  NETHERLANDS_EERSTE: { id: 89, name: 'Eerste Divisie', flag: '🇳🇱', country: 'Netherlands' },
  
  // Portekiz
  PORTUGAL_PRIMEIRA: { id: 94, name: 'Primeira Liga', flag: '🇵🇹', country: 'Portugal' },
  PORTUGAL_SEGUNDA: { id: 95, name: 'Segunda Liga', flag: '🇵🇹', country: 'Portugal' },
  
  // Belçika
  BELGIUM_FIRST: { id: 144, name: 'Pro League', flag: '🇧🇪', country: 'Belgium' },
  BELGIUM_SECOND: { id: 145, name: 'Challenger Pro League', flag: '🇧🇪', country: 'Belgium' },
  
  // İskoçya
  SCOTLAND_PREMIERSHIP: { id: 179, name: 'Premiership', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Scotland' },
  SCOTLAND_CHAMPIONSHIP: { id: 180, name: 'Championship', flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', country: 'Scotland' },
  
  // İsviçre
  SWITZERLAND_SUPER: { id: 207, name: 'Super League', flag: '🇨🇭', country: 'Switzerland' },
  SWITZERLAND_CHALLENGE: { id: 208, name: 'Challenge League', flag: '🇨🇭', country: 'Switzerland' },
  
  // Avusturya
  AUSTRIA_BUNDESLIGA: { id: 218, name: 'Bundesliga', flag: '🇦🇹', country: 'Austria' },
  AUSTRIA_2_LIGA: { id: 219, name: '2. Liga', flag: '🇦🇹', country: 'Austria' },
  
  // Danimarka
  DENMARK_SUPERLIGA: { id: 119, name: 'Superliga', flag: '🇩🇰', country: 'Denmark' },
  
  // İsveç
  SWEDEN_ALLSVENSKAN: { id: 113, name: 'Allsvenskan', flag: '🇸🇪', country: 'Sweden' },
  
  // Norveç
  NORWAY_ELITESERIEN: { id: 103, name: 'Eliteserien', flag: '🇳🇴', country: 'Norway' },
  
  // Finlandiya
  FINLAND_VEIKKAUSLIIGA: { id: 244, name: 'Veikkausliiga', flag: '🇫🇮', country: 'Finland' },
  
  // Polonya
  POLAND_EKSTRAKLASA: { id: 106, name: 'Ekstraklasa', flag: '🇵🇱', country: 'Poland' },
  
  // Çekya
  CZECH_FIRST: { id: 119, name: 'Czech Liga', flag: '🇨🇿', country: 'Czech-Republic' },
  
  // Romanya
  ROMANIA_LIGA1: { id: 283, name: 'Liga 1', flag: '🇷🇴', country: 'Romania' },
  
  // Bulgaristan
  BULGARIA_FIRST: { id: 172, name: 'First League', flag: '🇧🇬', country: 'Bulgaria' },
  
  // Sırbistan
  SERBIA_SUPER: { id: 286, name: 'Super Liga', flag: '🇷🇸', country: 'Serbia' },
  
  // Hırvatistan
  CROATIA_HNL: { id: 210, name: 'HNL', flag: '🇭🇷', country: 'Croatia' },
  
  // Ukrayna
  UKRAINE_PREMIER: { id: 333, name: 'Premier League', flag: '🇺🇦', country: 'Ukraine' },
  
  // Rusya
  RUSSIA_PREMIER: { id: 235, name: 'Premier League', flag: '🇷🇺', country: 'Russia' },
  
  // Yunanistan
  GREECE_SUPER: { id: 197, name: 'Super League', flag: '🇬🇷', country: 'Greece' },
  
  // İrlanda
  IRELAND_PREMIER: { id: 357, name: 'Premier Division', flag: '🇮🇪', country: 'Ireland' },
  
  // Galler
  WALES_PREMIER: { id: 110, name: 'Premier League', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', country: 'Wales' },
  
  // ===== UEFA TURNUVALARI =====
  CHAMPIONS_LEAGUE: { id: 2, name: 'Şampiyonlar Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_LEAGUE: { id: 3, name: 'Avrupa Ligi', flag: '🇪🇺', country: 'World' },
  CONFERENCE_LEAGUE: { id: 848, name: 'Konferans Ligi', flag: '🇪🇺', country: 'World' },
  EUROPA_CONFERENCE: { id: 848, name: 'Avrupa Konferans Ligi', flag: '🇪🇺', country: 'World' },
  
  // ===== ASYA =====
  // Türkiye (Asya kıtasında da yer alır)
  TURKEY_SUPER_LIG_ASIA: { id: 203, name: 'Süper Lig', flag: '🇹🇷', country: 'Turkey' },
  
  // Japonya
  JAPAN_J1: { id: 98, name: 'J1 League', flag: '🇯🇵', country: 'Japan' },
  JAPAN_J2: { id: 99, name: 'J2 League', flag: '🇯🇵', country: 'Japan' },
  JAPAN_J3: { id: 100, name: 'J3 League', flag: '🇯🇵', country: 'Japan' },
  JAPAN_EMPEROR_CUP: { id: 102, name: 'Emperor Cup', flag: '🇯🇵', country: 'Japan' },
  
  // Güney Kore
  KOREA_K_LEAGUE_1: { id: 292, name: 'K League 1', flag: '🇰🇷', country: 'South-Korea' },
  KOREA_K_LEAGUE_2: { id: 293, name: 'K League 2', flag: '🇰🇷', country: 'South-Korea' },
  
  // Çin
  CHINA_SUPER: { id: 169, name: 'Super League', flag: '🇨🇳', country: 'China' },
  CHINA_LEAGUE_ONE: { id: 170, name: 'China League One', flag: '🇨🇳', country: 'China' },
  
  // Suudi Arabistan
  SAUDI_PRO_LEAGUE: { id: 307, name: 'Pro League', flag: '🇸🇦', country: 'Saudi-Arabia' },
  SAUDI_FIRST_DIVISION: { id: 308, name: 'First Division', flag: '🇸🇦', country: 'Saudi-Arabia' },
  
  // Katar
  QATAR_STARS: { id: 305, name: 'Stars League', flag: '🇶🇦', country: 'Qatar' },
  
  // BAE
  UAE_PRO_LEAGUE: { id: 301, name: 'Pro League', flag: '🇦🇪', country: 'UAE' },
  
  // İran
  IRAN_PRO: { id: 290, name: 'Persian Gulf Pro League', flag: '🇮🇷', country: 'Iran' },
  
  // Irak
  IRAQ_SUPER: { id: 340, name: 'Iraqi Super League', flag: '🇮🇶', country: 'Iraq' },
  
  // Hindistan
  INDIA_SUPER: { id: 323, name: 'Indian Super League', flag: '🇮🇳', country: 'India' },
  
  // Endonezya
  INDONESIA_LIGA1: { id: 275, name: 'Liga 1', flag: '🇮🇩', country: 'Indonesia' },
  
  // Tayland
  THAILAND_LEAGUE1: { id: 295, name: 'Thai League 1', flag: '🇹🇭', country: 'Thailand' },
  
  // Vietnam
  VIETNAM_LEAGUE1: { id: 340, name: 'V.League 1', flag: '🇻🇳', country: 'Vietnam' },
  
  // Malezya
  MALAYSIA_SUPER: { id: 342, name: 'Super League', flag: '🇲🇾', country: 'Malaysia' },
  
  // Singapur
  SINGAPORE_PREMIER: { id: 344, name: 'Premier League', flag: '🇸🇬', country: 'Singapore' },
  
  // Özbekistan
  UZBEKISTAN_SUPER: { id: 350, name: 'Super League', flag: '🇺🇿', country: 'Uzbekistan' },
  
  // Ürdün
  JORDAN_PRO: { id: 356, name: 'Pro League', flag: '🇯🇴', country: 'Jordan' },
  
  // Bahreyn
  BAHRAIN_PREMIER: { id: 358, name: 'Premier League', flag: '🇧🇭', country: 'Bahrain' },
  
  // Kuveyt
  KUWAIT_PREMIER: { id: 360, name: 'Premier League', flag: '🇰🇼', country: 'Kuwait' },
  
  // Umman
  OMAN_PRO: { id: 362, name: 'Professional League', flag: '🇴🇲', country: 'Oman' },
  
  // Lübnan
  LEBANON_PREMIER: { id: 364, name: 'Premier League', flag: '🇱🇧', country: 'Lebanon' },
  
  // Suriye
  SYRIA_PREMIER: { id: 366, name: 'Premier League', flag: '🇸🇾', country: 'Syria' },
  
  // Filistin
  PALESTINE_WEST: { id: 368, name: 'West Bank League', flag: '🇵🇸', country: 'Palestine' },
  
  // Yemen
  YEMEN_PREMIER: { id: 370, name: 'Premier League', flag: '🇾🇪', country: 'Yemen' },
  
  // Pakistan
  PAKISTAN_PREMIER: { id: 372, name: 'Premier League', flag: '🇵🇰', country: 'Pakistan' },
  
  // ===== AFRİKA =====
  // Mısır
  EGYPT_PREMIER: { id: 233, name: 'Premier League', flag: '🇪🇬', country: 'Egypt' },
  
  // Fas
  MOROCCO_BOTOLA: { id: 200, name: 'Botola Pro', flag: '🇲🇦', country: 'Morocco' },
  
  // Cezayir
  ALGERIA_LIGUE1: { id: 186, name: 'Ligue 1', flag: '🇩🇿', country: 'Algeria' },
  
  // Tunus
  TUNISIA_LIGUE1: { id: 188, name: 'Ligue 1', flag: '🇹🇳', country: 'Tunisia' },
  
  // Libya
  LIBYA_PREMIER: { id: 190, name: 'Premier League', flag: '🇱🇾', country: 'Libya' },
  
  // Güney Afrika
  SOUTH_AFRICA_PREMIER: { id: 246, name: 'Premier Division', flag: '🇿🇦', country: 'South-Africa' },
  
  // Nijerya
  NIGERIA_PREMIER: { id: 248, name: 'Premier League', flag: '🇳🇬', country: 'Nigeria' },
  
  // Gana
  GHANA_PREMIER: { id: 250, name: 'Premier League', flag: '🇬🇭', country: 'Ghana' },
  
  // Senegal
  SENEGAL_LIGUE1: { id: 252, name: 'Ligue 1', flag: '🇸🇳', country: 'Senegal' },
  
  // Kamerun
  CAMEROON_ELITE: { id: 254, name: 'Elite One', flag: '🇨🇲', country: 'Cameroon' },
  
  // Fildişi Sahili
  IVORY_COAST_LIGUE1: { id: 256, name: 'Ligue 1', flag: '🇨🇮', country: 'Ivory-Coast' },
  
  // Mali
  MALI_PREMIER: { id: 258, name: 'Premier League', flag: '🇲🇱', country: 'Mali' },
  
  // Burkina Faso
  BURKINA_FASO_PREMIER: { id: 260, name: 'Premier League', flag: '🇧🇫', country: 'Burkina-Faso' },
  
  // DR Kongo
  DR_CONGO_LIGUE1: { id: 262, name: 'Ligue 1', flag: '🇨🇩', country: 'DR-Congo' },
  
  // Kongo
  CONGO_LIGUE1: { id: 264, name: 'Ligue 1', flag: '🇨🇬', country: 'Congo' },
  
  // Etiyopya
  ETHIOPIA_PREMIER: { id: 266, name: 'Premier League', flag: '🇪🇹', country: 'Ethiopia' },
  
  // Kenya
  KENYA_PREMIER: { id: 268, name: 'Premier League', flag: '🇰🇪', country: 'Kenya' },
  
  // Tanzanya
  TANZANIA_PREMIER: { id: 270, name: 'Premier League', flag: '🇹🇿', country: 'Tanzania' },
  
  // Uganda
  UGANDA_PREMIER: { id: 272, name: 'Premier League', flag: '🇺🇬', country: 'Uganda' },
  
  // Angola
  ANGOLA_GIRABOLA: { id: 274, name: 'Girabola', flag: '🇦🇴', country: 'Angola' },
  
  // Zambiya
  ZAMBIA_SUPER: { id: 276, name: 'Super League', flag: '🇿🇲', country: 'Zambia' },
  
  // Zimbabve
  ZIMBABWE_PREMIER: { id: 278, name: 'Premier League', flag: '🇿🇼', country: 'Zimbabwe' },
  
  // Mozambik
  MOZAMBIQUE_MOCAMBOLA: { id: 280, name: 'Mocambola', flag: '🇲🇿', country: 'Mozambique' },
  
  // Sudan
  SUDAN_PREMIER: { id: 282, name: 'Premier League', flag: '🇸🇩', country: 'Sudan' },
  
  // Ruanda
  RWANDA_PREMIER: { id: 284, name: 'Premier League', flag: '🇷🇼', country: 'Rwanda' },
  
  // ===== GÜNEY AMERİKA =====
  // Arjantin
  ARGENTINA_PRIMERA: { id: 128, name: 'Primera División', flag: '🇦🇷', country: 'Argentina' },
  ARGENTINA_NACIONAL: { id: 129, name: 'Primera Nacional', flag: '🇦🇷', country: 'Argentina' },
  
  // Brezilya
  BRAZIL_SERIE_A: { id: 71, name: 'Série A', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_SERIE_B: { id: 72, name: 'Série B', flag: '🇧🇷', country: 'Brazil' },
  BRAZIL_COPA: { id: 73, name: 'Copa do Brasil', flag: '🇧🇷', country: 'Brazil' },
  
  // Şili
  CHILE_PRIMERA: { id: 265, name: 'Primera División', flag: '🇨🇱', country: 'Chile' },
  
  // Uruguay
  URUGUAY_PRIMERA: { id: 268, name: 'Primera División', flag: '🇺🇾', country: 'Uruguay' },
  
  // Paraguay
  PARAGUAY_PRIMERA: { id: 250, name: 'Primera División', flag: '🇵🇾', country: 'Paraguay' },
  
  // Bolivya
  BOLIVIA_PRIMERA: { id: 246, name: 'Primera División', flag: '🇧🇴', country: 'Bolivia' },
  
  // Peru
  PERU_PRIMERA: { id: 244, name: 'Primera División', flag: '🇵🇪', country: 'Peru' },
  
  // Kolombiya
  COLOMBIA_PRIMERA: { id: 239, name: 'Primera A', flag: '🇨🇴', country: 'Colombia' },
  
  // Ekvador
  ECUADOR_PRIMERA: { id: 242, name: 'Primera A', flag: '🇪🇨', country: 'Ecuador' },
  
  // Venezuela
  VENEZUELA_PRIMERA: { id: 247, name: 'Primera División', flag: '🇻🇪', country: 'Venezuela' },
  
  // Libertadores
  COPA_LIBERTADORES: { id: 13, name: 'Copa Libertadores', flag: '🌎', country: 'World' },
  SUDAMERICANA: { id: 11, name: 'Copa Sudamericana', flag: '🌎', country: 'World' },
  
  // ===== KUZEY-ORTA AMERİKA/KARAYİPLER =====
  // ABD
  MLS: { id: 253, name: 'MLS', flag: '🇺🇸', country: 'USA' },
  MLS_NEXT: { id: 255, name: 'MLS Next Pro', flag: '🇺🇸', country: 'USA' },
  
  // Kanada
  CANADA_PREMIER: { id: 254, name: 'Premier League', flag: '🇨🇦', country: 'Canada' },
  
  // Meksika
  MEXICO_LIGA_MX: { id: 262, name: 'Liga MX', flag: '🇲🇽', country: 'Mexico' },
  MEXICO_LIGA_EXPANSION: { id: 263, name: 'Liga de Expansión', flag: '🇲🇽', country: 'Mexico' },
  
  // Kosta Rika
  COSTA_RICA_PRIMERA: { id: 265, name: 'Primera División', flag: '🇨🇷', country: 'Costa-Rica' },
  
  // Honduras
  HONDURAS_PRIMERA: { id: 267, name: 'Primera División', flag: '🇭🇳', country: 'Honduras' },
  
  // Guatemala
  GUATEMALA_PRIMERA: { id: 269, name: 'Primera División', flag: '🇬🇹', country: 'Guatemala' },
  
  // Panama
  PANAMA_PRIMERA: { id: 271, name: 'Primera División', flag: '🇵🇦', country: 'Panama' },
  
  // El Salvador
  EL_SALVADOR_PRIMERA: { id: 273, name: 'Primera División', flag: '🇸🇻', country: 'El-Salvador' },
  
  // Jamaika
  JAMAICA_PREMIER: { id: 275, name: 'Premier League', flag: '🇯🇲', country: 'Jamaica' },
  
  // Trinidad ve Tobago
  TRINIDAD_PREMIER: { id: 277, name: 'Premier League', flag: '🇹🇹', country: 'Trinidad-and-Tobago' },
  
  // Haiti
  HAITI_PREMIER: { id: 279, name: 'Premier League', flag: '🇭🇹', country: 'Haiti' },
  
  // Dominik Cumhuriyeti
  DOMINICAN_PREMIER: { id: 281, name: 'Premier League', flag: '🇩🇴', country: 'Dominican-Republic' },
  
  // Nikaragua
  NICARAGUA_PRIMERA: { id: 283, name: 'Primera División', flag: '🇳🇮', country: 'Nicaragua' },
  
  // CONCACAF
  CONCACAF_CHAMPIONS: { id: 15, name: 'CONCACAF Champions League', flag: '🌎', country: 'World' },
  
  // ===== OKYANUSYA =====
  // Avustralya
  AUSTRALIA_A_LEAGUE: { id: 188, name: 'A-League', flag: '🇦🇺', country: 'Australia' },
  
  // Yeni Zelanda
  NEW_ZEALAND_PREMIER: { id: 390, name: 'Premier League', flag: '🇳🇿', country: 'New-Zealand' },
  
  // Fiji
  FIJI_PREMIER: { id: 392, name: 'Premier League', flag: '🇫🇯', country: 'Fiji' },
  
  // Papua Yeni Gine
  PNG_PREMIER: { id: 394, name: 'Premier League', flag: '🇵🇬', country: 'Papua-New-Guinea' },
  
  // Solomon Adaları
  SOLOMON_PREMIER: { id: 396, name: 'Premier League', flag: '🇸🇧', country: 'Solomon-Islands' },
  
  // Tahiti
  TAHITI_LIGUE1: { id: 398, name: 'Ligue 1', flag: '🇵🇫', country: 'Tahiti' },
  
  // Yeni Kaledonya
  NEW_CALEDONIA_SUPER: { id: 400, name: 'Super Ligue', flag: '🇳🇨', country: 'New-Caledonia' }
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
