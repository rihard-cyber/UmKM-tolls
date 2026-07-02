import { AutomationEngine } from './AutomationEngine';
import { AIGateway } from './AIGateway';
import { ViralScore } from './ViralScore';
import { TemplateIntelligence } from './TemplateIntelligence';
import { creditSystem } from './CreditSystem';
import { queueSystem, JOB_TYPES } from './QueueSystem';

queueSystem.setHandlers({
  async transcribe(job) {
    const route = AIGateway.getRoute('transcribe', creditSystem.plan);
    AIGateway.trackUsage('transcribe', route.provider, route.model, route.cost, { videoId: job.payload.videoId });
    return { text: '[Transkrip simulasi] Video berhasil diproses.', segments: [], duration: job.payload.duration || 60 };
  },
  async transcribe_precise(job) {
    const route = AIGateway.getRoute('transcribe_precise', creditSystem.plan);
    AIGateway.trackUsage('transcribe_precise', route.provider, route.model, route.cost, { videoId: job.payload.videoId });
    return { text: '[Transkrip presisi] Proses selesai.', segments: [], duration: job.payload.duration || 60 };
  },
  async trim(job) {
    const result = await AutomationEngine.trimVideo(job.payload.source, job.payload.start, job.payload.end);
    return { ...result, status: 'completed', outputUrl: `trimmed-${job.payload.source}` };
  },
  async resize(job) {
    const result = await AutomationEngine.resizeVideo(job.payload.source, job.payload.ratio);
    return { ...result, status: 'completed', outputUrl: `resized-${job.payload.source}` };
  },
  async subtitle_burn(job) {
    const result = await AutomationEngine.burnSubtitle(job.payload.source, job.payload.transcript, job.payload.style);
    return { ...result, status: 'completed', outputUrl: `subbed-${job.payload.source}` };
  },
  async watermark(job) {
    const result = await AutomationEngine.addWatermark(job.payload.source, job.payload.watermark, job.payload.position);
    return { ...result, status: 'completed' };
  },
  async intro_outro(job) {
    const result = await AutomationEngine.addIntroOutro(job.payload.mainVideo, job.payload.intro, job.payload.outro);
    return { ...result, status: 'completed' };
  },
  async noise_reduction(job) {
    const result = await AutomationEngine.applyNoiseReduction(job.payload.source, job.payload.level);
    return { ...result, status: 'completed' };
  },
  async audio_normalize(job) {
    const result = await AutomationEngine.normalizeAudio(job.payload.source, job.payload.targetLUFS);
    return { ...result, status: 'completed' };
  },
  async auto_clip(job) {
    const clips = await AutomationEngine.autoCutBySilence(job.payload.source, job.payload.transcript);
    const scored = clips.map((clip, i) => {
      const scoreResult = ViralScore.calculateViralScore({
        duration: clip.duration || 30,
        platform: job.payload.platform || 'tiktok',
        transcript: job.payload.transcript?.text,
        segments: job.payload.transcript?.segments,
        subtitleStyle: job.payload.subtitleStyle,
        hasCTA: !!job.payload.cta,
        niche: job.payload.niche,
        audioFeatures: job.payload.audioFeatures,
      });
      return { ...clip, viralScore: scoreResult.score, scoreBreakdown: scoreResult.breakdown };
    });
    scored.sort((a, b) => b.viralScore - a.viralScore);
    return { clips: scored, totalClips: scored.length };
  },
  async smart_crop(job) {
    const result = await AutomationEngine.smartCropByFace(job.payload.source, job.payload.facePositions);
    return { ...result, status: 'completed' };
  },
  async blur_faces(job) {
    const result = await AutomationEngine.blurFaces(job.payload.source, job.payload.regions);
    return { ...result, status: 'completed' };
  },
  async render(job) {
    const result = await AutomationEngine.renderFinalVideo(job.payload.jobs);
    creditSystem.spend('render', { duration: job.payload.duration || 1 });
    return { ...result, status: 'completed', outputUrl: `final-${Date.now()}.mp4` };
  },
  async caption_ai(job) {
    const route = AIGateway.getRoute('caption_premium', creditSystem.plan);
    if (!route) {
      const templateResult = TemplateIntelligence.buildFromTemplate({
        niche: job.payload.niche || 'umum',
        tone: job.payload.tone || 'kasual',
        lang: job.payload.lang || 'indonesia',
        username: job.payload.username,
        ctaText: job.payload.cta,
        topic: job.payload.topic,
      });
      return { ...templateResult, source: 'template', message: 'Gunakan paket lebih tinggi untuk AI premium.' };
    }
    AIGateway.trackUsage('caption_ai', route.provider, route.model, route.cost, { topic: job.payload.topic });
    const templateResult = TemplateIntelligence.buildFromTemplate({
      niche: job.payload.niche || 'umum',
      tone: job.payload.tone || 'kasual',
      lang: job.payload.lang || 'indonesia',
      username: job.payload.username,
      ctaText: job.payload.cta,
      topic: job.payload.topic,
    });
    return { ...templateResult, source: 'ai_premium', enhanced: true };
  },
  async image_generate(job) {
    const route = AIGateway.getRoute('image_generate', creditSystem.plan);
    if (!route) throw new Error('Image generation requires a premium plan.');
    AIGateway.trackUsage('image_generate', route.provider, route.model, route.cost, { prompt: job.payload.prompt });
    creditSystem.spend('image_generate');
    return { url: null, prompt: job.payload.prompt, status: 'queued', estimatedTime: '~10 detik' };
  },
});

function processProject(videoId, config) {
  const jobIds = [];
  const { transcribe, autoClip, resize, subtitle, watermark, noiseReduce, normalizeAudio, detectScenes, render } = config;

  if (transcribe) {
    const spend = creditSystem.spend('transcribe');
    if (!spend.ok) return { error: 'Kredit tidak cukup untuk transkripsi.', deficit: spend.deficit };
    const job = queueSystem.addJob('transcribe', { videoId, duration: config.duration || 60 }, { priority: 'high' });
    jobIds.push(job.id);
  }

  if (noiseReduce) {
    const job = queueSystem.addJob('noise_reduction', { source: videoId, level: noiseReduce }, { priority: 'normal', dependsOn: jobIds.length > 0 ? [jobIds[jobIds.length - 1]] : [] });
    jobIds.push(job.id);
  }

  if (normalizeAudio) {
    const job = queueSystem.addJob('audio_normalize', { source: videoId }, { priority: 'normal', dependsOn: jobIds.length > 0 ? [jobIds[jobIds.length - 1]] : [] });
    jobIds.push(job.id);
  }

  if (detectScenes) {
    const job = queueSystem.addJob('scene_detect', { source: videoId }, { priority: 'normal' });
    jobIds.push(job.id);
  }

  if (resize) {
    const job = queueSystem.addJob('resize', { source: videoId, ratio: resize }, { priority: 'instant', dependsOn: jobIds.length > 0 ? [jobIds[jobIds.length - 1]] : [] });
    jobIds.push(job.id);
  }

  if (autoClip) {
    const spend = creditSystem.spend('auto_clip');
    if (!spend.ok) return { error: 'Kredit tidak cukup untuk auto clipping.', deficit: spend.deficit };
    const job = queueSystem.addJob('auto_clip', { source: videoId, platform: config.platform, transcript: null, cta: config.cta, niche: config.niche, subtitleStyle: config.subtitleStyle }, { priority: 'normal', dependsOn: jobIds.length > 0 ? jobIds.slice(-1) : [] });
    jobIds.push(job.id);
  }

  if (subtitle) {
    const job = queueSystem.addJob('subtitle_burn', { source: videoId, transcript: null, style: subtitle }, { priority: 'high', dependsOn: jobIds.length > 0 ? jobIds.slice(-1) : [] });
    jobIds.push(job.id);
  }

  if (watermark) {
    const job = queueSystem.addJob('watermark', { source: videoId, watermark: watermark.url, position: watermark.position }, { priority: 'high', dependsOn: jobIds.length > 0 ? jobIds.slice(-1) : [] });
    jobIds.push(job.id);
  }

  if (render) {
    const spend = creditSystem.spend('render');
    if (!spend.ok) return { error: 'Kredit tidak cukup untuk rendering.', deficit: spend.deficit };
    const job = queueSystem.addJob('render', { jobs: jobIds, duration: config.duration || 60 }, { priority: 'high', dependsOn: jobIds.length > 0 ? jobIds.slice(-1) : [] });
    jobIds.push(job.id);
  }

  return { jobIds, totalJobs: jobIds.length, estimatedCost: 'Lihat detail' };
}

function getProjectStatus(jobIds) {
  const jobs = jobIds.map(id => queueSystem.getJob(id)).filter(Boolean);
  const total = jobs.length;
  const completed = jobs.filter(j => j.status === 'completed').length;
  const failed = jobs.filter(j => j.status === 'failed').length;
  const processing = jobs.filter(j => j.status === 'processing').length;
  const queued = jobs.filter(j => j.status === 'queued').length;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, completed, failed, processing, queued, progress, jobs };
}

function estimateProjectCost(config) {
  let totalCredit = 0;
  if (config.transcribe) totalCredit += creditSystem.estimateCost('transcribe', Math.ceil((config.duration || 60) / 60));
  if (config.autoClip) totalCredit += creditSystem.estimateCost('auto_clip', Math.ceil((config.duration || 60) / 60));
  if (config.render) totalCredit += creditSystem.estimateCost('render', Math.ceil((config.duration || 60) / 60));
  return { credits: totalCredit, rupiah: totalCredit * 100 };
}

export const ProcessingPipeline = { processProject, getProjectStatus, estimateProjectCost };
