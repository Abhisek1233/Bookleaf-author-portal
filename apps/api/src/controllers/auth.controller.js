import { authService } from '../services/auth.service.js';
import { validateLogin } from '../validators.js';

export async function login(req, res, next) {
  try {
    const validated = validateLogin(req.body);
    const result = await authService.login(validated);
    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req, res, next) {
  try {
    const result = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function logout(req, res) {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}
