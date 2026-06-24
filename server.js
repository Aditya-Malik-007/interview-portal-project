import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET;

const db = new pg.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
});

app.use(cors({
    origin: 'https://interview-portal-project.vercel.app',
    credentials: true
}));
app.use(express.json());

// JWT auth middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Unauthorized.' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

// REGISTER
app.post('/register', async (req, res) => {
    try {
        const { email, password, branch, name } = req.body;

        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const hash = await bcrypt.hash(password, 10);

        const result = await db.query(
            "INSERT INTO users (email, password_hash, branch, name) VALUES ($1, $2, $3, $4) RETURNING id, email, branch, name",
            [email, hash, branch, name || null]
        );

        const newUser = result.rows[0];
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, branch: newUser.branch, name: newUser.name },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({ message: "Registered successfully!", token, user: newUser });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "User not found." });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password." });
        }

        const userData = { id: user.id, email: user.email, branch: user.branch, name: user.name || null };
        const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });

        res.status(200).json({ message: "Logged in successfully!", token, user: userData });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// LOGOUT (client handles token removal; nothing to do server-side)
app.post('/logout', (req, res) => {
    res.status(200).json({ message: "Logged out successfully." });
});

// CHECK AUTH
app.get('/api/check-auth', verifyToken, (req, res) => {
    res.status(200).json({ user: req.user });
});

// GET MY PROFILE
app.get('/api/me', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, email, name, branch, created_at FROM users WHERE id = $1",
            [req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found." });
        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// FETCH ALL EXPERIENCES (public feed)
app.get('/api/experiences', async (req, res) => {
    try {
        const queryText = `
            SELECT posts.id, posts.company, posts.role, posts.content, posts.status, posts.created_at,
                   users.branch, users.name AS author_name, posts.user_id
            FROM posts
            INNER JOIN users ON posts.user_id = users.id
            ORDER BY posts.created_at DESC
        `;
        const result = await db.query(queryText);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch experiences" });
    }
});

// FETCH MY POSTS (dashboard)
app.get('/api/my-posts', verifyToken, async (req, res) => {
    try {
        const result = await db.query(
            "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
            [req.user.id]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch your posts" });
    }
});

// CREATE POST
app.post('/api/experiences', verifyToken, async (req, res) => {
    try {
        const { company, role, content, status } = req.body;

        if (!company || !role || !content || !status) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const result = await db.query(
            "INSERT INTO posts (user_id, company, role, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [req.user.id, company, role, content, status]
        );
        res.status(201).json({ message: "Post created successfully!", post: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save experience" });
    }
});

// EDIT POST (owner only)
app.put('/api/experiences/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { company, role, content, status } = req.body;

        const check = await db.query("SELECT user_id FROM posts WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: "Post not found." });
        if (check.rows[0].user_id !== req.user.id) return res.status(403).json({ error: "Forbidden." });

        const result = await db.query(
            "UPDATE posts SET company=$1, role=$2, content=$3, status=$4 WHERE id=$5 RETURNING *",
            [company, role, content, status, id]
        );
        res.status(200).json({ message: "Post updated!", post: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update post" });
    }
});

// DELETE POST (owner only)
app.delete('/api/experiences/:id', verifyToken, async (req, res) => {
    try {
        const { id } = req.params;

        const check = await db.query("SELECT user_id FROM posts WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: "Post not found." });
        if (check.rows[0].user_id !== req.user.id) return res.status(403).json({ error: "Forbidden." });

        await db.query("DELETE FROM posts WHERE id = $1", [id]);
        res.status(200).json({ message: "Post deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete post" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});