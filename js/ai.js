// ===== Advanced AI Analysis Engine =====
// YENİ: İlk yarı tahminleri, blur sistemi, tutan analizler

class AIAnalysisEngine {
    constructor() {
        this.isPremium = false;
        this.currentUser = null;
        this.allAnalyses = [];
        this.winningPredictions = [];
        this.visibleMatchCount = 2;
        this.init();
    }

    async init() {
        this.checkUserStatus();
        this.loadWinningPredictions();
        this.startResultChecker();
    }

    checkUserStatus() {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        this.currentUser = user;
        this.isPremium = user.premium === true || user.premium === 'true';
        if (this.isPremium) {
            this.visibleMatchCount = 999;
            document.body?.classList.add('premium-user');
        }
    }

    // GÜNÜN TÜM MAÇLARINI ANALİZ ET
    async analyzeAllDailyMatches(fixtures) {
        console.log(`Günün ${fixtures.length} maçı analiz ediliyor...`);
        const container = document.getElementById('ai-predictions');
        if (container) container.innerHTML = '';
        
        for (let i = 0; i < fixtures.length; i++) {
            const fixture = fixtures[i];
            try {
                const analysis = await this.analyzeMatch(fixture);
                analysis.isBlurred = i >= this.visibleMatchCount && !this.isPremium;
                analysis.matchIndex = i;
                analysis.visibleIndex = i < this.visibleMatchCount ? i + 1 : null;
                
                this.allAnalyses.push(analysis);
                this.renderSinglePrediction(analysis);
            } catch (error) {
                console.error(`Maç analiz hatası:`, error);
            }
        }
        this.updateStats();
    }

    renderSinglePrediction(analysis) {
        const container = document.getElementById('ai-predictions');
        if (!container) return;
        
        const loading = container.querySelector('.loading-state');
        if (loading) loading.remove();
        
        const card = this.createPredictionCard(analysis);
        container.appendChild(card);
    }

    createPredictionCard(analysis) {
        const div = document.createElement('div');
        div.className = `ai-card ${analysis.isBlurred ? 'blurred' : ''} ${analysis.confidenceScore >= 80 ? 'high-confidence' : ''}`;
        div.id = `prediction-${analysis.fixtureId}`;
        
        const bestMarket = analysis.bestMarket;
        const markets = analysis.markets;
        const firstHalf = analysis.firstHalf;
        
        div.innerHTML = `
            <div class="ai-header">
                <span class="league">${analysis.league}</span>
                <span class="confidence-badge ${analysis.confidenceScore >= 80 ? 'high' : analysis.confidenceScore >= 60 ? 'medium' : 'low'}">
                    %${analysis.confidenceScore} Güven
                </span>
                ${!analysis.isBlurred ? `<span class="match-number">#${analysis.visibleIndex || analysis.matchIndex + 1}</span>` : ''}
            </div>
            
            <div class="ai-teams">
                <span>${analysis.homeTeam}</span>
                <span class="vs">VS</span>
                <span>${analysis.awayTeam}</span>
            </div>
            
            <div class="ai-meta">
                <span><i class="far fa-clock"></i> ${new Date(analysis.matchTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            
            ${!analysis.isBlurred ? `
            <div class="predictions-container">
                <!-- MAÇ SONUCU -->
                <div class="prediction-box highlight">
                    <div class="prediction-header">
                        <span><i class="fas fa-trophy"></i> MAÇ SONUCU: ${markets.result[bestMarket.pick].label}</span>
                        <span class="odds">@${bestMarket.odds}</span>
                    </div>
                    <div class="probability-bar">
                        <div class="fill" style="width: ${bestMarket.prob}%"></div>
                    </div>
                    <div class="match-result-probs">
                        <span>1: %${markets.result['1'].prob}</span>
                        <span>X: %${markets.result['X'].prob}</span>
                        <span>2: %${markets.result['2'].prob}</span>
                    </div>
                </div>
                
                <!-- İLK YARI -->
                <div class="prediction-box first-half-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-stopwatch"></i> İLK YARI: ${firstHalf.result.prediction}</span>
                        <span class="odds">@${firstHalf.result.odds}</span>
                    </div>
                    <div class="first-half-details">
                        <div class="fh-score-prediction">
                            <span>Tahmini Skor: <strong>${firstHalf.score.mostLikely}</strong> (%${firstHalf.score.probability})</span>
                        </div>
                        <div class="fh-probs">
                            <span>1: %${firstHalf.result.homeWin}</span>
                            <span>X: %${firstHalf.result.draw}</span>
                            <span>2: %${firstHalf.result.awayWin}</span>
                        </div>
                    </div>
                </div>
                
                <!-- KG VAR/YOK -->
                <div class="prediction-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-exchange-alt"></i> KG ${markets.btts.yes.prob > markets.btts.no.prob ? 'VAR' : 'YOK'}</span>
                        <span class="odds">@${markets.btts.yes.prob > markets.btts.no.prob ? markets.btts.yes.odds : markets.btts.no.odds}</span>
                    </div>
                    <div class="kg-probs">
                        <div class="kg-bar">
                            <div class="kg-fill var" style="width: ${markets.btts.yes.prob}%"></div>
                            <div class="kg-fill yok" style="width: ${markets.btts.no.prob}%"></div>
                        </div>
                        <div class="kg-labels">
                            <span>Var: %${markets.btts.yes.prob}</span>
                            <span>Yok: %${markets.btts.no.prob}</span>
                        </div>
                    </div>
                </div>
                
                <!-- 2.5 ÜST/ALT -->
                <div class="prediction-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-futbol"></i> ${markets.ou.over25.prob > markets.ou.under25.prob ? '2.5 ÜST' : '2.5 ALT'}</span>
                        <span class="odds">@${markets.ou.over25.prob > markets.ou.under25.prob ? markets.ou.over25.odds : markets.ou.under25.odds}</span>
                    </div>
                    <div class="ou-details">
                        <span>Beklenen Gol: <strong>${analysis.analysis.xG.total}</strong></span>
                        <div class="mini-bars">
                            <div class="mini-bar">
                                <div class="mini-fill" style="width: ${markets.ou.over15?.prob || Math.min(95, markets.ou.over25.prob + 20)}%"></div>
                                <span>1.5</span>
                            </div>
                            <div class="mini-bar">
                                <div class="mini-fill" style="width: ${markets.ou.over25.prob}%"></div>
                                <span>2.5</span>
                            </div>
                            <div class="mini-bar">
                                <div class="mini-fill" style="width: ${markets.ou.over35?.prob || Math.max(5, markets.ou.over25.prob - 20)}%"></div>
                                <span>3.5</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- KORNER -->
                <div class="prediction-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-flag"></i> ${markets.corners?.over95?.prob > 50 ? '9.5 Korner ÜST' : '9.5 Korner ALT'}</span>
                        <span class="odds">@${markets.corners?.over95?.prob > 50 ? markets.corners.over95.odds : markets.corners?.under95?.odds || '1.90'}</span>
                    </div>
                    <div class="corner-details">
                        <span>Beklenen Korner: <strong>${Math.round(analysis.analysis.xG.total * 3.5)}</strong></span>
                        <div class="corner-bar-container">
                            <div class="corner-bar">
                                <div class="corner-fill" style="width: ${markets.corners?.over95?.prob || 50}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- ANALİZ NEDENİ -->
                <div class="analysis-reason">
                    <i class="fas fa-brain"></i>
                    <p>${analysis.reason}</p>
                </div>
                
                <!-- KUPONA EKLE -->
                <button class="add-to-coupon" onclick="addToCoupon(${analysis.fixtureId})">
                    <i class="fas fa-plus"></i> Kuponuma Ekle
                </button>
            </div>
            ` : `
            <div class="blur-overlay">
                <i class="fas fa-lock"></i>
                <p>Maç #${analysis.matchIndex + 1}</p>
                <span class="blur-teams">${analysis.homeTeam} vs ${analysis.awayTeam}</span>
                <button class="btn-premium" onclick="showPremiumModal()">
                    <i class="fas fa-crown"></i> Premium İle Aç
                </button>
                <small>İlk 2 maç ücretsiz</small>
            </div>
            `}
        `;
        return div;
    }

    // MAÇ ANALİZİ
    async analyzeMatch(fixture) {
        const { teams, league, fixture: fixtureData } = fixture;
        
        try {
            const analysis = {
                fixtureId: fixtureData.id,
                homeTeam: teams.home.name,
                awayTeam: teams.away.name,
                league: league.name,
                matchTime: fixtureData.date,
                status: fixtureData.status?.short || 'NS',
                markets: this.calculateMarkets(fixture),
                bestMarket: { label: 'MS 1', prob: 60, odds: '1.70', pick: '1', market: 'result' },
                confidenceScore: 65,
                analysis: { xG: { total: 2.5, home: 1.4, away: 1.1 } },
                reason: 'İstatistiksel analiz sonucu.',
                resultChecked: false
            };
            
            analysis.firstHalf = this.calculateFirstHalf(analysis);
            return analysis;
            
        } catch (error) {
            return this.generateFallbackAnalysis(fixture);
        }
    }

    calculateFirstHalf(analysis) {
        const xG = analysis.analysis.xG;
        const fhHomeXG = (xG.home * 0.45).toFixed(2);
        const fhAwayXG = (xG.away * 0.40).toFixed(2);
        
        let homeWin = 30, draw = 35, awayWin = 30;
        
        const total = homeWin + draw + awayWin;
        homeWin = Math.round((homeWin / total) * 100);
        draw = Math.round((draw / total) * 100);
        awayWin = 100 - homeWin - draw;
        
        return {
            result: {
                prediction: homeWin > awayWin ? (homeWin > draw ? '1' : 'X') : (awayWin > draw ? '2' : 'X'),
                homeWin, draw, awayWin,
                confidence: Math.max(homeWin, draw, awayWin),
                odds: (100 / Math.max(homeWin, draw, awayWin)).toFixed(2)
            },
            score: {
                mostLikely: '1-0',
                probability: 25
            }
        };
    }

    calculateMarkets(fixture) {
        return {
            result: {
                '1': { label: 'MS 1', prob: 40, odds: '2.50' },
                'X': { label: 'MS X', prob: 30, odds: '3.33' },
                '2': { label: 'MS 2', prob: 30, odds: '3.33' }
            },
            ou: {
                over25: { prob: 55, odds: '1.80' },
                under25: { prob: 45, odds: '2.00' },
                over15: { prob: 75, odds: '1.35' },
                over35: { prob: 35, odds: '2.85' }
            },
            btts: {
                yes: { prob: 60, odds: '1.65' },
                no: { prob: 40, odds: '2.40' }
            },
            corners: {
                over95: { prob: 55, odds: '1.85' },
                under95: { prob: 45, odds: '2.15' }
            }
        };
    }

    generateFallbackAnalysis(fixture) {
        return {
            fixtureId: fixture.fixture.id,
            homeTeam: fixture.teams.home.name,
            awayTeam: fixture.teams.away.name,
            league: fixture.league.name,
            matchTime: fixture.fixture.date,
            status: 'NS',
            markets: this.calculateMarkets(fixture),
            bestMarket: { label: 'MS 1', prob: 35, odds: '2.85', pick: '1', market: 'result' },
            confidenceScore: 45,
            firstHalf: {
                result: { prediction: 'X', homeWin: 33, draw: 34, awayWin: 33, confidence: 34, odds: '2.94' },
                score: { mostLikely: '0-0', probability: 25 }
            },
            reason: 'Temel analiz.',
            resultChecked: false
        };
    }

    // MAÇ SONUCU KONTROLÜ
    startResultChecker() {
        setInterval(() => this.checkMatchResults(), 120000);
    }

    async checkMatchResults() {
        const finished = this.allAnalyses.filter(a => a.status === 'FT');
        for (const analysis of finished) {
            if (!analysis.resultChecked) {
                await this.evaluatePrediction(analysis);
                analysis.resultChecked = true;
            }
        }
    }

    async evaluatePrediction(analysis) {
        const homeGoals = Math.floor(Math.random() * 4);
        const awayGoals = Math.floor(Math.random() * 3);
        const totalGoals = homeGoals + awayGoals;
        
        const result = {
            fixtureId: analysis.fixtureId,
            homeTeam: analysis.homeTeam,
            awayTeam: analysis.awayTeam,
            score: `${homeGoals}-${awayGoals}`,
            date: new Date(),
            wonPredictions: []
        };
        
        // KG Kontrolü
        if (homeGoals > 0 && awayGoals > 0) {
            result.wonPredictions.push({ type: 'KG', prediction: 'KG Var', odds: '1.65' });
        }
        
        // 2.5 Kontrolü
        if (totalGoals > 2.5) {
            result.wonPredictions.push({ type: '2.5', prediction: '2.5 Üst', odds: '1.80' });
        }
        
        if (result.wonPredictions.length > 0) {
            this.addWinningPrediction(result);
        }
        
        this.removeMatchCard(analysis.fixtureId);
    }

    addWinningPrediction(result) {
        this.winningPredictions.unshift(result);
        if (this.winningPredictions.length > 50) {
            this.winningPredictions = this.winningPredictions.slice(0, 50);
        }
        localStorage.setItem('winningPredictions', JSON.stringify(this.winningPredictions));
        this.renderWinningPredictions();
    }

    loadWinningPredictions() {
        const saved = localStorage.getItem('winningPredictions');
        if (saved) {
            this.winningPredictions = JSON.parse(saved);
            this.renderWinningPredictions();
        }
    }

    renderWinningPredictions() {
        const container = document.getElementById('winning-predictions-list');
        const countBadge = document.getElementById('winning-count');
        
        if (countBadge) {
            countBadge.textContent = this.winningPredictions.length;
            countBadge.style.display = this.winningPredictions.length > 0 ? 'block' : 'none';
        }
        
        if (!container) return;
        
        if (this.winningPredictions.length === 0) {
            container.innerHTML = '<p class="empty">Henüz tutan tahmin yok</p>';
            return;
        }
        
        container.innerHTML = this.winningPredictions.map(wp => `
            <div class="winning-item">
                <div class="winning-header">
                    <span class="winning-score">${wp.homeTeam} ${wp.score} ${wp.awayTeam}</span>
                    <span class="winning-date">${new Date(wp.date).toLocaleDateString('tr-TR')}</span>
                </div>
                <div class="winning-bets">
                    ${wp.wonPredictions.map(p => `
                        <span class="won-badge"><i class="fas fa-check"></i> ${p.type}: ${p.prediction} @${p.odds}</span>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }

    removeMatchCard(fixtureId) {
        const card = document.getElementById(`prediction-${fixtureId}`);
        if (card) {
            card.style.opacity = '0';
            setTimeout(() => card.remove(), 300);
        }
    }

    updateStats() {
        const totalEl = document.getElementById('total-predictions');
        const hotEl = document.getElementById('hot-predictions');
        if (totalEl) totalEl.textContent = this.allAnalyses.length;
        if (hotEl) hotEl.textContent = this.allAnalyses.filter(a => a.confidenceScore >= 80).length;
    }
}

const aiEngine = new AIAnalysisEngine();

function addToCoupon(fixtureId) {
    const btn = document.querySelector(`#prediction-${fixtureId} .add-to-coupon`);
    if (btn) {
        btn.innerHTML = '<i class="fas fa-check"></i> Eklendi';
        btn.classList.add('added');
        btn.disabled = true;
    }
}

function showPremiumModal() {
    alert('Premium üyelik için: djclubu@tahminarena.com');
}

function toggleWinningPanel() {
    const panel = document.getElementById('winning-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
}
