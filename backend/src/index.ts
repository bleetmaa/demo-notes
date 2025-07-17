import express from 'express';
import cors from 'cors';
import { DataSource } from 'typeorm';
import { Note } from './entities/Note.js';
import { noteRouter } from './routes/notes.js';

const app = express();
const port = process.env.PORT || 3000;

// Create TypeORM connection
export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL || "postgresql://demo_user:demo_password@localhost:5432/demo_notes",
  synchronize: true,
  logging: true,
  entities: [Note],
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notes', noteRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

async function startServer() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer();
