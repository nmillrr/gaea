import { Request, Response } from 'express';
import { AppDataSource } from '../db/init';
import { User } from '../entities/User';
import { LoginRequestBody, RegisterRequestBody } from '../types';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Resolve the repository lazily so the DataSource can be initialized (or mocked) first
const userRepository = () => AppDataSource.getRepository(User);

// Generate JWT token for a user
const generateToken = (user: User): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'; // 7 days by default
  
  return jwt.sign(
    { id: user.id, email: user.email },
    jwtSecret,
    { expiresIn }
  );
};

// Register a new user
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, username }: RegisterRequestBody = req.body;

    // Check if required fields are provided
    if (!email || !password || !username) {
      res.status(400).json({ message: 'Email, password, and username are required' });
      return;
    }

    // Check if user already exists
    const existingUser = await userRepository().findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'User with this email already exists' });
      return;
    }

    // Hash the password
    const saltRounds = 12; // Higher cost factor for better security
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create new user
    const user = new User();
    user.email = email;
    user.username = username;
    user.password_hash = passwordHash;
    user.created_at = new Date();

    // Save user to database
    await userRepository().save(user);

    // Generate JWT token
    const token = generateToken(user);

    // Return token
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

// Login an existing user
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // "email" doubles as a generic identifier — it may be the account's
    // email or its username, matching the "Username or email" login field
    const { email: identifier, password }: LoginRequestBody = req.body;

    // Check if required fields are provided
    if (!identifier || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    // Find user by email or username
    const user = await userRepository().findOne({
      where: [{ email: identifier }, { username: identifier }]
    });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return token
    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
};