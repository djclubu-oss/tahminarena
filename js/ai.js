// ai.js BAŞINA EKLEYİN - Hata ayıklama için
console.log('AI Engine yüklendi');
console.log('apiService var mı?', typeof apiService);
console.log('apiService.getFixtures var mı?', typeof apiService?.getFixtures);// ai.js - Mevcut apiService ile çalışan AI analiz motoru

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

    // GÜNÜN MAÇLARINI API'DEN ÇEK VE ANALİZ ET
    async analyzeAllDailyMatches() {
        const container = document.getElementById('ai-predictions');
        if (!container) return;
        
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>API'den maçlar çekiliyor...</p>
            </div>
        `;
        
        try {
            // MEVCUT apiService'i KULLAN
            const today = new Date().toISOString().split('T')[0];
            const data = await apiService.getFixtures(today);
            const fixtures = data.response || [];
            
            if (fixtures.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-calendar-times"></i>
                        <p>Bugün için maç bulunamadı.</p>
                    </div>
                `;
                return;
            }
            
            // Limit: Normal üye 2 maç, Premium tümü
            const limit = this.isPremium ? fixtures.length : Math.min(2, fixtures.length);
            const visibleFixtures = fixtures.slice(0, limit);
            const blurredFixtures = this.isPremium ? [] : fixtures.slice(2);
            
            container.innerHTML = '';
            this.allAnalyses = [];
            
            // Görünür maçları analiz et
            for (let i = 0; i < visibleFixtures.length; i++) {
                const fixture = visibleFixtures[i];
                const analysis = await this.analyzeMatchReal(fixture);
                analysis.isBlurred = false;
                analysis.visibleIndex = i + 1;
                this.allAnalyses.push(analysis);
                this.renderSinglePrediction(analysis);
            }
            
            // Blur maçları göster (sadece isim)
            for (let i = 0; i < blurredFixtures.length; i++) {
                const fixture = blurredFixtures[i];
                const analysis = await this.analyzeMatchReal(fixture);
                analysis.isBlurred = true;
                analysis.matchIndex = i + 3;
                this.allAnalyses.push(analysis);
                this.renderSinglePrediction(analysis);
            }
            
            this.updateStats();
            
        } catch (error) {
            console.error('API Hatası:', error);
            container.innerHTML = `
                <div class="empty-state error">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>API'den veri çekilemedi.</p>
                    <small>${error.message}</small>
                    <button class="btn-retry" onclick="aiEngine.analyzeAllDailyMatches()" style="margin-top: 16px; padding: 10px 24px; background: var(--accent); color: #000; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-redo"></i> Yeniden Dene
                    </button>
                </div>
            `;
        }
    }

    // GERÇEK API VERİLERİYLE ANALİZ - Mevcut apiService kullanılıyor
    async analyzeMatchReal(fixture) {
        const { teams, league, fixture: fixtureData } = fixture;
        
        try {
            // Tüm verileri paralel çek - mevcut apiService metodları
            const [
                homeStats,
                awayStats,
                homeLastMatches,
                awayLastMatches,
                h2h,
                homeInjuries,
                awayInjuries,
                standings
            ] = await Promise.all([
                apiService.getTeamStatistics(teams.home.id, league.id).catch(() => ({response: null})),
                apiService.getTeamStatistics(teams.away.id, league.id).catch(() => ({response: null})),
                apiService.getTeamLastMatches(teams.home.id, 10).catch(() => ({response: []})),
                apiService.getTeamLastMatches(teams.away.id, 10).catch(() => ({response: []})),
                apiService.getHeadToHead(teams.home.id, teams.away.id).catch(() => ({response: []})),
                apiService.getInjuries(teams.home.id).catch(() => ({response: []})),
                apiService.getInjuries(teams.away.id).catch(() => ({response: []})),
                apiService.getStandings(league.id).catch(() => ({response: []}))
            ]);

            // Analiz hesapla
            const xGAnalysis = this.calculateXG(homeStats.response, awayStats.response);
            const formAnalysis = this.calculateForm(homeLastMatches.response, awayLastMatches.response);
            const homeAdvantage = this.calculateHomeAdvantage(homeStats.response, awayStats.response);
            const injuryImpact = this.calculateInjuryImpact(homeInjuries.response, awayInjuries.response);
            const h2hAnalysis = this.calculateH2H(h2h.response);
            const standingsAnalysis = this.calculateStandingsImpact(standings.response, teams.home.id, teams.away.id);
            
            const markets = this.calculateMarkets({
                xG: xGAnalysis,
                form: formAnalysis,
                homeAdvantage,
                injuries: injuryImpact,
                h2h: h2hAnalysis,
                standings: standingsAnalysis
            });
            
            const bestMarket = this.findBestMarket(markets);
            const confidenceScore = this.calculateConfidenceScore({
                xG: xGAnalysis, form: formAnalysis, h2h: h2hAnalysis, standings: standingsAnalysis
            });
            
            const reason = this.generateReason({
                bestMarket, homeTeam: teams.home.name, awayTeam: teams.away.name,
                xG: xGAnalysis, form: formAnalysis, h2h: h2hAnalysis, standings: standingsAnalysis
            });

            const analysis = {
                fixtureId: fixtureData.id,
                homeTeam: teams.home.name,
                awayTeam: teams.away.name,
                league: league.name,
                matchTime: fixtureData.date,
                status: fixtureData.status?.short || 'NS',
                markets,
                bestMarket,
                confidenceScore,
                analysis: { xG: xGAnalysis, form: formAnalysis, homeAdvantage, h2h: h2hAnalysis, standings: standingsAnalysis },
                reason,
                resultChecked: false
            };
            
            analysis.firstHalf = this.calculateFirstHalf(analysis);
            return analysis;
            
        } catch (error) {
            console.error('Analiz hatası:', error);
            return this.generateFallbackAnalysis(fixture);
        }
    }

    // TÜM HESAPLAMA METODLARI
    calculateXG(homeStats, awayStats) {
        if (!homeStats || !awayStats) {
            return { home: 1.2, away: 1.0, total: 2.2, over25: 50, under25: 50, btts: 50 };
        }
        
        const homeGoalsFor = parseFloat(homeStats.goals?.for?.average?.home) || 1.4;
        const homeGoalsAgainst = parseFloat(homeStats.goals?.against?.average?.home) || 1.1;
        const awayGoalsFor = parseFloat(awayStats.goals?.for?.average?.away) || 1.0;
        const awayGoalsAgainst = parseFloat(awayStats.goals?.against?.average?.away) || 1.4;
        
        const homeXG = ((homeGoalsFor + awayGoalsAgainst) / 2).toFixed(2);
        const awayXG = ((awayGoalsFor + homeGoalsAgainst) / 2).toFixed(2);
        const totalXG = (parseFloat(homeXG) + parseFloat(awayXG)).toFixed(2);
        
        const over25Prob = totalXG > 2.5 ? Math.min(85, 50 + (totalXG - 2.5) * 20) : Math.max(25, 50 - (2.5 - totalXG) * 20);
        
        return {
            home: parseFloat(homeXG),
            away: parseFloat(awayXG),
            total: parseFloat(totalXG),
            over25: Math.round(over25Prob),
            under25: Math.round(100 - over25Prob),
            btts: Math.round((parseFloat(homeXG) > 0.9 && parseFloat(awayXG) > 0.9) ? Math.min(80, 55 + (parseFloat(homeXG) + parseFloat(awayXG)) * 8) : Math.max(25, 45 - Math.abs(parseFloat(homeXG) - parseFloat(awayXG)) * 15)),
            over35: totalXG > 3.5 ? Math.round(Math.min(75, (totalXG - 3) * 30)) : Math.max(5, Math.round((totalXG / 3.5) * 30)),
            under15: totalXG < 1.5 ? Math.round(Math.min(75, (1.8 - totalXG) * 40)) : Math.max(5, Math.round(((2.5 - totalXG) / 1) * 20))
        };
    }

    calculateForm(homeLastMatches, awayLastMatches) {
        const analyze = (matches) => {
            if (!matches || matches.length === 0) return { points: 0, wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 };
            let points = 0, wins = 0, draws = 0, losses = 0, gf = 0, ga = 0;
            matches.slice(0, 10).forEach(m => {
                const isHomeWinner = m.teams.home.winner;
                const isAwayWinner = m.teams.away.winner;
                const homeGoals = m.goals.home || 0;
                const awayGoals = m.goals.away || 0;
                
                gf += homeGoals;
                ga += awayGoals;
                
                if (isHomeWinner) { points += 3; wins++; }
                else if (isAwayWinner) { points += 0; losses++; }
                else { points += 1; draws++; }
            });
            return { points, wins, draws, losses, goalsFor: gf, goalsAgainst: ga, goalDiff: gf - ga };
        };
        
        const home = analyze(homeLastMatches);
        const away = analyze(awayLastMatches);
        
        return {
            home, away,
            advantage: home.points - away.points,
            homeAvgGoals: (home.goalsFor / 10).toFixed(2),
            awayAvgGoals: (away.goalsFor / 10).toFixed(2)
        };
    }

    calculateHomeAdvantage(homeStats, awayStats) {
        if (!homeStats || !awayStats) return { homeAdvantage: 15, homeWinRate: 50, awayWinRate: 30 };
        const homeWinRate = (homeStats.fixtures?.wins?.home / homeStats.fixtures?.played?.home * 100) || 50;
        const awayWinRate = (awayStats.fixtures?.wins?.away / awayStats.fixtures?.played?.away * 100) || 30;
        return { homeAdvantage: (homeWinRate - awayWinRate).toFixed(1), homeWinRate: homeWinRate.toFixed(1), awayWinRate: awayWinRate.toFixed(1) };
    }

    calculateInjuryImpact(homeInjuries, awayInjuries) {
        const count = (injuries) => injuries?.filter(i => i.type === 'Missing Fixture').length || 0;
        const homeKey = count(homeInjuries);
        const awayKey = count(awayInjuries);
        return { homeInjuries: homeInjuries?.length || 0, awayInjuries: awayInjuries?.length || 0, homeKeyPlayers: homeKey, awayKeyPlayers: awayKey, impact: (awayKey - homeKey) * 3 };
    }

    calculateH2H(h2hMatches) {
        if (!h2hMatches || h2hMatches.length === 0) return { homeWins: 0, draws: 0, awayWins: 0, total: 0, avgGoals: 2.5 };
        let hw = 0, d = 0, aw = 0, goals = 0;
        h2hMatches.slice(0, 5).forEach(m => {
            if (m.teams.home.winner) hw++;
            else if (m.teams.away.winner) aw++;
            else d++;
            goals += (m.goals.home || 0) + (m.goals.away || 0);
        });
        return { homeWins: hw, draws: d, awayWins: aw, total: h2hMatches.length, homeWinRate: ((hw / h2hMatches.length) * 100).toFixed(1), avgGoals: (goals / h2hMatches.length).toFixed(1) };
    }

    calculateStandingsImpact(standings, homeId, awayId) {
        if (!standings || !standings[0]?.league?.standings) return { homeRank: 10, awayRank: 10, rankDiff: 0, pointsDiff: 0 };
        const allStandings = standings[0].league.standings[0];
        const home = allStandings.find(s => s.team.id === homeId);
        const away = allStandings.find(s => s.team.id === awayId);
        if (!home || !away) return { homeRank: 10, awayRank: 10, rankDiff: 0, pointsDiff: 0 };
        return { homeRank: home.rank, awayRank: away.rank, rankDiff: away.rank - home.rank, homePoints: home.points, awayPoints: away.points, pointsDiff: home.points - away.points };
    }

    calculateMarkets(analysis) {
        const { xG, form, homeAdvantage, h2h, standings } = analysis;
        
        let homeWin = 40, draw = 25, awayWin = 35;
        homeWin += (form.advantage * 2);
        homeWin += (parseFloat(homeAdvantage.homeAdvantage) * 0.3);
        homeWin += (parseFloat(h2h.homeWinRate) * 0.15);
        homeWin += (standings.rankDiff * 2);
        
        const total = homeWin + draw + awayWin;
        const hwProb = Math.min(75, Math.max(20, (homeWin / total) * 100));
        const awProb = Math.min(75, Math.max(20, (awayWin / total) * 100));
        const dProb = Math.max(15, 100 - hwProb - awProb);
        
        return {
            result: {
                '1': { label: 'MS 1', prob: Math.round(hwProb), odds: (100 / hwProb).toFixed(2) },
                'X': { label: 'MS X', prob: Math.round(dProb), odds: (100 / dProb).toFixed(2) },
                '2': { label: 'MS 2', prob: Math.round(awProb), odds: (100 / awProb).toFixed(2) }
            },
            ou: {
                over25: { prob: xG.over25, odds: (100 / xG.over25).toFixed(2) },
                under25: { prob: xG.under25, odds: (100 / xG.under25).toFixed(2) },
                over15: { prob: Math.min(95, xG.over25 + 20), odds: (100 / Math.min(95, xG.over25 + 20)).toFixed(2) },
                over35: { prob: Math.max(5, xG.over25 - 20), odds: (100 / Math.max(5, xG.over25 - 20)).toFixed(2) }
            },
            btts: {
                yes: { prob: xG.btts, odds: (100 / xG.btts).toFixed(2) },
                no: { prob: 100 - xG.btts, odds: (100 / (100 - xG.btts)).toFixed(2) }
            },
            corners: {
                over95: { prob: Math.round((xG.total / 2.5) * 60), odds: (100 / ((xG.total / 2.5) * 60)).toFixed(2) },
                under95: { prob: Math.round(100 - (xG.total / 2.5) * 60), odds: (100 / (100 - (xG.total / 2.5) * 60)).toFixed(2) }
            }
        };
    }

    findBestMarket(markets) {
        let bestProb = 0, bestPick = null, bestMarket = '';
        Object.entries(markets).forEach(([mk, market]) => {
            Object.entries(market).forEach(([pk, pick]) => {
                if (pick.prob > bestProb) {
                    bestProb = pick.prob;
                    bestPick = { ...pick, pick: pk };
                    bestMarket = mk;
                }
            });
        });
        return { ...bestPick, market: bestMarket };
    }

    calculateConfidenceScore(analysis) {
        let score = 50;
        if (analysis.xG.total > 0) score += 15;
        if (analysis.form.home.points > 0) score += 15;
        if (analysis.h2h.total > 0) score += 10;
        if (analysis.standings.homePoints) score += 10;
        return Math.min(98, score);
    }

    generateReason(data) {
        const { homeTeam, awayTeam, xG, form, h2h, standings } = data;
        const reasons = [];
        if (xG.total > 2.5) reasons.push('Yüksek gol beklentisi');
        if (form.advantage > 5) reasons.push(`${homeTeam} formda`);
        else if (form.advantage < -5) reasons.push(`${awayTeam} formda`);
        if (parseFloat(h2h.homeWinRate) > 60) reasons.push(`${homeTeam} H2H üstün`);
        if (standings.rankDiff > 5) reasons.push('Sıralama farkı var');
        return reasons.join('. ') || 'İstatistiksel analiz.';
    }

    calculateFirstHalf(analysis) {
        const xG = analysis.analysis.xG;
        const fhHome = (xG.home * 0.45).toFixed(1);
        const fhAway = (xG.away * 0.40).toFixed(1);
        
        let hw = 30, d = 35, aw = 30;
        const total = hw + d + aw;
        
        return {
            result: {
                prediction: hw > aw ? (hw > d ? '1' : 'X') : (aw > d ? '2' : 'X'),
                homeWin: Math.round((hw / total) * 100),
                draw: Math.round((d / total) * 100),
                awayWin: Math.round((aw / total) * 100),
                confidence: 35,
                odds: '2.85'
            },
            score: { mostLikely: '1-0', probability: 20 }
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
            markets: {
                result: { '1': { label: 'MS 1', prob: 35, odds: '2.85' }, 'X': { label: 'MS X', prob: 30, odds: '3.33' }, '2': { label: 'MS 2', prob: 35, odds: '2.85' } },
                ou: { over25: { prob: 50, odds: '2.00' }, under25: { prob: 50, odds: '2.00' } },
                btts: { yes: { prob: 50, odds: '2.00' }, no: { prob: 50, odds: '2.00' } }
            },
            bestMarket: { label: 'MS 1', prob: 35, odds: '2.85', pick: '1', market: 'result' },
            confidenceScore: 45,
            firstHalf: { result: { prediction: 'X', homeWin: 33, draw: 34, awayWin: 33, confidence: 34, odds: '2.94' }, score: { mostLikely: '0-0', probability: 25 } },
            reason: 'Temel analiz.',
            resultChecked: false
        };
    }

    // RENDER
    renderSinglePrediction(analysis) {
        const container = document.getElementById('ai-predictions');
        if (!container) return;
        
        const div = document.createElement('div');
        div.className = `ai-card ${analysis.isBlurred ? 'blurred' : ''} ${analysis.confidenceScore >= 80 ? 'high-confidence' : ''}`;
        div.id = `prediction-${analysis.fixtureId}`;
        
        const best = analysis.bestMarket;
        const markets = analysis.markets;
        const fh = analysis.firstHalf;
        
        div.innerHTML = analysis.isBlurred ? `
            <div class="blur-overlay">
                <i class="fas fa-lock"></i>
                <p>Maç #${analysis.matchIndex}</p>
                <span class="blur-teams">${analysis.homeTeam} vs ${analysis.awayTeam}</span>
                <button class="btn-premium" onclick="showPremiumModal()">
                    <i class="fas fa-crown"></i> Premium ile Aç
                </button>
                <small>İlk 2 maç ücretsiz</small>
            </div>
        ` : `
            <div class="ai-header">
                <span class="league">${analysis.league}</span>
                <span class="confidence-badge ${analysis.confidenceScore >= 80 ? 'high' : analysis.confidenceScore >= 60 ? 'medium' : 'low'}">
                    %${analysis.confidenceScore} Güven
                </span>
                <span class="match-number">#${analysis.visibleIndex}</span>
            </div>
            
            <div class="ai-teams">
                <span>${analysis.homeTeam}</span>
                <span class="vs">VS</span>
                <span>${analysis.awayTeam}</span>
            </div>
            
            <div class="ai-meta">
                <span><i class="far fa-clock"></i> ${new Date(analysis.matchTime).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
            
            <div class="predictions-container">
                <div class="prediction-box highlight">
                    <div class="prediction-header">
                        <span><i class="fas fa-trophy"></i> MAÇ SONUCU: ${markets.result[best.pick].label}</span>
                        <span class="odds">@${best.odds}</span>
                    </div>
                    <div class="probability-bar">
                        <div class="fill" style="width: ${best.prob}%"></div>
                    </div>
                    <div class="match-result-probs">
                        <span>1: %${markets.result['1'].prob}</span>
                        <span>X: %${markets.result['X'].prob}</span>
                        <span>2: %${markets.result['2'].prob}</span>
                    </div>
                </div>
                
                <div class="prediction-box first-half-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-stopwatch"></i> İLK YARI: ${fh.result.prediction}</span>
                        <span class="odds">@${fh.result.odds}</span>
                    </div>
                    <div class="first-half-details">
                        <div class="fh-score-prediction">
                            <span>Tahmini Skor: <strong>${fh.score.mostLikely}</strong> (%${fh.score.probability})</span>
                        </div>
                        <div class="fh-probs">
                            <span>1: %${fh.result.homeWin}</span>
                            <span>X: %${fh.result.draw}</span>
                            <span>2: %${fh.result.awayWin}</span>
                        </div>
                    </div>
                </div>
                
                <div class="prediction-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-exchange-alt"></i> KG ${markets.btts.yes.prob > markets.btts.no.prob ? 'VAR' : 'YOK'}</span>
                        <span class="odds">@${markets.btts.yes.prob > markets.btts.no.prob ? markets.btts.yes.odds : markets.btts.no.odds}</span>
                    </div>
                    <div class="kg-bar">
                        <div class="kg-fill var" style="width: ${markets.btts.yes.prob}%"></div>
                        <div class="kg-fill yok" style="width: ${markets.btts.no.prob}%"></div>
                    </div>
                    <div class="kg-labels">
                        <span>Var: %${markets.btts.yes.prob}</span>
                        <span>Yok: %${markets.btts.no.prob}</span>
                    </div>
                </div>
                
                <div class="prediction-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-futbol"></i> ${markets.ou.over25.prob > markets.ou.under25.prob ? '2.5 ÜST' : '2.5 ALT'}</span>
                        <span class="odds">@${markets.ou.over25.prob > markets.ou.under25.prob ? markets.ou.over25.odds : markets.ou.under25.odds}</span>
                    </div>
                    <div class="ou-details">
                        <span>Beklenen Gol: <strong>${analysis.analysis.xG.total}</strong></span>
                        <div class="mini-bars">
                            <div class="mini-bar"><div class="mini-fill" style="width: ${markets.ou.over15?.prob || 75}%"></div><span>1.5</span></div>
                            <div class="mini-bar"><div class="mini-fill" style="width: ${markets.ou.over25.prob}%"></div><span>2.5</span></div>
                            <div class="mini-bar"><div class="mini-fill" style="width: ${markets.ou.over35?.prob || 35}%"></div><span>3.5</span></div>
                        </div>
                    </div>
                </div>
                
                <div class="prediction-box">
                    <div class="prediction-header">
                        <span><i class="fas fa-flag"></i> ${markets.corners?.over95?.prob > 50 ? '9.5 Korner ÜST' : '9.5 Korner ALT'}</span>
                        <span class="odds">@${markets.corners?.over95?.prob > 50 ? markets.corners.over95.odds : markets.corners?.under95?.odds || '1.90'}</span>
                    </div>
                    <div class="corner-details">
                        <span>Beklenen Korner: <strong>${Math.round(analysis.analysis.xG.total * 3.5)}</strong></span>
                        <div class="corner-bar-container">
                            <div class="corner-bar"><div class="corner-fill" style="width: ${markets.corners?.over95?.prob || 50}%"></div></div>
                        </div>
                    </div>
                </div>
                
                <div class="analysis-reason">
                    <i class="fas fa-brain"></i>
                    <p>${analysis.reason}</p>
                </div>
                
                <button class="add-to-coupon" onclick="addToCoupon(${analysis.fixtureId})">
                    <i class="fas fa-plus"></i> Kuponuma Ekle
                </button>
            </div>
        `;
        
        container.appendChild(div);
    }

    // MAÇ SONUCU KONTROLÜ
    startResultChecker() {
        setInterval(() => this.checkMatchResults(), 120000);
    }

    async checkMatchResults() {
        const finished = this.allAnalyses.filter(a => a.status === 'FT' && !a.resultChecked);
        for (const analysis of finished) {
            try {
                const today = new Date().toISOString().split('T')[0];
                const data = await apiService.getFixtures(today);
                const match = data.response?.find(m => m.fixture.id === analysis.fixtureId);
                if (match) {
                    await this.evaluatePrediction(analysis, match);
                    analysis.resultChecked = true;
                }
            } catch (e) {
                console.error('Sonuç kontrol hatası:', e);
            }
        }
    }

    async evaluatePrediction(analysis, match) {
        const homeGoals = match.goals.home;
        const awayGoals = match.goals.away;
        const total = homeGoals + awayGoals;
        
        const result = {
            fixtureId: analysis.fixtureId,
            homeTeam: analysis.homeTeam,
            awayTeam: analysis.awayTeam,
            score: `${homeGoals}-${awayGoals}`,
            date: new Date(),
            wonPredictions: []
        };
        
        // MS
        let actual = 'X';
        if (homeGoals > awayGoals) actual = '1';
        else if (awayGoals > homeGoals) actual = '2';
        if (actual === analysis.bestMarket.pick) {
            result.wonPredictions.push({ type: 'MS', prediction: analysis.bestMarket.label, odds: analysis.bestMarket.odds });
        }
        
        // KG
        if (homeGoals > 0 && awayGoals > 0) {
            result.wonPredictions.push({ type: 'KG', prediction: 'KG Var', odds: '1.65' });
        }
        
        // 2.5
        if (total > 2.5) {
            result.wonPredictions.push({ type: '2.5', prediction: '2.5 Üst', odds: '1.80' });
        }
        
        if (result.wonPredictions.length > 0) {
            this.addWinningPrediction(result);
        }
        
        this.removeMatchCard(analysis.fixtureId);
    }

    addWinningPrediction(result) {
        this.winningPredictions.unshift(result);
        if (this.winningPredictions.length > 50) this.winningPredictions = this.winningPredictions.slice(0, 50);
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
        const badge = document.getElementById('winning-count');
        if (badge) {
            badge.textContent = this.winningPredictions.length;
            badge.style.display = this.winningPredictions.length > 0 ? 'block' : 'none';
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
                    ${wp.wonPredictions.map(p => `<span class="won-badge"><i class="fas fa-check"></i> ${p.type}: ${p.prediction} @${p.odds}</span>`).join('')}
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
        const total = document.getElementById('total-predictions');
        const hot = document.getElementById('hot-predictions');
        if (total) total.textContent = this.allAnalyses.filter(a => !a.isBlurred).length;
        if (hot) hot.textContent = this.allAnalyses.filter(a => a.confidenceScore >= 80).length;
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
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
}
