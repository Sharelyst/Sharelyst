// Import modules
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose(); // verbose for detailed error messages. Remove in production.

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

