// ===== Coupon Manager - Helper Functions =====
// Additional coupon utilities

class CouponManager {
  constructor() {
    this.couponKey = STORAGE_KEYS.USER_COUPON;
  }

  // Get coupon from storage
  getCoupon() {
    const saved = localStorage.getItem(this.couponKey);
    return saved ? JSON.parse(saved) : [];
  }

  // Save coupon to storage
  saveCoupon(coupon) {
    localStorage.setItem(this.couponKey, JSON.stringify(coupon));
  }

  // Add match to coupon
  addMatch(matchData) {
    const coupon = this.getCoupon();
    
    // Check if already exists
    if (coupon.some(c => c.fixtureId === matchData.fixtureId)) {
      return { success: false, error: 'Bu maç zaten kuponunuzda!' };
    }

    coupon.push({
      ...matchData,
      addedAt: new Date().toISOString()
    });

    this.saveCoupon(coupon);
    return { success: true, message: 'Maç kuponunuza eklendi.' };
  }

  // Remove match from coupon
  removeMatch(fixtureId) {
    let coupon = this.getCoupon();
    coupon = coupon.filter(c => c.fixtureId !== fixtureId);
    this.saveCoupon(coupon);
    return { success: true };
  }

  // Check if match is in coupon
  isInCoupon(fixtureId) {
    const coupon = this.getCoupon();
    return coupon.some(c => c.fixtureId === fixtureId);
  }

  // Clear coupon
  clearCoupon() {
    localStorage.removeItem(this.couponKey);
  }

  // Get coupon statistics
  getStats() {
    const coupon = this.getCoupon();
    const totalOdds = coupon.reduce((acc, c) => acc * (c.odds || 1.5), 1);
    
    return {
      count: coupon.length,
      totalOdds: totalOdds.toFixed(2),
      potentialWin: (totalOdds * 100).toFixed(2)
    };
  }

  // Export coupon as text
  exportAsText() {
    const coupon = this.getCoupon();
    if (coupon.length === 0) return 'Kupon boş.';

    let text = '🎫 TahminArena Kuponu\n';
    text += '==================\n\n';
    
    coupon.forEach((match, index) => {
      text += `${index + 1}. ${match.homeTeam} vs ${match.awayTeam}\n`;
      text += `   Tahmin: ${match.selectedPrediction?.label || '-'}\n`;
      text += `   Oran: @${match.selectedPrediction?.odds || '-'}\n\n`;
    });

    const stats = this.getStats();
    text += `==================\n`;
    text += `Toplam Oran: ${stats.totalOdds}x\n`;
    text += `Maç Sayısı: ${stats.count}\n`;

    return text;
  }
}

// Create global instance
const couponManager = new CouponManager();
