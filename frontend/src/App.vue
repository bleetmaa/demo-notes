<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Note {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const notes = ref<Note[]>([])
const isLoading = ref(false)
const error = ref('')
const newNote = ref({ title: '', content: '' })
const editingNote = ref<Note | null>(null)

// API configuration - will work both locally and with domain
const API_BASE = location.hostname === 'localhost' || location.hostname === '127.0.0.1' 
  ? 'http://localhost:3000' 
  : `http://${location.hostname}:30000`

const fetchNotes = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await fetch(`${API_BASE}/api/notes`)
    if (!response.ok) throw new Error('Failed to fetch notes')
    notes.value = await response.json()
  } catch (err) {
    error.value = 'Failed to load notes'
    console.error('Error fetching notes:', err)
  } finally {
    isLoading.value = false
  }
}

const createNote = async () => {
  if (!newNote.value.title.trim()) return
  
  try {
    const response = await fetch(`${API_BASE}/api/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote.value)
    })
    if (!response.ok) throw new Error('Failed to create note')
    newNote.value = { title: '', content: '' }
    await fetchNotes()
  } catch (err) {
    error.value = 'Failed to create note'
    console.error('Error creating note:', err)
  }
}

const updateNote = async () => {
  if (!editingNote.value) return
  
  try {
    const response = await fetch(`${API_BASE}/api/notes/${editingNote.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: editingNote.value.title,
        content: editingNote.value.content
      })
    })
    if (!response.ok) throw new Error('Failed to update note')
    editingNote.value = null
    await fetchNotes()
  } catch (err) {
    error.value = 'Failed to update note'
    console.error('Error updating note:', err)
  }
}

const deleteNote = async (id: string) => {
  if (!confirm('Are you sure you want to delete this note?')) return
  
  try {
    const response = await fetch(`${API_BASE}/api/notes/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete note')
    await fetchNotes()
  } catch (err) {
    error.value = 'Failed to delete note'
    console.error('Error deleting note:', err)
  }
}

const startEdit = (note: Note) => {
  editingNote.value = { ...note }
}

const cancelEdit = () => {
  editingNote.value = null
}

onMounted(fetchNotes)
</script>

<template>
  <div class="app">
    <header class="header">
      <h1>📝 Demo Notes</h1>
      <p>A simple note-taking app on trailerrent.se</p>
    </header>

    <main class="main">
      <!-- Error display -->
      <div v-if="error" class="error">
        {{ error }}
        <button @click="fetchNotes" class="retry-btn">Retry</button>
      </div>

      <!-- New note form -->
      <div class="note-form">
        <h2>Create New Note</h2>
        <input 
          v-model="newNote.title" 
          placeholder="Note title..." 
          class="title-input"
          @keydown.enter="createNote"
        >
        <textarea 
          v-model="newNote.content" 
          placeholder="Write your note here..." 
          class="content-input"
          rows="3"
        ></textarea>
        <button @click="createNote" :disabled="!newNote.title.trim()" class="create-btn">
          Create Note
        </button>
      </div>

      <!-- Loading state -->
      <div v-if="isLoading" class="loading">Loading notes...</div>

      <!-- Notes list -->
      <div v-else class="notes-grid">
        <div v-for="note in notes" :key="note.id" class="note-card">
          <div v-if="editingNote?.id === note.id" class="edit-form">
            <input v-model="editingNote.title" class="edit-title">
            <textarea v-model="editingNote.content" class="edit-content" rows="3"></textarea>
            <div class="edit-actions">
              <button @click="updateNote" class="save-btn">Save</button>
              <button @click="cancelEdit" class="cancel-btn">Cancel</button>
            </div>
          </div>
          <div v-else>
            <h3 class="note-title">{{ note.title }}</h3>
            <p class="note-content">{{ note.content }}</p>
            <div class="note-meta">
              <small>Updated: {{ new Date(note.updatedAt).toLocaleDateString() }}</small>
            </div>
            <div class="note-actions">
              <button @click="startEdit(note)" class="edit-btn">Edit</button>
              <button @click="deleteNote(note.id)" class="delete-btn">Delete</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="!isLoading && notes.length === 0 && !error" class="empty-state">
        <p>No notes yet. Create your first note above! 🚀</p>
      </div>
    </main>

    <footer class="footer">
      <p>Hosted on Kubernetes • trailerrent.se</p>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  text-align: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
}

.header h1 {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
}

.header p {
  margin: 0.5rem 0 0 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.main {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.error {
  background: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.retry-btn {
  background: #c33;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.note-form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.note-form h2 {
  margin: 0 0 1rem 0;
  color: #333;
}

.title-input, .content-input {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

.title-input:focus, .content-input:focus {
  outline: none;
  border-color: #667eea;
}

.content-input {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.create-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.create-btn:hover:not(:disabled) {
  background: #5a6fd8;
}

.create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  color: white;
  font-size: 1.2rem;
  padding: 2rem;
}

.notes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.note-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.note-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.note-title {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 1.2rem;
  font-weight: 600;
}

.note-content {
  margin: 0 0 1rem 0;
  color: #666;
  line-height: 1.5;
  white-space: pre-wrap;
}

.note-meta {
  margin-bottom: 1rem;
  color: #999;
  font-size: 0.85rem;
}

.note-actions {
  display: flex;
  gap: 0.5rem;
}

.edit-btn, .delete-btn, .save-btn, .cancel-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.edit-btn {
  background: #f0f0f0;
  color: #333;
}

.edit-btn:hover {
  background: #e0e0e0;
}

.delete-btn {
  background: #ff4757;
  color: white;
}

.delete-btn:hover {
  background: #ff3742;
}

.save-btn {
  background: #2ed573;
  color: white;
}

.save-btn:hover {
  background: #26d065;
}

.cancel-btn {
  background: #f1f2f6;
  color: #333;
}

.cancel-btn:hover {
  background: #ddd;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.edit-title, .edit-content {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.edit-content {
  resize: vertical;
  min-height: 60px;
  font-family: inherit;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-state {
  text-align: center;
  color: white;
  font-size: 1.1rem;
  padding: 3rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.footer {
  text-align: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.1);
  color: white;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .main {
    padding: 1rem;
  }
  
  .notes-grid {
    grid-template-columns: 1fr;
  }
  
  .header h1 {
    font-size: 2rem;
  }
}
</style>
