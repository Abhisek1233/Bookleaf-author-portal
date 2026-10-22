import { query } from '../database/db.js';
import { geminiProvider } from '../ai/geminiProvider.js';

export async function healthCheck(req, res) {
  let dbStatus = 'healthy';
  let dbLatencyMs = 0;

  try {
    const start = Date.now();
    await query('SELECT 1');
    dbLatencyMs = Date.now() - start;
  } catch (err) {
    dbStatus = `unhealthy: ${err.message}`;
  }

  const aiStatus = geminiProvider.isConfigured() ? 'configured' : 'fallback-heuristics-active';

  const isHealthy = dbStatus === 'healthy';

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'OK' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime_seconds: process.uptime(),
    database: {
      status: dbStatus,
      latency_ms: dbLatencyMs
    },
    ai_service: {
      provider: 'Google Gemini',
      model: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      status: aiStatus
    }
  });
}
