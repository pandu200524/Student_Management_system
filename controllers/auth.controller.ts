import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student'
    });

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password +refreshToken');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        accessToken
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await User.findOne({
      _id: decoded.userId,
      refreshToken
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role
    });

    res.json({
      success: true,
      data: { accessToken }
    });
  } catch (error: any) {
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};