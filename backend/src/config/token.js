import jwt from 'jsonwebtoken';

function generateToken(userId) {
  try {
    // 1. Pass payload as an object: { userId }
    // 2. jwt.sign is synchronous by default unless a callback is provided
    const token = jwt.sign({userId }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });
    return token;
  } catch (err) {
    console.error('Token generation error:', err);
    throw err; // Re-throw so caller knows token creation failed
  }
}

export default generateToken;