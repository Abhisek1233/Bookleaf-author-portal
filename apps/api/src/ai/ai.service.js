import crypto from 'crypto';
import { geminiProvider } from './geminiProvider.js';
import { classifyTicketHeuristic, generateDraftHeuristic } from './heuristicFallback.js';
import { query } from '../database/db.js';

export class AiService {
  /**
   * Assesses category and priority for a ticket using Gemini, falling back gracefully to heuristic rules.
   */
  async assessTicket({ subject, description, bookContext = null }) {
    try {
      if (geminiProvider.isConfigured()) {
        const aiResult = await geminiProvider.classifyAndPrioritize({
          subject,
          description,
          bookContext
        });
        return aiResult;
      }
    } catch (error) {
      console.warn('[AI Service] Gemini classification failed or rate-limited. Falling back to heuristic rules:', error.message);
    }

    // Graceful deterministic fallback
    return classifyTicketHeuristic({ subject, description, bookContext });
  }

  /**
   * Generates or fetches a cached draft response for an admin reviewing a ticket.
   */
  async getOrCreateDraftResponse({
    ticketId,
    subject,
    description,
    category,
    priority,
    authorName,
    bookContext = null,
    forceRegenerate = false
  }) {
    // Check if an existing cached draft exists for this ticket content
    const sourceHash = crypto
      .createHash('sha256')
      .update(`${subject}:${description}:${category}`)
      .digest('hex');

    if (!forceRegenerate) {
      const cached = await query(
        'SELECT draft_text, model_used, source_hash FROM ai_drafts WHERE ticket_id = $1',
        [ticketId]
      );
      if (cached.rows.length > 0 && cached.rows[0].source_hash === sourceHash) {
        return {
          draft_text: cached.rows[0].draft_text,
          model_used: cached.rows[0].model_used,
          is_cached: true
        };
      }
    }

    let resultText = '';
    let modelUsed = 'heuristic-fallback';
    let isFallback = true;

    try {
      if (geminiProvider.isConfigured()) {
        const draftResult = await geminiProvider.generateDraftResponse({
          subject,
          description,
          category,
          priority,
          authorName,
          bookContext
        });
        resultText = draftResult.draft_text;
        modelUsed = draftResult.model_used;
        isFallback = false;
      }
    } catch (error) {
      console.warn('[AI Service] Gemini draft generation failed. Using grounded heuristic draft:', error.message);
    }

    if (!resultText) {
      resultText = generateDraftHeuristic({
        subject,
        description,
        category,
        authorName,
        bookContext
      });
    }

    // Persist or update draft cache
    await query(
      `INSERT INTO ai_drafts (id, ticket_id, draft_text, source_hash, created_at, updated_at)
       VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (ticket_id) DO UPDATE
       SET draft_text = EXCLUDED.draft_text,
           source_hash = EXCLUDED.source_hash,
           updated_at = CURRENT_TIMESTAMP`,
      [
        `draft-${ticketId}`,
        ticketId,
        resultText,
        sourceHash
      ]
    );

    return {
      draft_text: resultText,
      model_used: modelUsed,
      is_fallback: isFallback,
      is_cached: false
    };
  }
}

export const aiService = new AiService();
