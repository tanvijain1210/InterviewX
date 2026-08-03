import express from 'express';
import generateToken from '../config/token.js';
import User from '../models/user.model.js';
// backend controller: googleAuth
export const googleAuth = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    let user = await User.findOne({ email });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name,
        email,
        credit: 200 // your default credit count
      });
    }

   // 🎯 CRITICAL FIX 1: Generate JWT Token for the session
    const token = generateToken(user._id);

    // 🎯 CRITICAL FIX 2: Set HTTP-Only Cookie so browser holds session across reloads
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    // Convert Mongoose Doc to plain Object and format response explicitly
    const userObj = user.toObject();



    return res.status(200).json({
      success: true,
      user: {
        ...userObj,
        credits: userObj.credit ?? userObj.credits ?? 200, // Explicitly map credit -> credits
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logOut = async (req, res) => {
  try {
    // Clear the JWT cookie from the client's browser
    res.clearCookie('token', {
      httpOnly: true,
      secure: true, sameSite : "none"
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to log out',
      error: err.message,
    });
  }
};


