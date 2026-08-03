// backend/src/services/openRouter.services.js
import Groq from 'groq-sdk';

export const AskAi = async ({ messages }) => {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is missing in your .env file.');
  }

  const groq = new Groq({ apiKey });

  // Convert incoming messages format or fallback to array
  const formattedMessages = messages && messages.length > 0 
    ? messages 
    : [{ role: 'user', content: 'Analyze the resume' }];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: formattedMessages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Empty response received from Groq AI.');
    }

    return content;
  } catch (err) {
    console.error('[AskAi Error]:', err.message);
    throw new Error(`AI Analysis Failed: ${err.message}`);
  }
};