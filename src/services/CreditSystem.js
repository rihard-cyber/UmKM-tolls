const CREDIT_COSTS = {
  upload: { unit: 'file', cost: 0, description: 'Upload video ke storage' },
  transcribe: { unit: 'minute', cost: 1, description: 'Auto subtitle per menit video' },
  render: { unit: 'minute', cost: 2, description: 'Render video per menit output' },
  auto_clip: { unit: 'minute', cost: 1, description: 'Auto clipping per menit video' },
  caption_template: { unit: 'use', cost: 0, description: 'Caption dari template (gratis)' },
  caption_ai: { unit: 'use', cost: 5, description: 'Caption AI premium' },
  image_generate: { unit: 'image', cost: 15, description: 'AI Image generation' },
  video_generate: { unit: 'video', cost: 50, description: 'AI Video generation' },
  avatar: { unit: 'use', cost: 30, description: 'AI Avatar creation' },
  voice_clone: { unit: 'use', cost: 20, description: 'Voice cloning' },
  enhance_caption: { unit: 'use', cost: 3, description: 'AI enhance caption' },
  publish: { unit: 'post', cost: 0, description: 'Publish ke platform' },
};

const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    creditsPerMonth: 50,
    maxStorageGB: 2,
    maxProjects: 5,
    maxTeamMembers: 1,
    watermark: true,
    features: ['Upload video', 'Auto subtitle (10 menit/bln)', 'Caption template', 'Export 720p', 'Brand kit dasar'],
  },
  starter: {
    name: 'Starter',
    price: 49000,
    creditsPerMonth: 500,
    maxStorageGB: 20,
    maxProjects: 50,
    maxTeamMembers: 3,
    watermark: false,
    features: ['Semua Free', 'Auto subtitle 100 menit/bln', 'AI Caption (10x/bln)', 'Export 1080p', 'Template premium', 'No watermark'],
  },
  pro: {
    name: 'Pro',
    price: 149000,
    creditsPerMonth: 2500,
    maxStorageGB: 100,
    maxProjects: 200,
    maxTeamMembers: 10,
    watermark: false,
    features: ['Semua Starter', 'Auto subtitle unlimited', 'AI Caption 100x/bln', 'Export 4K', 'AI Image 50x/bln', 'Priority queue', 'Team workspace'],
  },
  business: {
    name: 'Business',
    price: 499000,
    creditsPerMonth: 10000,
    maxStorageGB: 500,
    maxProjects: -1,
    maxTeamMembers: -1,
    watermark: false,
    features: ['Semua Pro', 'AI Caption unlimited', 'AI Image 200x/bln', 'AI Avatar 20x/bln', 'White-label', 'API access', 'Dedicated support'],
  },
};

class CreditManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.credits = 50;
    this.plan = 'free';
    this.usage = {};
    this.cycleStart = Date.now();
    this.additionalCredits = 0;
    this.autoTopUp = false;
    this.topUpThreshold = 20;
  }

  load(state) {
    if (!state) return;
    this.credits = state.credits ?? 50;
    this.plan = state.plan || 'free';
    this.usage = state.usage || {};
    this.cycleStart = state.cycleStart || Date.now();
  }

  save() {
    return { credits: this.credits, plan: this.plan, usage: this.usage, cycleStart: this.cycleStart };
  }

  getPlan() { return PLANS[this.plan] || PLANS.free; }

  switchPlan(planId) {
    if (!PLANS[planId]) return false;
    this.plan = planId;
    this.credits = PLANS[planId].creditsPerMonth;
    this.cycleStart = Date.now();
    this.usage = {};
    return true;
  }

  canAfford(action) {
    const cost = CREDIT_COSTS[action];
    if (!cost || cost.cost === 0) return true;
    return this.credits >= cost.cost || this.plan === 'business';
  }

  spend(action, metadata = {}) {
    const cost = CREDIT_COSTS[action];
    if (!cost || cost.cost === 0) return { ok: true, cost: 0 };

    if (this.plan === 'business') {
      this.usage[action] = (this.usage[action] || 0) + 1;
      return { ok: true, cost: 0, plan: 'business' };
    }

    if (this.credits < cost.cost) return { ok: false, cost: cost.cost, deficit: cost.cost - this.credits };

    this.credits -= cost.cost;
    this.usage[action] = (this.usage[action] || 0) + 1;
    return { ok: true, cost: cost.cost, remaining: this.credits };
  }

  addCredits(amount) {
    this.additionalCredits += amount;
    this.credits += amount;
  }

  getUsageSummary() {
    const total = Object.entries(this.usage).reduce((s, [, c]) => s + (CREDIT_COSTS[c]?.cost || 0) * c, 0);
    return { ...this.usage, totalUsed: total, totalCost: Object.entries(CREDIT_COSTS).reduce((s, [k, v]) => s + (this.usage[k] || 0) * v.cost, 0) };
  }

  estimateCost(action, units = 1) {
    const cost = CREDIT_COSTS[action];
    if (!cost) return 0;
    return cost.cost * units;
  }

  getTopUpUrl() {
    const plan = this.getPlan();
    const needed = Math.max(100, this.topUpThreshold - this.credits);
    return { amount: needed, price: Math.ceil(needed / 100) * 10000 };
  }

  static getCREDIT_COSTS() { return CREDIT_COSTS; }
  static getPlans() { return PLANS; }
}

export const creditSystem = new CreditManager();
export { CREDIT_COSTS, PLANS };
