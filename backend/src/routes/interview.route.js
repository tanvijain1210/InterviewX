import express from "express";
import multer from "multer";
import  {analysisResume, submitAnswers, generateQuestions, getInterviewReport, getallInterviews,getCurrInterviewReport}  from "../controllers/interview.controller.js";
import { upload } from "../middlewares/multer.js";
import isAuth from "../middlewares/isAuth.js";
const interviewRouter = express.Router();

interviewRouter.post('/resume',isAuth , upload.single('resume'),analysisResume);
interviewRouter.post('/generate-questions',isAuth, generateQuestions);
interviewRouter.post('/submit-answer',isAuth, submitAnswers);
interviewRouter.post('/generate-report', isAuth, getInterviewReport);
interviewRouter.get('/getAllInterviews', isAuth, getallInterviews);
interviewRouter.get('/report/:id', isAuth, getCurrInterviewReport);
export default interviewRouter;