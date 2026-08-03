import express from 'express'
import AuthRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'
import UserRouter from './routes/user.route.js';
import interviewRouter from './routes/interview.route.js';
import PaymentRouter from './routes/payment.route.js';
const app=express()
app.use(cors({
    origin: "https://interviewx-frontend-rg5o.onrender.com", credentials:true
}))
app.use(cookieParser());
app.use(express.json());
app.use('/api/auth',AuthRouter)
app.use('/api/user', UserRouter)
app.use ('/api/interview', interviewRouter)
app.use ('/api/payment', PaymentRouter)

// Catch-all for undefined route paths (prints exact missing path)
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.method} ${req.originalUrl} does not exist on this server.`
//   });
// });

// // Global Error Handler
// app.use((err, req, res, next) => {
//   console.error("Global Server Error:", err);
//   res.status(500).json({
//     success: false,
//     message: err.message || 'Internal Server Error'
//   });
// });

export default app;