// ===== MOCK DATA =====

const LIVE_MATCHES = [
  { id: 1, league: "Süper Lig", leagueKey: "sl", flag: "🇹🇷", home: "Galatasaray", away: "Fenerbahçe", score: "2-1", minute: "67", odds: { h: "1.45", d: "4.20", a: "6.50" }, trend: ["up", "", "down"] },
  { id: 2, league: "Süper Lig", leagueKey: "sl", flag: "🇹🇷", home: "Beşiktaş", away: "Trabzonspor", score: "0-0", minute: "34", odds: { h: "2.10", d: "3.30", a: "3.80" }, trend: ["", "up", ""] },
  { id: 3, league: "Premier Lig", leagueKey: "pl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", home: "Arsenal", away: "Man City", score: "1-1", minute: "78", odds: { h: "2.75", d: "3.10", a: "2.55" }, trend: ["up", "", "down"] },
  { id: 4, league: "Premier Lig", leagueKey: "pl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", home: "Liverpool", away: "Chelsea", score: "3-0", minute: "55", odds: { h: "1.25", d: "6.00", a: "10.0" }, trend: ["up", "down", "down"] },
  { id: 5, league: "La Liga", leagueKey: "ll", flag: "🇪🇸", home: "Real Madrid", away: "Barcelona", score: "1-2", minute: "82", odds: { h: "2.90", d: "3.40", a: "2.35" }, trend: ["down", "", "up"] },
  { id: 6, league: "La Liga", leagueKey: "ll", flag: "🇪🇸", home: "Atletico Madrid", away: "Sevilla", score: "0-1", minute: "41", odds: { h: "1.90", d: "3.50", a: "4.20" }, trend: ["", "up", ""] },
];

const UPCOMING_MATCHES = [
  { id: 10, league: "Süper Lig", leagueKey: "sl", flag: "🇹🇷", home: "Başakşehir", away: "Sivasspor", time: "Bugün 18:30", odds: { h: "1.80", d: "3.60", a: "4.50" }, trend: ["", "", ""] },
  { id: 11, league: "Süper Lig", leagueKey: "sl", flag: "🇹🇷", home: "Kasımpaşa", away: "Ankaragücü", time: "Bugün 20:45", odds: { h: "2.20", d: "3.20", a: "3.50" }, trend: ["", "", ""] },
  { id: 12, league: "Premier Lig", leagueKey: "pl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", home: "Man United", away: "Tottenham", time: "Yarın 14:00", odds: { h: "2.30", d: "3.40", a: "3.00" }, trend: ["", "", ""] },
  { id: 13, league: "Premier Lig", leagueKey: "pl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", home: "Newcastle", away: "Aston Villa", time: "Yarın 16:30", odds: { h: "2.10", d: "3.50", a: "3.40" }, trend: ["", "", ""] },
  { id: 14, league: "La Liga", leagueKey: "ll", flag: "🇪🇸", home: "Valencia", away: "Real Betis", time: "Yarın 19:00", odds: { h: "2.50", d: "3.20", a: "2.90" }, trend: ["", "", ""] },
  { id: 15, league: "Bundesliga", leagueKey: "bl", flag: "🇩🇪", home: "Bayern Münih", away: "Dortmund", time: "02 Nis 20:30", odds: { h: "1.65", d: "4.00", a: "5.50" }, trend: ["", "", ""] },
];

const ODDS_DATA = [
  { league: "Süper Lig", leagueKey: "sl", home: "Galatasaray", away: "Fenerbahçe", o1: "1.45", ox: "4.20", o2: "6.50", alt: "1.85", ust: "1.95", analysis: "Ev sahibi favorisi", badge: "badge-green" },
  { league: "Süper Lig", leagueKey: "sl", home: "Beşiktaş", away: "Trabzonspor", o1: "2.10", ox: "3.30", o2: "3.80", alt: "2.10", ust: "1.72", analysis: "Karşılaşılmış güç", badge: "badge-yellow" },
  { league: "Premier Lig", leagueKey: "pl", home: "Arsenal", away: "Man City", o1: "2.75", ox: "3.10", o2: "2.55", alt: "2.30", ust: "1.60", analysis: "Açık maç", badge: "badge-blue" },
  { league: "Premier Lig", leagueKey: "pl", home: "Liverpool", away: "Chelsea", o1: "1.25", ox: "6.00", o2: "10.0", alt: "2.00", ust: "1.80", analysis: "Kesin ev sahibi", badge: "badge-green" },
  { league: "La Liga", leagueKey: "ll", home: "Real Madrid", away: "Barcelona", o1: "2.90", ox: "3.40", o2: "2.35", alt: "2.20", ust: "1.65", analysis: "Misafir favorisi", badge: "badge-red" },
  { league: "La Liga", leagueKey: "ll", home: "Atletico Madrid", away: "Sevilla", o1: "1.90", ox: "3.50", o2: "4.20", alt: "1.95", ust: "1.85", analysis: "Az gol bekleniyor", badge: "badge-yellow" },
  { league: "Bundesliga", leagueKey: "bl", home: "Bayern Münih", away: "Dortmund", o1: "1.65", ox: "4.00", o2: "5.50", alt: "1.75", ust: "2.05", analysis: "Ev sahibi favorisi", badge: "badge-green" },
  { league: "Süper Lig", leagueKey: "sl", home: "Başakşehir", away: "Sivasspor", o1: "1.80", ox: "3.60", o2: "4.50", alt: "1.85", ust: "1.95", analysis: "Ev sahibi avantajlı", badge: "badge-green" },
];

// ===== YZ TAHMİN VERİLERİ (GENİŞLETİLMİŞ) =====
// difficulty: "easy" (yeşil), "medium" (sarı), "hard" (kırmızı)
const AI_PREDICTIONS = [
  {
    id: 1, league: "Süper Lig", leagueKey: "sl", flag: "🇹🇷",
    home: "Galatasaray", away: "Fenerbahçe",
    difficulty: "medium",
    modelScore: 82,
    markets: {
      result:   { pick: "1",    label: "MS Ev Kazanır",    conf: 62, odds: 1.45 },
      ou:       { pick: "Üst",  label: "Üst 2.5 Gol",      conf: 71, odds: 1.80 },
      btts:     { pick: "Var",  label: "KG Var",            conf: 68, odds: 1.75 },
      ht:       { pick: "İY 1", label: "İY Ev Önde",        conf: 54, odds: 1.90 },
      htft:     { pick: "1/1",  label: "İY 1 / MS 1",      conf: 49, odds: 2.60 },
    },
    bestPick: "ou",
    reason: "Galatasaray son 5 ev maçında 4 galip, maç başına 2.8 gol ortalaması var. Fenerbahçe savunması deplasmanda zayıf."
  },
  {
    id: 2, league: "Süper Lig", leagueKey: "sl", flag: "🇹🇷",
    home: "Beşiktaş", away: "Trabzonspor",
    difficulty: "hard",
    modelScore: 47,
    markets: {
      result:   { pick: "X",    label: "MS Beraberlik",     conf: 38, odds: 3.30 },
      ou:       { pick: "Alt",  label: "Alt 2.5 Gol",       conf: 52, odds: 1.85 },
      btts:     { pick: "Yok",  label: "KG Yok",            conf: 48, odds: 1.90 },
      ht:       { pick: "İY X", label: "İY Beraberlik",     conf: 44, odds: 2.10 },
      htft:     { pick: "X/X",  label: "İY X / MS X",      conf: 31, odds: 5.50 },
    },
    bestPick: "ou",
    reason: "İki takım da son dönemde tutarsız form. Geçen 3 karşılaşma berabere bitti, gol ortalaması düşük."
  },
  {
    id: 3, league: "Premier Lig", leagueKey: "pl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    home: "Arsenal", away: "Man City",
    difficulty: "hard",
    modelScore: 51,
    markets: {
      result:   { pick: "2",    label: "MS Deplasman",      conf: 38, odds: 2.55 },
      ou:       { pick: "Üst",  label: "Üst 2.5 Gol",      conf: 66, odds: 1.72 },
      btts:     { pick: "Var",  label: "KG Var",            conf: 74, odds: 1.65 },
      ht:       { pick: "İY X", label: "İY Beraberlik",     conf: 55, odds: 2.00 },
      htft:     { pick: "X/2",  label: "İY X / MS 2",      conf: 42, odds: 3.80 },
    },
    bestPick: "btts",
    reason: "Her iki takım da çok gol atan yapıda. KG Var oranı son 8 karşılaşmada 7 kez gerçekleşti."
  },
  {
    id: 4, league: "Premier Lig", leagueKey: "pl", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    home: "Liverpool", away: "Chelsea",
    difficulty: "easy",
    modelScore: 91,
    markets: {
      result:   { pick: "1",    label: "MS Ev Kazanır",    conf: 74, odds: 1.25 },
      ou:       { pick: "Üst",  label: "Üst 2.5 Gol",     conf: 78, odds: 1.68 },
      btts:     { pick: "Var",  label: "KG Var",           conf: 65, odds: 1.72 },
      ht:       { pick: "İY 1", label: "İY Ev Önde",       conf: 69, odds: 1.80 },
      htft:     { pick: "1/1",  label: "İY 1 / MS 1",     conf: 63, odds: 1.95 },
    },
    bestPick: "ou",
    reason: "Liverpool Anfield'da son 12 maçta 11 galibiyet. Chelsea deplasmanda 2.4 gol yiyor. Üst kesinlikle güçlü."
  },
  {
    id: 5, league: "La Liga", leagueKey: "ll", flag: "🇪🇸",
    home: "Real Madrid", away: "Barcelona",
    difficulty: "hard",
    modelScore: 44,
    markets: {
      result:   { pick: "2",    label: "MS Deplasman",     conf: 46, odds: 2.35 },
      ou:       { pick: "Üst",  label: "Üst 2.5 Gol",     conf: 72, odds: 1.70 },
      btts:     { pick: "Var",  label: "KG Var",           conf: 78, odds: 1.60 },
      ht:       { pick: "İY X", label: "İY Beraberlik",    conf: 50, odds: 2.05 },
      htft:     { pick: "X/2",  label: "İY X / MS 2",     conf: 38, odds: 4.20 },
    },
    bestPick: "btts",
    reason: "El Clasico'da son 6 maçta KG Var 5 kez gerçekleşti. İki takım da çok gol atan yapıda."
  },
  {
    id: 6, league: "La Liga", leagueKey: "ll", flag: "🇪🇸",
    home: "Atletico Madrid", away: "Sevilla",
    difficulty: "easy",
    modelScore: 83,
    markets: {
      result:   { pick: "1",    label: "MS Ev Kazanır",    conf: 55, odds: 1.90 },
      ou:       { pick: "Alt",  label: "Alt 2.5 Gol",      conf: 76, odds: 1.80 },
      btts:     { pick: "Yok",  label: "KG Yok",           conf: 69, odds: 1.85 },
      ht:       { pick: "İY 1", label: "İY Ev Önde",       conf: 58, odds: 2.10 },
      htft:     { pick: "1/1",  label: "İY 1 / MS 1",     conf: 47, odds: 3.00 },
    },
    bestPick: "ou",
    reason: "Atletico Madrid defansif baskı taktiğiyle oynuyor. Son 6 iç saha maçında 5 kez Alt 2.5 gerçekleşti."
  },
  {
    id: 7, league: "Bundesliga", leagueKey: "bl", flag: "🇩🇪",
    home: "Bayern Münih", away: "Dortmund",
    difficulty: "easy",
    modelScore: 88,
    markets: {
      result:   { pick: "1",    label: "MS Ev Kazanır",    conf: 68, odds: 1.65 },
      ou:       { pick: "Üst",  label: "Üst 2.5 Gol",     conf: 85, odds: 1.55 },
      btts:     { pick: "Var",  label: "KG Var",           conf: 80, odds: 1.62 },
      ht:       { pick: "İY 1", label: "İY Ev Önde",       conf: 64, odds: 1.85 },
      htft:     { pick: "1/1",  label: "İY 1 / MS 1",     conf: 56, odds: 2.20 },
    },
    bestPick: "ou",
    reason: "Bayern-Dortmund karşılaşmaları tarihsel olarak golcü. Son 8 Der Klassiker'de 7 kez Üst 2.5 gerçekleşti."
  },
  {
    id: 8, league: "Süper Lig", leagueKey: "sl", flag: "🇹🇷",
    home: "Başakşehir", away: "Sivasspor",
    difficulty: "medium",
    modelScore: 64,
    markets: {
      result:   { pick: "1",    label: "MS Ev Kazanır",    conf: 48, odds: 1.80 },
      ou:       { pick: "Alt",  label: "Alt 2.5 Gol",      conf: 60, odds: 1.88 },
      btts:     { pick: "Yok",  label: "KG Yok",           conf: 57, odds: 1.92 },
      ht:       { pick: "İY X", label: "İY Beraberlik",    conf: 52, odds: 2.15 },
      htft:     { pick: "X/1",  label: "İY X / MS 1",     conf: 41, odds: 3.20 },
    },
    bestPick: "btts",
    reason: "Başakşehir iç sahada iyi form ancak Sivasspor savunması sağlam. Az gol beklentisi ağır basıyor."
  },
];

// ===== PLATFORM ORAN KIYASLAMA =====
const COMPARE_DATA = [
  {
    league: "Süper Lig", leagueKey: "sl", home: "Galatasaray", away: "Fenerbahçe",
    nesine:   { h: "1.45", d: "4.20", a: "6.50" },
    bilyoner: { h: "1.48", d: "4.10", a: "6.30" },
    misli:    { h: "1.50", d: "4.00", a: "6.00" },
    bets10:   { h: "1.43", d: "4.25", a: "6.75" },
  },
  {
    league: "Süper Lig", leagueKey: "sl", home: "Beşiktaş", away: "Trabzonspor",
    nesine:   { h: "2.10", d: "3.30", a: "3.80" },
    bilyoner: { h: "2.15", d: "3.25", a: "3.70" },
    misli:    { h: "2.08", d: "3.35", a: "3.85" },
    bets10:   { h: "2.12", d: "3.28", a: "3.75" },
  },
  {
    league: "Premier Lig", leagueKey: "pl", home: "Arsenal", away: "Man City",
    nesine:   { h: "2.75", d: "3.10", a: "2.55" },
    bilyoner: { h: "2.80", d: "3.05", a: "2.50" },
    misli:    { h: "2.70", d: "3.15", a: "2.60" },
    bets10:   { h: "2.85", d: "3.00", a: "2.48" },
  },
  {
    league: "Premier Lig", leagueKey: "pl", home: "Liverpool", away: "Chelsea",
    nesine:   { h: "1.25", d: "6.00", a: "10.00" },
    bilyoner: { h: "1.28", d: "5.80", a: "9.50" },
    misli:    { h: "1.22", d: "6.20", a: "10.50" },
    bets10:   { h: "1.26", d: "5.90", a: "9.80" },
  },
  {
    league: "La Liga", leagueKey: "ll", home: "Real Madrid", away: "Barcelona",
    nesine:   { h: "2.90", d: "3.40", a: "2.35" },
    bilyoner: { h: "2.85", d: "3.45", a: "2.40" },
    misli:    { h: "2.95", d: "3.35", a: "2.30" },
    bets10:   { h: "2.88", d: "3.42", a: "2.38" },
  },
  {
    league: "La Liga", leagueKey: "ll", home: "Atletico Madrid", away: "Sevilla",
    nesine:   { h: "1.90", d: "3.50", a: "4.20" },
    bilyoner: { h: "1.88", d: "3.55", a: "4.30" },
    misli:    { h: "1.93", d: "3.45", a: "4.10" },
    bets10:   { h: "1.91", d: "3.52", a: "4.25" },
  },
  {
    league: "Bundesliga", leagueKey: "bl", home: "Bayern Münih", away: "Dortmund",
    nesine:   { h: "1.65", d: "4.00", a: "5.50" },
    bilyoner: { h: "1.68", d: "3.90", a: "5.30" },
    misli:    { h: "1.62", d: "4.10", a: "5.70" },
    bets10:   { h: "1.66", d: "3.95", a: "5.40" },
  },
  {
    league: "Süper Lig", leagueKey: "sl", home: "Başakşehir", away: "Sivasspor",
    nesine:   { h: "1.80", d: "3.60", a: "4.50" },
    bilyoner: { h: "1.83", d: "3.55", a: "4.40" },
    misli:    { h: "1.78", d: "3.65", a: "4.60" },
    bets10:   { h: "1.81", d: "3.58", a: "4.45" },
  },
];
