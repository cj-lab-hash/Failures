const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));



// Get all failures
app.get('/api/failures', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
          FROM failures
          ORDER BY created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('GET /api/failures error:', error);
    res.status(500).json({ error: 'Failed to fetch failures' });
  }
});

// Save a failure
app.post('/api/failures', async (req, res) => {
  try {
    const {
      line,
      die_type,
      part_no,
      bin_number,
      failure_title,
      symptom,
      root_cause,
      action_taken,
      owner_name,
      status,
      extra_fields
    } = req.body;

    const result = await pool.query(
      `
      INSERT INTO failures (
        line,
        die_type
        part_no,
        bin_number,
        failure_title,
        symptom,
        root_cause,
        action_taken,
        owner_name,
        status,
        extra_fields
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        line || null,
        die_type || null,
        part_no || null,
        bin_number || null,
        failure_title || null,
        symptom || null,
        root_cause || null,
        action_taken || null,
        owner_name || null,
        status || 'Open',
        extra_fields || {}
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.log("REQ BODY:", req.body);
    console.log("DIE TYPE:", req.body.die_type);
    console.error('POST /api/failures error:', error);
    res.status(500).json({ error: 'Failed to save failure' });
  }
});

// Delete a failure
app.delete('/api/failures/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password !== process.env.DELETE_PASSWORD) {
      return res.status(403).json({ error: 'Invalid delete password' });
    }

    await pool.query('DELETE FROM failures WHERE id = $1', [id]);

    res.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/failures/:id error:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});