import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // Gemini Client initialization
  const apiKey = process.env.GEMINI_API_KEY;
  let aiClient: GoogleGenAI | null = null;
  if (apiKey) {
    try {
      aiClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.warn('Gemini initialization warning:', err);
    }
  }

  // API Health Endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGemini: Boolean(apiKey),
      timestamp: new Date().toISOString()
    });
  });

  // AI Explanation Endpoint
  app.post('/api/explain', async (req, res) => {
    const { type, context } = req.body;

    if (!aiClient) {
      return res.json({
        available: false,
        explanation: 'AI Explanation Service is running in simulated mode. In this mode, pre-computed deterministic security insights are provided.'
      });
    }

    try {
      let prompt = '';
      if (type === 'decision') {
        prompt = `You are AgentGate's security analyst. In 2-3 friendly, beginner-accessible sentences, explain why this agent action was given the decision "${context.decision}".
Agent: ${context.agentName}
Tool: ${context.toolName}
Action description: ${context.action}
Target: ${context.target || 'None'}
Risk Level: ${context.riskLevel}
Reason provided: ${context.reason}

Rules:
1. Explain clearly what the risk is and why human oversight or automatic execution makes sense.
2. Keep it concise, professional, and accessible to non-technical users.`;
      } else if (type === 'policy_recommendation') {
        prompt = `You are AgentGate's security policy advisor. An agent was created with:
Name: ${context.name}
Description: ${context.description}
Given this purpose, recommend whether each of the following tools should be ALLOW, ASK, or BLOCK following the principle of least privilege:
- WEB_SEARCH
- READ_FILE
- WRITE_FILE
- READ_GITHUB
- CREATE_REPORT
- SEND_MESSAGE
- DATABASE_READ
- DATABASE_WRITE
- DELETE_DATA

Explain the reasoning briefly in 2-3 bullet points.`;
      } else {
        prompt = `You are AgentGate security AI. Provide a concise, beginner-friendly summary of the following AI agent activity: ${JSON.stringify(context)}.`;
      }

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      res.json({
        available: true,
        explanation: response.text
      });
    } catch (error: any) {
      console.error('Gemini API Error:', error);
      res.json({
        available: false,
        error: error.message || 'Error generating explanation',
        explanation: 'Could not connect to Gemini model at this moment. Deterministic security policies remain 100% active.'
      });
    }
  });

  // Vite integration
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`AgentGate server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
