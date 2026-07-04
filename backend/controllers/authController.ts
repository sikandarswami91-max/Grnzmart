import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'genzmart-super-secret-key-2026';

// Helper to generate JWT
const generateToken = (id: string, email: string) => {
  return jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '30d' });
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields' });
      return;
    }

    // Check if user exists
    const existingUser = UserModel.findOne({ email });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists with this email' });
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = UserModel.create({
      name,
      email,
      password: hashedPassword,
      role: role === 'admin' ? 'admin' : 'user',
      profilePicture: ''
    });

    const token = generateToken(user.id, user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = UserModel.findOne({ email });
    if (!user || !user.password) {
      res.status(401).json({ success: false, message: 'Invalid Email' });
      return;
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid Password' });
      return;
    }

    const token = generateToken(user.id, user.email);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        createdAt: user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        profilePicture: req.user.profilePicture || '',
        createdAt: req.user.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { name, profilePicture } = req.body;
    const updates: any = {};

    if (name) updates.name = name;
    if (profilePicture !== undefined) updates.profilePicture = profilePicture;

    const updatedUser = UserModel.findByIdAndUpdate(req.user.id, updates);

    if (!updatedUser) {
      res.status(400).json({ success: false, message: 'Failed to update profile' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture || '',
        createdAt: updatedUser.createdAt
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user || !req.user.password) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { oldPassword: bodyOldPassword, currentPassword, newPassword } = req.body;
    const oldPassword = bodyOldPassword || currentPassword;

    if (!oldPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide old and new passwords' });
      return;
    }

    // Validate old password
    const isMatch = await bcrypt.compare(oldPassword, req.user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password' });
      return;
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    UserModel.findByIdAndUpdate(req.user.id, { password: hashedPassword });

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide email' });
      return;
    }

    const user = UserModel.findOne({ email });
    if (!user) {
      res.status(404).json({ success: false, message: 'No account with that email' });
      return;
    }

    // Mock reset token
    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '15m' });

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email (Mocked)',
      resetToken // Returned in response for testing convenience in this preview environment!
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(400).json({ success: false, message: 'Required fields missing' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    const user = UserModel.findById(decoded.id);

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    UserModel.findByIdAndUpdate(user.id, { password: hashedPassword });

    res.status(200).json({ success: true, message: 'Password reset successful. You can now login.' });
  } catch (error: any) {
    res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Profile Picture Specific Endpoints
export const uploadProfilePicture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const { image } = req.body; // Base64 image
    if (!image) {
      res.status(400).json({ success: false, message: 'No image data provided' });
      return;
    }

    const updated = UserModel.findByIdAndUpdate(req.user.id, { profilePicture: image });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profilePicture: updated?.profilePicture || ''
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

export const removeProfilePicture = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    UserModel.findByIdAndUpdate(req.user.id, { profilePicture: '' });

    res.status(200).json({
      success: true,
      message: 'Profile picture removed successfully',
      profilePicture: ''
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};
