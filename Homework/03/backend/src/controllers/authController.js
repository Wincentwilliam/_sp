const { supabase } = require('../config/supabase');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, phone_number, password } = req.body;

    console.log('Registration attempt:', { username, email });

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .or(`email.eq.${email},username.eq.${username}`)
      .maybeSingle();

    console.log('Existing user check:', { existingUser, fetchError });

    if (existingUser) {
      return res.status(409).json({
        error: 'USER_EXISTS',
        message: 'Username or email already registered',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    console.log('Inserting user with hash:', passwordHash.substring(0, 20) + '...');

    // Insert new user
    const { data: newUser, error: insertError } = await supabase
      .from('profiles')
      .insert([
        {
          username,
          email,
          phone_number: phone_number || null,
          password_hash: passwordHash,
        },
      ])
      .select('id, username, email')
      .single();

    console.log('Insert result:', { newUser, insertError });

    if (insertError) {
      console.error('Registration insert error:', insertError);
      return res.status(500).json({
        error: 'REGISTRATION_FAILED',
        message: 'Failed to create user account',
        details: insertError.message,
      });
    }

    // Generate tokens
    const token = generateToken(newUser);
    const refreshToken = generateRefreshToken(newUser);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        hasHealthProfile: false,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const { data: user, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (fetchError || !user) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password',
      });
    }

    // Check if user has health profile
    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Generate tokens
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      hasHealthProfile: !!healthProfile,
    });
    const refreshToken = generateRefreshToken(user);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        hasHealthProfile: !!healthProfile,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: 'An unexpected error occurred',
    });
  }
};

/**
 * Refresh token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'TOKEN_REQUIRED',
        message: 'Refresh token is required',
      });
    }

    // Verify refresh token (implementation depends on your JWT setup)
    // This is a simplified version
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET;

    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if (decoded.type !== 'refresh') {
      return res.status(403).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid refresh token',
      });
    }

    // Get user data
    const { data: user } = await supabase
      .from('profiles')
      .select('id, username, email')
      .eq('id', decoded.id)
      .single();

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Check health profile
    const { data: healthProfile } = await supabase
      .from('health_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // Generate new access token
    const newToken = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      hasHealthProfile: !!healthProfile,
    });

    res.json({
      token: newToken,
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(403).json({
      error: 'TOKEN_INVALID',
      message: 'Invalid or expired refresh token',
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
};
