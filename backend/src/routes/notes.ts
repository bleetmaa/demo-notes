import { Router } from 'express';
import { AppDataSource } from '../index.js';
import { Note } from '../entities/Note.js';

export const noteRouter = Router();
const noteRepository = AppDataSource.getRepository(Note);

// Get all notes
noteRouter.get('/', async (req, res) => {
  try {
    const notes = await noteRepository.find({
      order: {
        updatedAt: 'DESC'
      }
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching notes' });
  }
});

// Get a single note
noteRouter.get('/:id', async (req, res) => {
  try {
    const note = await noteRepository.findOneBy({ id: req.params.id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching note' });
  }
});

// Create a note
noteRouter.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = noteRepository.create({ title, content });
    await noteRepository.save(note);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Error creating note' });
  }
});

// Update a note
noteRouter.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await noteRepository.findOneBy({ id: req.params.id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    note.title = title;
    note.content = content;
    await noteRepository.save(note);
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Error updating note' });
  }
});

// Delete a note
noteRouter.delete('/:id', async (req, res) => {
  try {
    const note = await noteRepository.findOneBy({ id: req.params.id });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    await noteRepository.remove(note);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting note' });
  }
});
