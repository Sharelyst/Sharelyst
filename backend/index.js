// Import modules
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose(); // verbose for detailed error messages. Remove in production.

// Import routes
const authRoutes = require("./routes/auth");

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./database.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    }
    else {
        console.log("Connected to the SQLite database.");
    }
});

// Store database instance in app for use in routes
app.set("db", db);

// Define routes
app.get("/", (req, res) => {
    res.send("Welcome to the Sharelyst backend!");
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0'; // Listen on all network interfaces

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
    console.log(`Local access: http://localhost:${PORT}`);
    console.log(`Network access: http://<your-ip>:${PORT}`);
    console.log(`Android Emulator: http://10.0.2.2:${PORT}`);
});