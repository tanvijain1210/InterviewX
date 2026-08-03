import fs from 'fs';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { AskAi } from '../services/openRouter.services.js';
import userModel from '../models/user.model.js';
import Interview from '../models/interview.model.js';

export const analysisResume = async (req, res) => {
  let file = null;

  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume required' });
    }

    file = req.file.path;
    const filebuffer = await fs.promises.readFile(file);
    const fileContent = new Uint8Array(filebuffer);

    const pdf = await pdfjsLib.getDocument({ data: fileContent }).promise;
    const numPages = pdf.numPages;
    let textContent = '';

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const text = await page.getTextContent();
      textContent += text.items.map((item) => item.str).join(' ') + ' ';
    }

    const messages = [
      {
        role: "system",
        content: `
Extract structured data from resume.

Return strictly JSON:
{
  "role": "string",
  "experience": "string",
  "projects": ["project1", "project2"],
  "skills": ["skill1", "skill2"]
}
`
      },
      {
        role: "user",
        content: textContent
      }
    ];

    const aiResponse = await AskAi({ messages });
    const cleanedResponse = aiResponse.replace(/```json|```/g, '').trim();
    const structuredData = JSON.parse(cleanedResponse);

    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    return res.status(200).json({
      success: true,
      message: 'Resume analyzed successfully',
      data: {
        role: structuredData.role,
        experience: structuredData.experience,
        projects: structuredData.projects,
        skills: structuredData.skills,
        textContent
      }
    });

  } catch (err) {
    if (file && fs.existsSync(file)) {
      fs.unlinkSync(file);
    }

    console.error('Error analyzing resume:', err);
    return res.status(500).json({
      success: false,
      message: 'Error analyzing resume'
    });
  }
};

export const generateQuestions = async (req, res) => {
  try {
    const { role, experience, skills, mode, project, textContent } = req.body;

    const trimmedRole = role?.trim();
    const trimmedExperience = experience?.trim();
    const trimmedMode = mode?.trim();

    if (!trimmedRole || !trimmedExperience || !trimmedMode) {
      return res.status(400).json({
        success: false,
        message: 'Role, experience, and mode are required',
      });
    }

    const user = await userModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.credit < 50) {
      return res.status(403).json({ success: false, message: 'Insufficient credits' });
    }

    const projectText = Array.isArray(project)
      ? project.join(' ')
      : project || 'None';
    const skillsText = Array.isArray(skills) ? skills.join(' ') : skills || '';
    const safeResume = textContent || projectText || skillsText || 'No details provided';

    const userPrompt = `
      Role: ${trimmedRole}
      Experience: ${trimmedExperience}
      InterviewMode: ${trimmedMode}
      Projects: ${projectText}
      Skills: ${skillsText}
      Resume: ${safeResume}
    `;

    const messages = [
      {
        role: 'system',
        content: `
You are a real human interviewer conducting a professional interview.
Speak in simple, natural English as if you are directly talking to the candidate.
Generate exactly 5 interview questions.

Strict Rules:
- Each question must contain between 15 and 25 words.
- Each question must be a single complete sentence.
- Do NOT number them.
- Do NOT add explanations.
- Do NOT add extra text before or after.
- One question per line only.
- Keep language simple and conversational.
- Questions must feel practical and realistic.

Difficulty progression:
Question 1 → easy  
Question 2 → easy  
Question 3 → medium  
Question 4 → medium  
Question 5 → hard  

Make questions based on the candidate's role, experience, interviewMode, projects, skills, and resume details.
`,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ];

    const aiResponse = await AskAi({ messages });

    const questionsArray = aiResponse
      .split('\n')
      .map((q) => q.replace(/^\d+[\.\)]\s*/, '').trim())
      .filter((q) => q.length > 0);

    const timeLimits = [60, 60, 90, 90, 120];

    // FIX: Explicitly initialize answer and feedback fields
    const formattedQuestions = questionsArray.map((q, index) => ({
      question: q,
      difficulty: index < 2 ? 'easy' : index < 4 ? 'medium' : 'hard',
      timelimit: timeLimits[index] || 60,
      answer: '',
      feedback: '',
      score: 0,
      confidence: 0,
      communication: 0,
      correctness: 0
    }));

    user.credit = user.credit - 50;
    await user.save();

    const interview = await Interview.create({
      userId: req.userId,
      role: trimmedRole,
      experience: trimmedExperience,
      mode: trimmedMode,
      resumeText: safeResume,
      questions: formattedQuestions,
      status: 'Incompleted'
    });

    return res.status(200).json({
      success: true,
      message: 'Questions generated successfully',
      data: {
        interviewId: interview._id,
        questions: formattedQuestions,
      },
    });
  } catch (err) {
    console.error('Error generating questions:', err);
    return res.status(500).json({
      success: false,
      message: 'Error generating questions',
    });
  }
};

export const submitAnswers = async (req, res) => {
  try {
    const { interviewId, answer, questionIndex, timeTaken } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    if (questionIndex === undefined || !interview.questions[questionIndex]) {
      return res.status(400).json({ success: false, message: 'Invalid question index' });
    }

    const question = interview.questions[questionIndex];
    const trimmedAnswer = answer?.trim() || '';
    const timelimit = question.timelimit || 60;

    const isTimeout = timeTaken && Number(timeTaken) > timelimit;
    const isNoAnswer = trimmedAnswer.length === 0;

    if (isNoAnswer || isTimeout) {
      question.answer = isNoAnswer ? 'No answer provided' : trimmedAnswer;
      question.feedback = isTimeout
        ? 'Time limit exceeded before an answer could be properly submitted.'
        : 'No answer was submitted for this question.';
      question.score = 0;
      question.confidence = 0;
      question.communication = 0;
      question.correctness = 0;

      // FIX: Mark modified for Mongoose to save array mutations
      interview.markModified('questions');
      await interview.save();

      return res.status(200).json({
        success: true,
        message: isTimeout ? 'Time limit exceeded' : 'No answer submitted',
        data: { question },
      });
    }

    const evaluationPrompt = [
      {
        role: 'system',
        content: `
You are an expert technical interviewer evaluating a candidate's answer.

Evaluate the candidate's answer based on the role (${interview.role}) and experience level (${interview.experience}).

Return ONLY a valid JSON object matching this structure (no markdown formatting, no code blocks):
{
  "score": number (0-10),
  "confidence": number (0-10),
  "communication": number (0-10),
  "correctness": number (0-10),
  "feedback": "2-3 constructive sentences explaining strengths and room for improvement."
}
`,
      },
      {
        role: 'user',
        content: `
Question: ${question.question}
Candidate's Answer: ${trimmedAnswer}
Time Taken: ${timeTaken || 0} seconds (Time Limit: ${timelimit} seconds)
`,
      },
    ];

    let aiFeedbackRaw = await AskAi({ messages: evaluationPrompt });
    aiFeedbackRaw = aiFeedbackRaw.replace(/```json|```/g, '').trim();
    
    let evaluation;
    try {
      evaluation = JSON.parse(aiFeedbackRaw);
    } catch (parseError) {
      console.warn('Failed to parse AI JSON evaluation, falling back to default structure:', parseError);
      evaluation = {
        score: 5,
        confidence: 5,
        communication: 5,
        correctness: 5,
        feedback: 'Answer recorded. Evaluated based on overall content.',
      };
    }

    // Update subdocument properties
    question.answer = trimmedAnswer;
    question.score = evaluation.score || 0;
    question.confidence = evaluation.confidence || 0;
    question.communication = evaluation.communication || 0;
    question.correctness = evaluation.correctness || 0;
    question.feedback = evaluation.feedback || 'Answer evaluated.';

    // FIX: Safe navigation operator for checking if all questions answered
    const allAnswered = interview.questions.every((q) => q.answer && q.answer.trim().length > 0);
    if (allAnswered) {
      interview.status = 'completed';
      const totalScore = interview.questions.reduce((acc, q) => acc + (q.score || 0), 0);
      interview.finalScore = Math.round((totalScore / interview.questions.length) * 10);
    }

    // 🔑 FIX: Inform Mongoose that nested array subdocuments have changed
    interview.markModified('questions');
    await interview.save();

    console.log(`Answer submitted for question index ${questionIndex} in interview ${interviewId}.`);
    return res.status(200).json({
      success: true,
      message: 'Answer submitted and evaluated successfully',
      data: { question },
    });
  } catch (err) {
    console.error('Error submitting answer:', err);
    return res.status(500).json({ success: false, message: 'Error submitting answer' });
  }
};

export const getInterviewReport = async (req, res) => {
  try {
    const { interviewId } = req.body;
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    const totalquestions = interview.questions.length;
    const answeredQuestions = interview.questions.filter((q) => q.answer && q.answer.trim().length > 0).length;
    const unansweredQuestions = totalquestions - answeredQuestions;
    
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;
    
    interview.questions.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    const finalScore = totalquestions > 0 ? Math.round((totalScore / totalquestions) * 10) : 0;
    const avgConfidence = totalquestions > 0 ? Math.round((totalConfidence / totalquestions) * 10) : 0;
    const avgCommunication = totalquestions > 0 ? Math.round((totalCommunication / totalquestions) * 10) : 0;
    const avgCorrectness = totalquestions > 0 ? Math.round((totalCorrectness / totalquestions) * 10) : 0;
   
    interview.finalScore = finalScore;
    interview.status = 'completed';
    await interview.save();

    return res.status(200).json({
      success: true,
      message: 'Interview report generated successfully',
      data: {
        totalquestions,
        answeredQuestions,
        unansweredQuestions,
        finalScore,
        avgConfidence,
        avgCommunication,
        avgCorrectness
      }
    });
    
  } catch (error) {
    console.error('Error in getInterviewReport:', error);
    return res.status(500).json({ success: false, message: 'Error generating report' });
  }
};
export const getallInterviews = async (req, res) => {
  try {
    const interviews = await Interview.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('role experience mode status finalScore createdAt questions');

    return res.status(200).json({
      success: true,
      data: { interviews }
    });
  } catch (error) {
    console.error('Error in getallInterviews:', error);
    return res.status(500).json({ success: false, message: 'Error fetching interviews' });
  }
};

export const getCurrInterviewReport = async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }

    const questionsList = interview.questions || [];
    const totalQuestions = questionsList.length;

    // Calculate totals from evaluated questions
    let totalScore = 0;
    let totalConfidence = 0;
    let totalCommunication = 0;
    let totalCorrectness = 0;

    questionsList.forEach((q) => {
      totalScore += q.score || 0;
      totalConfidence += q.confidence || 0;
      totalCommunication += q.communication || 0;
      totalCorrectness += q.correctness || 0;
    });

    // Calculate averages (avoiding division by zero)
    const finalScore = totalQuestions > 0 ? Math.round(totalScore / totalQuestions) : 0;
    const avgConfidence = totalQuestions > 0 ? Math.round(totalConfidence / totalQuestions) : 0;
    const avgCommunication = totalQuestions > 0 ? Math.round(totalCommunication / totalQuestions) : 0;
    const avgCorrectness = totalQuestions > 0 ? Math.round(totalCorrectness / totalQuestions) : 0;

    return res.status(200).json({
      success: true,
      data: {
        interview,
        metrics: {
          totalQuestions,
          finalScore,
          avgConfidence,
          avgCommunication,
          avgCorrectness
        }
      }
    });
  } catch (error) {
    console.error('Error in getCurrInterviewReport:', error);
    return res.status(500).json({ success: false, message: 'Error fetching interview report' });
  }
};