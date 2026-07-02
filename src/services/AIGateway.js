import { supabase } from './supabase';

const PROVIDERS = {
  local: { name: 'Local Whisper/Model', costPerCall: 0, type: 'local' },
  openSource: { name: 'Self-hosted GPU (LLaMA, Mistral)', costPerCall: 0.0001, type: 'opensource' },
  premium: { name: 'Cloud AI (GPT-4o, Gemini 2.5)', costPerCall: 0.003, type: 'cloud' },
};

const TASK_ROUTING = {
  transcribe: { provider: 'local', model: 'whisper-base', priority: 'batch' },
  transcribe_precise: { provider: 'openSource', model: 'whisper-large-v3', priority: 'normal' },
  caption_simple: { provider: 'local', model: 'template', priority: 'instant' },
  caption_premium: { provider: 'premium', model: 'gpt-4o', priority: 'normal' },
  scene_detect: { provider: 'local', model: 'pyscenedetect', priority: 'batch' },
  face_detect: { provider: 'local', model: 'mediapipe', priority: 'batch' },
  viral_score: { provider: 'local', model: 'rule-engine', priority: 'instant' },
  image_generate: { provider: 'premium', model: 'dall-e-3', priority: 'normal' },
  avatar: { provider: 'premium', model: 'heygen', priority: 'high' },
  enhance_caption: { provider: 'premium', model: 'gpt-4o-mini', priority: 'normal' },
};

const MODEL_COST_ESTIMATE = {
  'whisper-base': { perMinute: 0.000 },
  'whisper-large-v3': { perMinute: 0.002 },
  'gpt-4o': { perCall: 0.003, perToken: 0.00001 },
  'gpt-4o-mini': { perCall: 0.0005, perToken: 0.000002 },
  'dall-e-3': { perImage: 0.04 },
  'template': { perCall: 0.000 },
  'rule-engine': { perCall: 0.000 },
  'pyscenedetect': { perMinute: 0.000 },
  'mediapipe': { perMinute: 0.000 },
};

let usageLog = [];
let lastProviderFailover = {};

function getRoute(taskId, userTier = 'free') {
  const route = TASK_ROUTING[taskId];
  if (!route) return { provider: 'local', model: 'fallback', cost: 0 };

  let selectedProvider = route.provider;

  if (userTier === 'free' && selectedProvider === 'premium') {
    const fallbackMap = { caption_premium: 'caption_simple', image_generate: null, enhance_caption: 'caption_simple' };
    const fallbackTask = fallbackMap[taskId];
    if (fallbackTask) return getRoute(fallbackTask, userTier);
    return null;
  }

  if (userTier === 'starter' && selectedProvider === 'premium') {
    selectedProvider = 'openSource';
  }

  if (lastProviderFailover[taskId]) {
    selectedProvider = 'openSource';
  }

  const cost = estimateCost(taskId, route, selectedProvider);
  return { provider: selectedProvider, model: route.model, cost, priority: route.priority };
}

function estimateCost(taskId, route, providerKey) {
  const provider = PROVIDERS[providerKey];
  if (!provider || provider.costPerCall === 0) return 0;
  const modelCost = MODEL_COST_ESTIMATE[route.model];
  if (!modelCost) return provider.costPerCall;
  return modelCost.perCall || modelCost.perMinute || provider.costPerCall;
}

function trackUsage(taskId, provider, model, cost, metadata = {}) {
  const entry = { taskId, provider, model, cost, timestamp: Date.now(), ...metadata };
  usageLog.push(entry);
  return entry;
}

function getUsageStats() {
  const totalCost = usageLog.reduce((s, e) => s + (e.cost || 0), 0);
  const byProvider = {};
  usageLog.forEach(e => { byProvider[e.provider] = (byProvider[e.provider] || 0) + 1; });
  return { totalCalls: usageLog.length, totalCost, byProvider };
}

function markFailover(taskId) {
  lastProviderFailover[taskId] = Date.now();
}

function clearFailover(taskId) {
  delete lastProviderFailover[taskId];
}

async function processAITask(taskId, inputData = {}, config = {}) {
  try {
    const route = getRoute(taskId);
    
    const API_URL = import.meta.env.PROD ? '/api/ai/process' : 'http://localhost:5000/api/ai/process';
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // Disabled for prototype
      },
      body: JSON.stringify({ taskId, route, inputData, config })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Network response was not ok');
    }
    
    const data = await response.json();
    if (data.success) {
      trackUsage(taskId, route.provider, route.model, route.cost);
      return data;
    } else {
      throw new Error(data.error || 'AI Processing Failed');
    }
  } catch (error) {
    console.error(`AI Gateway Error [${taskId}]:`, error);
    markFailover(taskId);
    throw error;
  }
}

export const AIGateway = { getRoute, trackUsage, getUsageStats, markFailover, clearFailover, processAITask, TASK_ROUTING, PROVIDERS };
