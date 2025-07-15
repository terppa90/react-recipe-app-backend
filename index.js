import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import recipeRoutes from './routes/recipeRoutes.js';
import authRoutes from './routes/authRoutes.js';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
app.use(
  cors({
    // origin: 'http://localhost:5173',
    origin: 'https://react-recipe-app-2025.netlify.app',
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(
  express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 10000 })
);

app.use(cookieParser()); // Pitää olla ennen routeja

// eslint-disable-next-line no-undef
await mongoose.connect(process.env.MONGO_URI);

app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);

app.listen(3001, () => {
  console.log('Palvelin käynnissä http://localhost:3001');
});
