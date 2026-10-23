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
    console.error('[HealthCheck] Database query failed:', err.message || err);
    dbStatus = `unhealthy: ${err.message || err.code || 'Connection failed'}`;
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
      model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
      status: aiStatus
    }
  });
}
