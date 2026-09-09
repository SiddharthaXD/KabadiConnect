import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for base64 audio data
  app.use(express.json({ limit: '25mb' }));

  // Initialize Gemini API client on server side
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  // Health check endpoint
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // AI Speech-to-Text Audio Transcription Endpoint
  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType = 'audio/webm', language = 'hi' } = req.body;

      if (!audioBase64) {
        return res.status(400).json({ error: 'Audio data is required' });
      }

      const langPrompt =
        language === 'mr'
          ? 'Marathi (Devanagari script)'
          : language === 'en'
          ? 'English / Hinglish (Latin script)'
          : 'Hindi (Devanagari script)';

      const prompt = `You are a speech-to-text audio transcriber.
Target Language Context: ${langPrompt} (support natural code-switched Hindi, Marathi, and English as spoken).
Instructions:
1. Accurately transcribe the spoken voice from the audio with high fidelity.
2. Ensure correct spelling, punctuation, and number formatting (e.g. weights in kg, money in ₹ or rupees).
3. Output ONLY the clean verbatim transcription text. Do NOT add preamble, quotes, markdown formatting, or explanations.`;

      // Use gemini-3.5-transcribe model for audio transcription
      let transcriptText = '';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-transcribe',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: audioBase64,
                },
              },
              { text: prompt },
            ],
          },
        });
        transcriptText = response.text ? response.text.trim() : '';
      } catch (geminiError) {
        console.warn('gemini-3.5-transcribe model error, trying gemini-3.8-flash fallback:', geminiError);
        // Fallback model for audio content
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: mimeType || 'audio/webm',
                  data: audioBase64,
                },
              },
              { text: prompt },
            ],
          },
        });
        transcriptText = fallbackResponse.text ? fallbackResponse.text.trim() : '';
      }

      res.json({ transcript: transcriptText });
    } catch (error: any) {
      console.error('Audio transcription route error:', error);
      res.status(500).json({ error: error?.message || 'Failed to process audio transcription' });
    }
  });

  // AI Transcript Accuracy Enhancer Endpoint
  app.post('/api/enhance-transcript', async (req, res) => {
    try {
      const { text, language = 'hi' } = req.body;
      if (!text || !text.trim()) {
        return res.status(400).json({ error: 'Text content is required' });
      }

      const prompt = `Clean up and correct speech-to-text voice recognition errors in this raw input transcript.
Language context: ${language === 'mr' ? 'Marathi' : language === 'en' ? 'English' : 'Hindi'}.
Raw Speech Text: "${text}"
Tasks:
- Fix phonetic spelling errors, duplicate repeated words caused by voice typing, missing spaces, and garbled symbols.
- Preserve the exact original meaning, scrap weights (kg), rate figures (₹/kg), and user intent.
- Output ONLY the corrected text. No conversational filler or explanations.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const cleanedText = response.text ? response.text.trim() : text;
      res.json({ enhancedText: cleanedText });
    } catch (error: any) {
      console.error('Enhance transcript route error:', error);
      res.status(500).json({ error: error?.message || 'Failed to enhance transcript' });
    }
  });

  // Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
