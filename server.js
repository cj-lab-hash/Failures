import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { query } from "./db.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve frontend
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Create record (SAVE)
app.post("/api/records", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: "name and description are required" });
    }

    const result = await query(
      `INSERT INTO records (name, description) VALUES ($1, $2) RETURNING *`,
      [name, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Read records (FETCH)
app.get("/api/records", async (req, res) => {
  try {
    const result = await query(`SELECT * FROM records ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on http://localhost:${port}`));
