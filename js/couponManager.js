// ===== GÜNLÜK KUPON YÖNETİMİ =====
// Her gün otomatik yeni kupon oluşturur

const COUPON_STORAGE_KEY = 'oa_daily_coupon';
const COUPON_DATE_KEY = 'oa_coupon_date';

// Günün tarihini YYYY-MM-DD formatında al
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Günlük kupon var mı kontrol et
function getDailyCoupon() {
  const savedDate = localStorage.getItem(COUPON_DATE_KEY);
  const today = getTodayString();
  
  if (savedDate !== today) {
    // Yeni gün - yeni kupon oluştur
    const newCoupon = generateDailyCouponData();
    localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(newCoupon));
    localStorage.setItem(COUPON_DATE_KEY, today);
    return newCoupon;
  }
  
  // Mevcut kuponu getir
  const saved = localStorage.getItem(COUPON_STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  
  // Yoksa yeni oluştur
  const newCoupon = generateDailyCouponData();
  localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(newCoupon));
  localStorage.setItem(COUPON_DATE_KEY, today);
  return newCoupon;
}

// Günlük kupon verisi oluştur
function generateDailyCouponData() {
  const src = AI_PREDICTIONS || [];
  const sorted = [...src]
    .filter(p => p.difficulty !== 'hard' || p.modelScore >= 80)
    .sort((a, b) => b.modelScore - a.modelScore)
    .slice(0, 3);

  const picks = sorted.map(p => {
    const bestKey = Object.entries(p.markets).reduce((a, b) => b[1].conf > a[1].conf ? b : a)[0];
    return { 
      ...p, 
      selectedMarket: p.markets[bestKey], 
      marketKey: bestKey,
      matchTime: getMatchTime(p.home, p.away),
      matchDate: getTodayString()
    };
  });

  const totalOdds = picks.reduce((acc, p) => acc * p.selectedMarket.odds, 1).toFixed(2);
  const avgConf = Math.round(picks.reduce((acc, p) => acc + p.selectedMarket.conf, 0) / picks.length);
  const combined = Math.round(picks.reduce((a, p) => a * p.selectedMarket.conf / 100, 1) * 100);

  return {
    date: getTodayString(),
    picks: picks,
    totalOdds: totalOdds,
    avgConf: avgConf,
    combined: combined,
    type: avgConf >= 75 ? 'Yüksek Güvenli' : 'Orta Güvenli'
  };
}

// Maç saatini bul
function getMatchTime(home, away) {
  const match = [...LIVE_MATCHES, ...UPCOMING_MATCHES].find(m => 
    m.home === home && m.away === away
  );
  return match ? (match.time || '20:00') : '20:00';
}

// ===== PREMİUM KUPON YÖNETİMİ =====
const PREMIUM_COUPON_KEY = 'oa_premium_coupon';
const PREMIUM_DATE_KEY = 'oa_premium_date';

function getPremiumCoupon() {
  const savedDate = localStorage.getItem(PREMIUM_DATE_KEY);
  const today = getTodayString();
  
  if (savedDate !== today) {
    const newCoupon = generatePremiumCouponData();
    localStorage.setItem(PREMIUM_COUPON_KEY, JSON.stringify(newCoupon));
    localStorage.setItem(PREMIUM_DATE_KEY, today);
    return newCoupon;
  }
  
  const saved = localStorage.getItem(PREMIUM_COUPON_KEY);
  if (saved) return JSON.parse(saved);
  
  const newCoupon = generatePremiumCouponData();
  localStorage.setItem(PREMIUM_COUPON_KEY, JSON.stringify(newCoupon));
  localStorage.setItem(PREMIUM_DATE_KEY, today);
  return newCoupon;
}

function generatePremiumCouponData() {
  const src = AI_PREDICTIONS || [];
  const top5 = [...src].sort((a, b) => b.modelScore - a.modelScore).slice(0, 5);
  
  const picks = top5.map(p => {
    const bestKey = p.bestPick || Object.entries(p.markets).reduce((a, b) => b[1].conf > a[1].conf ? b : a)[0];
    return {
      ...p,
      selectedMarket: p.markets[bestKey],
      marketKey: bestKey,
      matchTime: getMatchTime(p.home, p.away),
      matchDate: getTodayString()
    };
  });

  const totalOdds = picks.reduce((acc, p) => acc * p.selectedMarket.odds, 1).toFixed(2);
  
  return {
    date: getTodayString(),
    picks: picks,
    totalOdds: totalOdds,
    type: 'Premium'
  };
}

// ===== TUTAN ANALİZLER YÖNETİMİ =====
const SUCCESSFUL_PREDICTIONS_KEY = 'oa_successful_predictions';
const FINISHED_MATCHES_KEY = 'oa_finished_matches';

// Biten maçları kontrol et ve analiz sonuçlarını kaydet
function checkFinishedMatches() {
  const finished = JSON.parse(localStorage.getItem(FINISHED_MATCHES_KEY) || '[]');
  const successful = JSON.parse(localStorage.getItem(SUCCESSFUL_PREDICTIONS_KEY) || '[]');
  
  // Bugünün biten maçlarını simüle et (gerçek uygulamada API'den gelir)
  const today = getTodayString();
  const matchesToCheck = AI_PREDICTIONS.filter(p => {
    // Maç saati geçmişse bitmiş kabul et
    const matchTime = getMatchTime(p.home, p.away);
    const [hours, minutes] = matchTime.split(':').map(Number);
    const matchDateTime = new Date();
    matchDateTime.setHours(hours, minutes, 0, 0);
    return new Date() > matchDateTime;
  });
  
  matchesToCheck.forEach(prediction => {
    const alreadyChecked = finished.find(f => f.id === prediction.id && f.date === today);
    if (alreadyChecked) return;
    
    // Maç sonucunu simüle et (%70 tutma olasılığı)
    const isSuccess = Math.random() > 0.3;
    const actualResult = simulateMatchResult(prediction);
    
    const resultData = {
      id: prediction.id,
      date: today,
      league: prediction.league,
      flag: prediction.flag,
      home: prediction.home,
      away: prediction.away,
      prediction: prediction.markets[prediction.bestPick],
      isSuccess: isSuccess,
      actualResult: actualResult,
      modelScore: prediction.modelScore,
      checkedAt: new Date().toISOString()
    };
    
    finished.push(resultData);
    
    if (isSuccess) {
      successful.push(resultData);
    }
  });
  
  localStorage.setItem(FINISHED_MATCHES_KEY, JSON.stringify(finished));
  localStorage.setItem(SUCCESSFUL_PREDICTIONS_KEY, JSON.stringify(successful));
  
  return { finished, successful };
}

// Maç sonucunu simüle et
function simulateMatchResult(prediction) {
  const market = prediction.markets[prediction.bestPick];
  const outcomes = ['1', 'X', '2', 'Üst', 'Alt', 'Var', 'Yok'];
  
  // Tahminin tutma olasılığı model skoruna bağlı
  const successChance = prediction.modelScore / 100;
  
  if (Math.random() < successChance) {
    return market.pick;
  } else {
    // Rastgele farklı bir sonuç
    const otherOutcomes = outcomes.filter(o => o !== market.pick);
    return otherOutcomes[Math.floor(Math.random() * otherOutcomes.length)];
  }
}

// Tutan analizleri getir
function getSuccessfulPredictions() {
  return JSON.parse(localStorage.getItem(SUCCESSFUL_PREDICTIONS_KEY) || '[]');
}

// Tüm biten maçları getir
function getFinishedMatches() {
  return JSON.parse(localStorage.getItem(FINISHED_MATCHES_KEY) || '[]');
}

// Başarı istatistiklerini hesapla
function getSuccessStats() {
  const finished = getFinishedMatches();
  const successful = getSuccessfulPredictions();
  
  const today = getTodayString();
  const todayFinished = finished.filter(f => f.date === today);
  const todaySuccessful = successful.filter(f => f.date === today);
  
  return {
    totalFinished: finished.length,
    totalSuccessful: successful.length,
    successRate: finished.length > 0 ? Math.round((successful.length / finished.length) * 100) : 0,
    todayFinished: todayFinished.length,
    todaySuccessful: todaySuccessful.length,
    todayRate: todayFinished.length > 0 ? Math.round((todaySuccessful.length / todayFinished.length) * 100) : 0
  };
}

// ===== YZ ANALİZLERİNİ GÜNCELLE - ORANLAR VE SAATLER =====
// AI_PREDICTIONS'a oran ve saat bilgisi ekle
function enrichAIPredictions() {
  if (typeof AI_PREDICTIONS === 'undefined') return [];
  
  return AI_PREDICTIONS.map(pred => {
    const match = [...LIVE_MATCHES, ...UPCOMING_MATCHES].find(m => 
      m.home === pred.home && m.away === pred.away
    );
    
    if (match) {
      return {
        ...pred,
        matchTime: match.time || '20:00',
        matchOdds: match.odds || { h: '1.80', d: '3.40', a: '4.20' }
      };
    }
    return pred;
  });
}

// Zenginleştirilmiş tahminleri global değişkene ata
window.ENRICHED_AI_PREDICTIONS = enrichAIPredictions();
