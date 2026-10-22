import { adminService } from '../services/admin.service.js';
import {
  validateOverride,
  validateUpdateStatus,
  validateAssign,
  validateInternalNote,
  validatePublicReply
} from '../validators.js';

export async function getDashboard(req, res, next) {
  try {
    const data = await adminService.getDashboardMetrics();
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTicketQueue(req, res, next) {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const { status, category, priority, search, sort } = req.query;

    const data = await adminService.getTicketQueue({
      page,
      limit,
      status,
      category,
      priority,
      search,
      sort
    });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTicketDetail(req, res, next) {
  try {
    const { ticketId } = req.params;
    const data = await adminService.getTicketDetail(ticketId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function overrideCategoryPriority(req, res, next) {
  try {
    const { ticketId } = req.params;
    const validated = validateOverride(req.body);
    const data = await adminService.overrideCategoryPriority(ticketId, validated);
    res.status(200).json({
      success: true,
      message: 'Ticket category and priority overridden successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const { ticketId } = req.params;
    const validated = validateUpdateStatus(req.body);
    const data = await adminService.updateTicketStatus(ticketId, validated.status);
    res.status(200).json({
      success: true,
      message: `Ticket status updated to ${validated.status}`,
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function assignTicket(req, res, next) {
  try {
    const { ticketId } = req.params;
    const validated = validateAssign(req.body);
    const data = await adminService.assignTicket(ticketId, validated.admin_id);
    res.status(200).json({
      success: true,
      message: validated.admin_id ? 'Ticket assigned successfully' : 'Ticket assignment cleared',
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function addInternalNote(req, res, next) {
  try {
    const { ticketId } = req.params;
    const validated = validateInternalNote(req.body);
    const data = await adminService.addInternalNote(
      ticketId,
      req.user.id,
      req.user.name,
      validated.content
    );
    res.status(201).json({
      success: true,
      message: 'Internal note saved (visible to operations team only)',
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function sendPublicReply(req, res, next) {
  try {
    const { ticketId } = req.params;
    const validated = validatePublicReply(req.body);
    const newStatus = req.body.status || null;
    const data = await adminService.sendAdminReply({
      ticketId,
      adminId: req.user.id,
      adminName: req.user.name,
      message: validated.message,
      newStatus
    });
    res.status(201).json({
      success: true,
      message: 'Official response sent to author successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function generateAiDraft(req, res, next) {
  try {
    const { ticketId } = req.params;
    const forceRegenerate = req.query.force === 'true';
    const data = await adminService.generateAiDraft(ticketId, forceRegenerate);
    res.status(200).json({
      success: true,
      message: 'AI draft response generated successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function reassessAiClassification(req, res, next) {
  try {
    const { ticketId } = req.params;
    const data = await adminService.reassessTicketClassification(ticketId);
    res.status(200).json({
      success: true,
      message: 'Ticket AI classification and priority reassessed successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}
