import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import 'dotenv/config';


import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import errorHandler from './middlewares/errorHandler.js';
import coursesRoutes from './routes/courses.js';
import instructorsRoutes from './routes/instructors.js';
import lessonsRoutes from './routes/lessons.js';
import chaptersRoutes from './routes/chapters.js';
import enrollmentsRoutes from './routes/enrollments.js';



const app = express();


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/lessons', lessonsRoutes);
app.use('/api/chapters', chaptersRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use(errorHandler);


export default app;