import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase Client (Admin / Service Role for verification)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize AI Clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' });
const groq = new OpenAI({ 
  apiKey: process.env.GROQ_API_KEY || '', 
  baseURL: 'https://api.groq.com/openai/v1' 
});

// Middleware
app.use(cors());
app.use(express.json());

// Auth Middleware (Verify Supabase JWT)
const requireAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Missing Token' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Token' });
  }

  req.user = user;
  next();
};

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'ClipperAI Backend is running!' });
});

// AI Processing Route (Protected)
app.post('/api/ai/process', requireAuth, async (req, res) => {
  const { taskId, inputData, config, route } = req.body;
  
  console.log(`[AI Gateway] Processing taskId: ${taskId}`);

  try {
    if (taskId === 'caption_premium') {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in backend/.env");
      }

      const { topic, tone, platforms, brandName, brandCTA } = inputData;
      
      // Select the model
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        Anda adalah seorang ahli Social Media Copywriter (Copywriting Expert) yang sangat handal membuat konten viral.
        
        Buatkan konten sosial media dengan parameter berikut:
        Topik: ${topic}
        Tone (Nada Suara): ${tone}
        Platform Target: ${platforms.join(', ')}
        Nama Brand (Opsional): ${brandName || '-'}
        Call to Action (Opsional): ${brandCTA || '-'}
        
        Aturan wajib:
        1. Kembalikan hasil dalam format JSON VALID tanpa markdown backticks (\`\`\`).
        2. Format JSON harus persis seperti ini:
        {
          "captions": {
            "platform_id_1": "Teks caption untuk platform ini",
            "platform_id_2": "Teks caption untuk platform ini"
          },
          "hooks": "3-5 baris variasi hook (kalimat pembuka) yang sangat memancing rasa penasaran",
          "hashtags": "10-15 hashtag yang relevan, dipisahkan spasi"
        }
        3. Pastikan format teks panjang untuk caption memiliki line break (\\n).
      `;

      let responseText = '';
      const selectedProvider = route?.provider || 'premium';

      console.log(`Sending prompt to ${selectedProvider}...`);

      if (selectedProvider === 'openSource' && process.env.GROQ_API_KEY) {
        const completion = await groq.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "llama-3.1-70b-versatile",
          temperature: 0.7,
        });
        responseText = completion.choices[0].message.content;
      } else if (selectedProvider === 'premium' && process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          messages: [{ role: "user", content: prompt }],
          model: "gpt-4o-mini", 
          temperature: 0.7,
        });
        responseText = completion.choices[0].message.content;
      } else {
        if (!process.env.GEMINI_API_KEY) throw new Error("No AI Provider API Keys available.");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        responseText = result.response.text();
      }
      
      const cleanedJSON = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJSON);

      res.json({ success: true, ...parsedData });

    } else if (taskId === 'image_generate') {
      const { prompt, style, output } = inputData;
      
      let imageUrls = [];

      try {
        if (process.env.OPENAI_API_KEY) {
          console.log('Sending DALL-E 3 prompt...');
          const enhancedPrompt = `Gaya: ${style}. ${prompt}`;
          
          // DALL-E 3 request (costly, usually we just generate 1)
          const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: enhancedPrompt,
            n: 1,
            size: "1024x1024",
          });
          
          imageUrls.push(response.data[0].url);
        } else {
          throw new Error("DALL-E requires OPENAI_API_KEY");
        }
      } catch (err) {
        console.warn("DALL-E generation failed or skipped, returning fallback URL.");
        // Fallback placeholder image (using a public SVG/image generation service or just SVG string)
        const hue = Math.floor(Math.random() * 360);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:hsl(${hue},70%,50%)"/><stop offset="100%" style="stop-color:hsl(${(hue+60)%360},80%,35%)"/></linearGradient></defs><rect width="600" height="900" fill="url(#g)" rx="8"/><text x="300" y="440" fill="white" font-size="48" font-family="sans-serif" text-anchor="middle" font-weight="bold" opacity="0.9">${style.toUpperCase()}</text><text x="300" y="490" fill="white" font-size="18" font-family="sans-serif" text-anchor="middle" opacity="0.6">AI Generated Preview</text></svg>`;
        imageUrls.push('data:image/svg+xml,' + encodeURIComponent(svg));
      }

      res.json({
        success: true,
        images: imageUrls.map((url, i) => ({
          id: `creative-${Date.now()}-${i}`,
          url,
          type: output,
          style: style,
          prompt: prompt,
          score: Math.floor(Math.random() * 30) + 70,
          watermark: true,
          previewUrl: url
        }))
      });

    } else if (taskId === 'video_analysis') {
      // Mocked deep video analysis via LLM JSON generation
      const { url, clipCount } = inputData;
      
      const prompt = `Anda adalah seorang ahli pemotongan video (Video Editor) spesialis TikTok dan Reels. 
        Tugas Anda adalah membuat struktur data JSON berisi ${clipCount || 5} potongan (clip) paling viral dari sebuah video panjang fiktif.
        Kembalikan format JSON murni:
        {
          "clips": [
            {
              "id": "ID_Unik",
              "startTime": "00:00",
              "endTime": "00:45",
              "viralScore": 95,
              "reasons": ["Sangat emosional", "Visual menarik"],
              "hook": "Kalimat pertama yang diucapkan"
            }
          ]
        }`;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const cleanedJSON = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedData = JSON.parse(cleanedJSON);

      res.json({
        success: true,
        clips: parsedData.clips.map((c, i) => {
          const start = parseInt(c.startTime?.split(':')[1] || c.startTime || 0) || (i * 15);
          const end = parseInt(c.endTime?.split(':')[1] || c.endTime || 15) || (start + 15);
          return {
            id: c.id || `clip-${Date.now()}-${i}`,
            start,
            end,
            duration: end - start,
            viralScore: c.viralScore || Math.floor(Math.random() * 35 + 65),
            hookScore: Math.floor(Math.random() * 30 + 70),
            retentionPrediction: Math.floor(Math.random() * 20 + 80),
            engagementPrediction: Math.floor(Math.random() * 25 + 65),
            reasons: Array.isArray(c.reasons) ? c.reasons : [c.reasons || 'Hook kuat'],
            highlights: ['terbaik', 'viral', 'potensial', 'hook', 'cerita'][Math.floor(Math.random() * 5)],
            thumbnail: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect width="100%" height="100%" fill="#4f46e5"/><text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle">Clip ${i + 1}</text></svg>`),
            previewUrl: 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225"><rect width="100%" height="100%" fill="#4f46e5"/><text x="50%" y="50%" fill="white" font-family="sans-serif" text-anchor="middle">Clip ${i + 1}</text></svg>`),
            transcript: 'Contoh transkrip untuk segmen ini...',
            hookText: c.hook || 'Coba lihat ini!'
          };
        }),
        transcript: "[Transkripsi AI Lengkap Berhasil Di-generate]"
      });

    } else {
      res.json({
        success: true,
        result: `Mocked success for task: ${taskId}`
      });
    }
  } catch (error) {
    console.error('Error processing AI task:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// Social Media Publish Route (Protected)
app.post('/api/publish', requireAuth, async (req, res) => {
  const { caption, file, isScheduled, scheduledTime, platforms } = req.body;
  
  console.log(`[Publishing] Scheduling to ${platforms?.join(',')} for ${isScheduled ? scheduledTime : 'Now'}`);
  
  // TO DO: Actually call Instagram/TikTok APIs here using Supabase stored credentials
  await new Promise(r => setTimeout(r, 1000)); 

  res.json({ 
    success: true, 
    message: isScheduled ? 'Berhasil dijadwalkan' : 'Berhasil dipublikasikan' 
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
