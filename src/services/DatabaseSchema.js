export const TABLES = {
  users: {
    name: 'users',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      email: { type: 'VARCHAR(255)', unique: true, notNull: true },
      name: { type: 'VARCHAR(255)', notNull: true },
      password_hash: { type: 'VARCHAR(255)', notNull: true },
      role: { type: 'VARCHAR(50)', default: "'user'" },
      plan: { type: 'VARCHAR(50)', default: "'free'" },
      credits: { type: 'INTEGER', default: 50 },
      additional_credits: { type: 'INTEGER', default: 0 },
      storage_used_bytes: { type: 'BIGINT', default: 0 },
      max_storage_bytes: { type: 'BIGINT', default: 2147483648 },
      is_active: { type: 'BOOLEAN', default: true },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['email', 'plan'],
  },

  projects: {
    name: 'projects',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      user_id: { type: 'UUID', fk: 'users.id', notNull: true },
      name: { type: 'VARCHAR(255)', notNull: true },
      niche: { type: 'VARCHAR(100)' },
      status: { type: 'VARCHAR(50)', default: "'draft'" },
      thumbnail_url: { type: 'TEXT' },
      settings: { type: 'JSONB', default: "'{}'" },
      brand_kit_id: { type: 'UUID', fk: 'brand_kits.id' },
      total_duration_sec: { type: 'INTEGER', default: 0 },
      ai_cost_total: { type: 'DECIMAL(10,6)', default: 0 },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['user_id', 'status'],
  },

  videos: {
    name: 'videos',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      project_id: { type: 'UUID', fk: 'projects.id', notNull: true },
      user_id: { type: 'UUID', fk: 'users.id', notNull: true },
      original_filename: { type: 'VARCHAR(500)', notNull: true },
      storage_path: { type: 'TEXT', notNull: true },
      file_size_bytes: { type: 'BIGINT', notNull: true },
      duration_sec: { type: 'INTEGER', notNull: true },
      width: { type: 'INTEGER' },
      height: { type: 'INTEGER' },
      codec: { type: 'VARCHAR(50)' },
      format: { type: 'VARCHAR(10)' },
      source_type: { type: 'VARCHAR(50)', default: "'upload'" },
      source_url: { type: 'TEXT' },
      transcript: { type: 'JSONB' },
      transcript_status: { type: 'VARCHAR(50)', default: "'pending'" },
      audio_features: { type: 'JSONB' },
      face_regions: { type: 'JSONB' },
      scenes: { type: 'JSONB' },
      thumbnail_url: { type: 'TEXT' },
      processing_status: { type: 'VARCHAR(50)', default: "'pending'" },
      processing_jobs: { type: 'JSONB', default: "'[]'" },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['project_id', 'user_id', 'processing_status'],
  },

  clips: {
    name: 'clips',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      video_id: { type: 'UUID', fk: 'videos.id', notNull: true },
      project_id: { type: 'UUID', fk: 'projects.id', notNull: true },
      user_id: { type: 'UUID', fk: 'users.id', notNull: true },
      start_sec: { type: 'DECIMAL(10,3)', notNull: true },
      end_sec: { type: 'DECIMAL(10,3)', notNull: true },
      duration_sec: { type: 'DECIMAL(10,3)', notNull: true },
      viral_score: { type: 'INTEGER' },
      score_breakdown: { type: 'JSONB' },
      clip_type: { type: 'VARCHAR(50)', default: "'auto'" },
      transcript: { type: 'TEXT' },
      hook_text: { type: 'TEXT' },
      output_path: { type: 'TEXT' },
      render_status: { type: 'VARCHAR(50)', default: "'pending'" },
      selected_formats: { type: 'JSONB', default: "'[]'" },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['video_id', 'project_id', 'viral_score'],
  },

  captions: {
    name: 'captions',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      project_id: { type: 'UUID', fk: 'projects.id', notNull: true },
      user_id: { type: 'UUID', fk: 'users.id', notNull: true },
      platform: { type: 'VARCHAR(50)', notNull: true },
      content: { type: 'TEXT', notNull: true },
      hooks: { type: 'JSONB' },
      hashtags: { type: 'JSONB' },
      cta: { type: 'TEXT' },
      source: { type: 'VARCHAR(50)', default: "'template'" },
      tone: { type: 'VARCHAR(50)' },
      ai_cost: { type: 'DECIMAL(10,6)', default: 0 },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['project_id', 'platform'],
  },

  scheduled_posts: {
    name: 'scheduled_posts',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      project_id: { type: 'UUID', fk: 'projects.id' },
      user_id: { type: 'UUID', fk: 'users.id', notNull: true },
      clip_id: { type: 'UUID', fk: 'clips.id' },
      platform: { type: 'VARCHAR(50)', notNull: true },
      title: { type: 'VARCHAR(500)' },
      caption: { type: 'TEXT' },
      media_url: { type: 'TEXT' },
      scheduled_at: { type: 'TIMESTAMPTZ', notNull: true },
      published_at: { type: 'TIMESTAMPTZ' },
      status: { type: 'VARCHAR(50)', default: "'scheduled'" },
      platform_post_id: { type: 'VARCHAR(255)' },
      error_message: { type: 'TEXT' },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['user_id', 'status', 'scheduled_at'],
  },

  brand_kits: {
    name: 'brand_kits',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      user_id: { type: 'UUID', fk: 'users.id', unique: true, notNull: true },
      colors: { type: 'JSONB', default: "'{\"primary\": \"#6366f1\", \"secondary\": \"#8b5cf6\", \"accent\": \"#f59e0b\"}'" },
      fonts: { type: 'JSONB', default: "'{\"heading\": \"Inter\", \"body\": \"Inter\", \"subtitle\": \"Inter\", \"subtitleSize\": 28, \"subtitlePosition\": \"bottom\", \"subtitleBg\": \"#00000080\"}'" },
      logo: { type: 'TEXT' },
      watermark: { type: 'TEXT' },
      intro: { type: 'TEXT' },
      outro: { type: 'TEXT' },
      subtitle_style: { type: 'VARCHAR(100)', default: "'default'" },
      cta: { type: 'TEXT', default: "'Follow @clipperai untuk konten menarik!'" },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['user_id'],
  },

  credits_log: {
    name: 'credits_log',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      user_id: { type: 'UUID', fk: 'users.id', notNull: true },
      action: { type: 'VARCHAR(100)', notNull: true },
      amount: { type: 'INTEGER', notNull: true },
      balance_after: { type: 'INTEGER', notNull: true },
      description: { type: 'TEXT' },
      metadata: { type: 'JSONB', default: "'{}'" },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['user_id', 'created_at'],
  },

  processing_jobs: {
    name: 'processing_jobs',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      user_id: { type: 'UUID', fk: 'users.id', notNull: true },
      video_id: { type: 'UUID', fk: 'videos.id' },
      job_type: { type: 'VARCHAR(100)', notNull: true },
      status: { type: 'VARCHAR(50)', default: "'queued'" },
      priority: { type: 'INTEGER', default: 2 },
      payload: { type: 'JSONB' },
      result: { type: 'JSONB' },
      error: { type: 'TEXT' },
      progress: { type: 'INTEGER', default: 0 },
      progress_msg: { type: 'VARCHAR(255)' },
      retries: { type: 'INTEGER', default: 0 },
      max_retries: { type: 'INTEGER', default: 2 },
      ai_provider: { type: 'VARCHAR(50)' },
      ai_model: { type: 'VARCHAR(100)' },
      ai_cost: { type: 'DECIMAL(10,6)', default: 0 },
      queued_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
      started_at: { type: 'TIMESTAMPTZ' },
      completed_at: { type: 'TIMESTAMPTZ' },
    },
    indexes: ['user_id', 'status', 'job_type'],
  },

  subscriptions: {
    name: 'subscriptions',
    columns: {
      id: { type: 'UUID', pk: true, default: 'gen_random_uuid()' },
      user_id: { type: 'UUID', fk: 'users.id', unique: true, notNull: true },
      plan: { type: 'VARCHAR(50)', notNull: true },
      status: { type: 'VARCHAR(50)', default: "'active'" },
      current_period_start: { type: 'TIMESTAMPTZ', notNull: true },
      current_period_end: { type: 'TIMESTAMPTZ', notNull: true },
      payment_provider: { type: 'VARCHAR(50)' },
      payment_id: { type: 'VARCHAR(255)' },
      auto_renew: { type: 'BOOLEAN', default: true },
      created_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
      updated_at: { type: 'TIMESTAMPTZ', default: 'NOW()' },
    },
    indexes: ['user_id', 'status', 'current_period_end'],
  },
};

export function getCreateTableSQL(tableName) {
  const table = TABLES[tableName];
  if (!table) return '';
  const cols = Object.entries(table.columns).map(([name, def]) => {
    let sql = `  "${name}" ${def.type}`;
    if (def.pk) sql += ' PRIMARY KEY';
    if (def.notNull) sql += ' NOT NULL';
    if (def.unique) sql += ' UNIQUE';
    if (def.default !== undefined) sql += ` DEFAULT ${def.default}`;
    if (def.fk) sql += ` REFERENCES ${def.fk}`;
    return sql;
  });
  return `CREATE TABLE "${table.name}" (\n${cols.join(',\n')}\n);`;
}

export function getMigrationSQL() {
  return Object.keys(TABLES).map(getCreateTableSQL).join('\n\n');
}

export const DatabaseSchema = { TABLES, getCreateTableSQL, getMigrationSQL };
