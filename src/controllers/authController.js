import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  try {
    console.log('Signup request received:', { 
      body: req.body,
      headers: req.headers
    });
    
    const { username, email, password, role } = req.body;

    // Input validation
    if (!username || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }

    // Role validation
    const validRoles = ['adopter', 'shelter'];
    console.log('Role validation:', { receivedRole: role, validRoles, isValid: validRoles.includes(role) });
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        message: 'Invalid user role. Must be either "adopter" or "shelter"',
        receivedRole: role,
        validRoles
      });
    }
    
    // Prevent admin signup
    if (role === 'admin') {
      return res.status(403).json({ message: 'Admin accounts cannot be created through signup' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        message: existingUser.email === email 
          ? 'Email is already registered' 
          : 'Username is already taken' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role
    });

    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: newUser._id, username: newUser.username, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.status(201).json({ 
      message: 'User created successfully', 
      token,
      user: { 
        id: newUser._id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      }
    });
  } catch (error) {
    // Mongoose validation error handling
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Generic server error
    res.status(500).json({ 
      message: 'Server error during signup', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred' 
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      // Deliberate vague error message for security
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Deliberate vague error message for security
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    res.json({ 
      token,
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email, 
        role: user.role 
      }
    });
  } catch (error) {
    // Log the error for server-side tracking
    console.error('Login error:', error);

    res.status(500).json({ 
      message: 'Server error during login', 
      error: process.env.NODE_ENV === 'development' ? error.message : 'An unexpected error occurred' 
    });
  }
};
