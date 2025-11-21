/**
 * Authentication routes
 * Handles user registration and login with secure password hashing
 */

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Secret key for JWT - In production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const SALT_ROUNDS = 10;

/**
 * POST /api/auth/register
 * Register a new user
 * 
 * Request body:
 * - username: string (required, unique)
 * - email: string (required, unique)
 * - password: string (required, min 6 characters)
 * - confirmPassword: string (required, must match password)
 */
router.post("/register", async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!username || !email || !password || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    // Validate password length
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: "Password must be at least 6 characters long"
        });
    }

    // Validate password match
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "Passwords do not match"
        });
    }

    try {
        const db = req.app.get("db");

        // Check if username already exists
        const existingUsername = await new Promise((resolve, reject) => {
            db.get(
                "SELECT id FROM users WHERE username = ?",
                [username],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existingUsername) {
            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }

        // Check if email already exists
        const existingEmail = await new Promise((resolve, reject) => {
            db.get(
                "SELECT id FROM users WHERE email = ?",
                [email],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        if (existingEmail) {
            return res.status(409).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        // Insert new user into database
        const result = await new Promise((resolve, reject) => {
            db.run(
                "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
                [username, email, passwordHash],
                function(err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID });
                }
            );
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: result.id, username, email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: result.id,
                username,
                email,
                token
            }
        });

    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

/**
 * POST /api/auth/login
 * Login user with username/email and password
 * 
 * Request body:
 * - identifier: string (username OR email)
 * - password: string
 */
router.post("/login", async (req, res) => {
    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
        return res.status(400).json({
            success: false,
            message: "Username/email and password are required"
        });
    }

    try {
        const db = req.app.get("db");

        // Query user by username OR email
        const user = await new Promise((resolve, reject) => {
            db.get(
                "SELECT * FROM users WHERE username = ? OR email = ?",
                [identifier, identifier],
                (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                }
            );
        });

        // Check if user exists
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, username: user.username, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                id: user.id,
                username: user.username,
                email: user.email,
                token
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

/**
 * POST /api/auth/verify
 * Verify JWT token
 * 
 * Request headers:
 * - Authorization: Bearer <token>
 */
router.post("/verify", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        
        res.status(200).json({
            success: true,
            message: "Token is valid",
            data: {
                id: decoded.id,
                username: decoded.username,
                email: decoded.email
            }
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
});

module.exports = router;
