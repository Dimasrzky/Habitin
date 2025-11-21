// server.js (Backend)
const express = require('express');
const { Pool } = require('pg');
const app = express();

const pool = new Pool({
  host: 'localhost',
  database: 'habitin_db',
  user: 'your_user',
  password: 'your_password',
  port: 5432,
});

app.use(express.json());

// Endpoint untuk simpan user baru
app.post('/api/users', async (req, res) => {
  const { firebase_uid, email, nama, created_at } = req.body;
  
  try {
    const result = await pool.query(
      'INSERT INTO users (firebase_uid, email, nama, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
      [firebase_uid, email, nama, created_at]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint untuk get user by firebase_uid
app.get('/api/users/:firebase_uid', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [req.params.firebase_uid]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));