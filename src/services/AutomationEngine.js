export const VIDEO_FORMATS = {
  mp4: { mime: 'video/mp4', ext: '.mp4' },
  webm: { mime: 'video/webm', ext: '.webm' },
  mov: { mime: 'video/quicktime', ext: '.mov' },
  avi: { mime: 'video/x-msvideo', ext: '.avi' },
};

export const ASPECT_RATIOS = {
  '9:16': { width: 1080, height: 1920, label: 'TikTok/Reels/Shorts' },
  '16:9': { width: 1920, height: 1080, label: 'YouTube/Wide' },
  '1:1': { width: 1080, height: 1080, label: 'Instagram Feed' },
  '4:5': { width: 1080, height: 1350, label: 'Instagram Portrait' },
};

export const SUBTITLE_STYLES = [
  { id: 'default', name: 'Modern', desc: 'Font Inter, background gelap transparan', icon: '📝' },
  { id: 'minimal', name: 'Minimal', desc: 'Hanya teks, tanpa background', icon: '✨' },
  { id: 'neon', name: 'Neon', desc: 'Teks glow berwarna, gaya gaming', icon: '💜' },
  { id: 'cinematic', name: 'Cinematic', desc: 'Font serif, border tipis, vintage', icon: '🎬' },
  { id: 'bold', name: 'Bold', desc: 'Font tebal, warna kontras tinggi', icon: '💪' },
  { id: 'karaoke', name: 'Karaoke', desc: 'Per kata, sorot sesuai audio', icon: '🎤' },
  { id: 'typewriter', name: 'Typewriter', desc: 'Muncul huruf per huruf', icon: '⌨️' },
  { id: 'news', name: 'News Ticker', desc: 'Teks berjalan di bawah', icon: '📰' },
];

export const NOISE_REDUCTION_LEVELS = [
  { id: 'off', label: 'Off', desc: 'No processing' },
  { id: 'light', label: 'Light', desc: 'Reduce background hiss' },
  { id: 'medium', label: 'Medium', desc: 'Balance clarity & noise' },
  { id: 'aggressive', label: 'Aggressive', desc: 'Maximum noise removal' },
];

export const TRANSITION_PRESETS = [
  { id: 'cut', name: 'Cut', desc: 'Direct cut — fast pacing' },
  { id: 'fade', name: 'Fade', desc: 'Fade in/out — smooth' },
  { id: 'dissolve', name: 'Cross Dissolve', desc: 'Slow transition' },
  { id: 'slide', name: 'Slide', desc: 'Slide left/right — dynamic' },
];

function validateFormat(file, allowedTypes) {
  const ext = '.' + file.name.split('.').pop().toLowerCase();
  return Object.values(VIDEO_FORMATS).some(f => f.ext === ext && allowedTypes.includes(f.mime));
}

function validateSize(file, maxMB) {
  return file.size <= maxMB * 1024 * 1024;
}

export async function trimVideo(source, startSec, endSec) {
  const duration = endSec - startSec;
  return { jobType: 'trim', source, startSec, endSec, duration, estimatedCost: 'free' };
}

export async function resizeVideo(source, targetRatio) {
  const ratio = ASPECT_RATIOS[targetRatio];
  if (!ratio) throw new Error(`Unknown ratio: ${targetRatio}`);
  return { jobType: 'resize', source, targetWidth: ratio.width, targetHeight: ratio.height, ratio: targetRatio, estimatedCost: 'free' };
}

export async function burnSubtitle(source, transcript, style = 'default') {
  const styleConfig = SUBTITLE_STYLES.find(s => s.id === style) || SUBTITLE_STYLES[0];
  return { jobType: 'subtitle_burn', source, transcript, style: styleConfig, estimatedCost: 'free' };
}

export async function addWatermark(videoSource, watermarkUrl, position = 'bottom-right') {
  return { jobType: 'watermark', source: videoSource, watermark: watermarkUrl, position, estimatedCost: 'free' };
}

export async function addIntroOutro(mainVideo, introUrl, outroUrl) {
  return { jobType: 'intro_outro', mainVideo, intro: introUrl, outro: outroUrl, estimatedCost: 'free' };
}

export async function applyNoiseReduction(source, level = 'light') {
  const config = NOISE_REDUCTION_LEVELS.find(l => l.id === level) || NOISE_REDUCTION_LEVELS[1];
  return { jobType: 'noise_reduction', source, level: config, estimatedCost: 'free' };
}

export async function normalizeAudio(source, targetLUFS = -14) {
  return { jobType: 'audio_normalize', source, targetLUFS, estimatedCost: 'free' };
}

export async function autoCutBySilence(source, transcript, silenceThreshold = -30, minClipDuration = 20, maxClipDuration = 60) {
  const clips = [];
  if (!transcript || !transcript.segments) {
    return [{
      id: `clip-auto-${Date.now()}`,
      start: 0, end: 60, duration: 60,
      type: 'auto-silence', score: 75,
    }];
  }
  let currentStart = 0;
  for (const seg of transcript.segments) {
    if (seg.end - currentStart >= minClipDuration) {
      if (seg.end - currentStart <= maxClipDuration || seg.silence) {
        clips.push({ id: `clip-${clips.length}`, start: currentStart, end: seg.end, duration: seg.end - currentStart, type: 'auto-silence' });
        currentStart = seg.end;
      }
    }
  }
  if (currentStart < (transcript.segments[transcript.segments.length - 1]?.end || 0)) {
    clips.push({ id: `clip-${clips.length}`, start: currentStart, end: transcript.segments[transcript.segments.length - 1].end, duration: transcript.segments[transcript.segments.length - 1].end - currentStart, type: 'auto-silence' });
  }
  return clips;
}

export async function smartCropByFace(source, facePositions) {
  if (!facePositions || facePositions.length === 0) {
    return { jobType: 'smart_crop', source, method: 'center', estimatedCost: 'free' };
  }
  const avgX = facePositions.reduce((s, f) => s + f.x, 0) / facePositions.length;
  const avgY = facePositions.reduce((s, f) => s + f.y, 0) / facePositions.length;
  return { jobType: 'smart_crop', source, focusX: avgX, focusY: avgY, estimatedCost: 'free' };
}

export async function blurFaces(source, faceRegions) {
  return { jobType: 'blur_faces', source, regions: faceRegions || [], estimatedCost: 'free' };
}

export async function detectSceneChanges(source) {
  return { jobType: 'scene_detect', source, method: 'histogram', estimatedCost: 'free' };
}

export async function renderFinalVideo(jobs) {
  return { jobType: 'render', jobs, estimatedCost: 'free', status: 'queued' };
}

export const AutomationEngine = {
  trimVideo, resizeVideo, burnSubtitle, addWatermark, addIntroOutro,
  applyNoiseReduction, normalizeAudio, autoCutBySilence, smartCropByFace,
  blurFaces, detectSceneChanges, renderFinalVideo,
  validateFormat, validateSize,
  VIDEO_FORMATS, ASPECT_RATIOS, SUBTITLE_STYLES, NOISE_REDUCTION_LEVELS, TRANSITION_PRESETS,
};
