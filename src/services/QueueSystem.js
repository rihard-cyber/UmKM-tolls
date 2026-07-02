const JOB_PRIORITY = { instant: 0, high: 1, normal: 2, batch: 3, background: 4 };

const JOB_TYPES = {
  transcribe: { description: 'Transkripsi audio ke teks', priority: 'normal', estimatedTime: 'durasi x 0.3' },
  transcribe_precise: { description: 'Transkripsi presisi tinggi', priority: 'batch', estimatedTime: 'durasi x 0.8' },
  scene_detect: { description: 'Deteksi perubahan scene', priority: 'normal', estimatedTime: 'durasi x 0.2' },
  face_detect: { description: 'Deteksi & tracking wajah', priority: 'normal', estimatedTime: 'durasi x 0.3' },
  trim: { description: 'Potong video berdasarkan timestamp', priority: 'instant', estimatedTime: 'durasi x 0.1' },
  resize: { description: 'Ubah ukuran video', priority: 'instant', estimatedTime: 'durasi x 0.15' },
  subtitle_burn: { description: 'Render subtitle ke video', priority: 'high', estimatedTime: 'durasi x 0.5' },
  watermark: { description: 'Tambahkan watermark', priority: 'high', estimatedTime: 'durasi x 0.2' },
  intro_outro: { description: 'Gabungkan intro/outro', priority: 'high', estimatedTime: 'durasi x 0.3' },
  noise_reduction: { description: 'Reduksi noise audio', priority: 'normal', estimatedTime: 'durasi x 0.3' },
  audio_normalize: { description: 'Normalisasi audio', priority: 'normal', estimatedTime: 'durasi x 0.2' },
  auto_clip: { description: 'Auto clipping by rules', priority: 'normal', estimatedTime: 'durasi x 0.4' },
  smart_crop: { description: 'Crop berdasarkan wajah', priority: 'normal', estimatedTime: 'durasi x 0.2' },
  blur_faces: { description: 'Blur wajah/objek sensitif', priority: 'normal', estimatedTime: 'durasi x 0.3' },
  render: { description: 'Render final video', priority: 'high', estimatedTime: 'durasi x 1.5' },
  caption_ai: { description: 'Generate caption AI', priority: 'normal', estimatedTime: '~5 detik' },
  image_generate: { description: 'Generate gambar AI', priority: 'normal', estimatedTime: '~10 detik' },
};

class Queue {
  constructor() {
    this.jobs = [];
    this.processing = new Set();
    this.completed = [];
    this.failed = [];
    this.listeners = new Set();
  }

  addJob(type, payload, options = {}) {
    const jobType = JOB_TYPES[type];
    if (!jobType) throw new Error(`Unknown job type: ${type}`);
    const job = {
      id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      payload,
      status: 'queued',
      priority: JOB_PRIORITY[options.priority || jobType.priority] ?? JOB_PRIORITY.normal,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      error: null,
      result: null,
      progress: 0,
      progressMsg: '',
      retries: 0,
      maxRetries: options.maxRetries ?? 2,
      dependsOn: options.dependsOn || [],
    };
    this.jobs.push(job);
    this.jobs.sort((a, b) => a.priority - b.priority || a.createdAt - b.createdAt);
    this._notify();
    return job;
  }

  getJob(jobId) {
    return this.jobs.find(j => j.id === jobId) || this.completed.find(j => j.id === jobId) || this.failed.find(j => j.id === jobId);
  }

  getQueue() {
    return { queued: this.jobs.filter(j => j.status === 'queued'), processing: Array.from(this.processing), completed: this.completed.slice(-20), failed: this.failed.slice(-10) };
  }

  _processNext() {
    if (this.processing.size >= 4) return;
    const next = this.jobs.find(j => {
      if (j.status !== 'queued') return false;
      return j.dependsOn.every(depId => this.completed.some(c => c.id === depId));
    });
    if (!next) return;
    next.status = 'processing';
    next.startedAt = Date.now();
    this.processing.add(next.id);
    this._notify();
    this._execute(next);
  }

  async _execute(job) {
    try {
      const handlers = this._getHandlers();
      const handler = handlers[job.type];
      if (!handler) throw new Error(`No handler for job type: ${job.type}`);
      const result = await handler(job);
      job.status = 'completed';
      job.completedAt = Date.now();
      job.result = result;
      job.progress = 100;
    } catch (err) {
      job.status = 'failed';
      job.error = err.message;
      if (job.retries < job.maxRetries) {
        job.retries++;
        job.status = 'queued';
        job.error = null;
      }
    }
    this.processing.delete(job.id);
    if (job.status === 'completed') {
      this.completed.push(job);
      this.jobs = this.jobs.filter(j => j.id !== job.id);
    } else if (job.status === 'failed') {
      this.failed.push(job);
      this.jobs = this.jobs.filter(j => j.id !== job.id);
    }
    this._notify();
    this._processNext();
  }

  _getHandlers() {
    return this.handlers || {};
  }

  setHandlers(handlers) {
    this.handlers = handlers;
    this._processNext();
  }

  onEvent(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  _notify() {
    const state = this.getQueue();
    this.listeners.forEach(fn => fn(state));
  }

  cancelJob(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job || job.status === 'processing') return false;
    job.status = 'cancelled';
    this.jobs = this.jobs.filter(j => j.id !== jobId);
    this._notify();
    return true;
  }

  retryFailed(jobId) {
    const job = this.failed.find(j => j.id === jobId);
    if (!job) return false;
    this.failed = this.failed.filter(j => j.id !== jobId);
    job.status = 'queued';
    job.error = null;
    job.retries = 0;
    this.jobs.push(job);
    this._notify();
    this._processNext();
    return true;
  }

  clearCompleted() { this.completed = []; this._notify(); }
  clearFailed() { this.failed = []; this._notify(); }

  static getJobTypes() { return JOB_TYPES; }
  static getPriority() { return JOB_PRIORITY; }
}

export const queueSystem = new Queue();
export { JOB_PRIORITY, JOB_TYPES };
