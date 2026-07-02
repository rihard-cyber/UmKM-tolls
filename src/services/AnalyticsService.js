export class AnalyticsService {
  constructor() {
    this.storageKey = 'clipperai_analytics';
    this.data = this._load();
  }

  _load() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      return saved ? JSON.parse(saved) : this._defaults();
    } catch (e) {
      console.warn('AnalyticsService: failed to load', e);
      return this._defaults();
    }
  }

  _save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch {}
  }

  _defaults() {
    return {
      totalContentGenerated: 0,
      totalPublished: 0,
      totalScheduled: 0,
      totalViews: 0,
      totalWatchTime: 0,
      totalEngagement: 0,
      videosByPlatform: { youtube: 0, tiktok: 0, instagram: 0, facebook: 0, linkedin: 0, twitter: 0 },
      topPerformingContent: [],
      bestPostingTime: null,
      bestCaptionStyle: null,
      bestVideoDuration: null,
      contentTypePerformance: {},
      dailyStats: {},
      hashtagPerformance: {},
      recentProjects: []
    };
  }

  trackGenerated(contentType, platform = 'general') {
    this.data.totalContentGenerated++;
    if (this.data.videosByPlatform[platform] !== undefined) {
      this.data.videosByPlatform[platform]++;
    }
    this._recordDaily('generated');
    this._save();
  }

  trackPublished(platform, metrics = {}) {
    this.data.totalPublished++;
    if (metrics.views) this.data.totalViews += metrics.views;
    if (metrics.watchTime) this.data.totalWatchTime += metrics.watchTime;
    if (metrics.engagement) this.data.totalEngagement += metrics.engagement;
    this._recordDaily('published');
    this._save();
  }

  trackScheduled() {
    this.data.totalScheduled++;
    this._save();
  }

  trackProject(project) {
    this.data.recentProjects.unshift({
      ...project,
      timestamp: new Date().toISOString()
    });
    if (this.data.recentProjects.length > 50) this.data.recentProjects.pop();
    this._save();
  }

  _recordDaily(type) {
    const today = new Date().toISOString().split('T')[0];
    if (!this.data.dailyStats[today]) {
      this.data.dailyStats[today] = { generated: 0, published: 0, views: 0 };
    }
    this.data.dailyStats[today][type]++;
  }

  getWeeklyStats() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const stats = [];
    for (let d = new Date(weekAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      stats.push({
        date: dateStr,
        ...this.data.dailyStats[dateStr] || { generated: 0, published: 0, views: 0 }
      });
    }
    return stats;
  }

  getSummary() {
    return {
      totalContentGenerated: this.data.totalContentGenerated,
      totalPublished: this.data.totalPublished,
      totalScheduled: this.data.totalScheduled,
      totalViews: this.data.totalViews,
      totalEngagement: this.data.totalEngagement,
      videosByPlatform: this.data.videosByPlatform,
      topPlatform: Object.entries(this.data.videosByPlatform)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A',
      recentProjects: this.data.recentProjects.slice(0, 5)
    };
  }

  getContentInsights() {
    const weeklyStats = this.getWeeklyStats();
    const avgDaily = weeklyStats.reduce((sum, d) => sum + d.generated, 0) / Math.max(weeklyStats.length, 1);
    return {
      averageDailyContent: Math.round(avgDaily * 10) / 10,
      totalThisWeek: weeklyStats.reduce((sum, d) => sum + d.generated, 0),
      growth: this._calculateGrowth(),
      recommendations: this._generateRecommendations()
    };
  }

  _calculateGrowth() {
    const stats = Object.values(this.data.dailyStats);
    if (stats.length < 2) return 0;
    const firstHalf = stats.slice(0, Math.floor(stats.length / 2));
    const secondHalf = stats.slice(Math.floor(stats.length / 2));
    const firstAvg = firstHalf.reduce((s, d) => s + d.generated, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, d) => s + d.generated, 0) / secondHalf.length;
    return firstAvg > 0 ? Math.round(((secondAvg - firstAvg) / firstAvg) * 100) : 0;
  }

  _generateRecommendations() {
    const recs = [];
    const topPlatform = Object.entries(this.data.videosByPlatform)
      .sort((a, b) => b[1] - a[1])[0];

    if (topPlatform && topPlatform[1] > 0) {
      recs.push(`Platform terkuat Anda: ${topPlatform[0].charAt(0).toUpperCase() + topPlatform[0].slice(1)}. Fokuskan 60% konten di sini.`);
    }

    if (this.data.totalContentGenerated > this.data.totalPublished + this.data.totalScheduled) {
      const backlog = this.data.totalContentGenerated - this.data.totalPublished - this.data.totalScheduled;
      if (backlog > 5) {
        recs.push(`Anda memiliki ${backlog} konten yang belum dipublikasi. Jadwalkan secara bertahap.`);
      }
    }

    if (this.data.totalEngagement > 0 && this.data.totalViews > 0) {
      const engagementRate = Math.round((this.data.totalEngagement / this.data.totalViews) * 100);
      if (engagementRate < 5) {
        recs.push(`Engagement rate ${engagementRate}% - coba tambahkan CTA yang lebih kuat di setiap konten.`);
      }
    }

    if (recs.length === 0) {
      recs.push('Mulai buat konten untuk mendapatkan rekomendasi yang dipersonalisasi.');
    }

    return recs;
  }

  clearData() {
    this.data = this._defaults();
    this._save();
  }
}

export const analyticsService = new AnalyticsService();
