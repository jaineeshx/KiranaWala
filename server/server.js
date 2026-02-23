const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
// Specify the path to the .env file relative to this server.js file
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
const customerRoutes = require("./routes/customerRoutes");
const storeRoutes = require("./routes/storeRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.static(path.join(__dirname, "../views")));

// MongoDB Connection
// Use the connection string from .env. Mongoose v8+ ignores options like
// useNewUrlParser/useUnifiedTopology, so don't pass them. Add listeners to
// surface clearer diagnostics for connection state changes.
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("MongoDB initial connection error:", err);
  });

// Better runtime diagnostics
const db = mongoose.connection;
db.on("connected", () => {
  console.log(
    "Mongoose connected to",
    sanitizeHostFromUri(process.env.MONGO_URI),
  );
});
db.on("error", (err) => {
  console.error("Mongoose connection error:", err);
});
db.on("disconnected", () => {
  console.warn("Mongoose disconnected");
});
db.on("reconnected", () => {
  console.log("Mongoose reconnected");
});

// Helper to avoid printing full URI with credentials in logs
function sanitizeHostFromUri(uri) {
  try {
    if (!uri) return "(no uri)";
    // mongodb+srv://host/... or mongodb://user:pass@host:port/db
    const afterProto = uri.split("//")[1] || uri;
    // Remove credentials if present
    const withoutCreds = afterProto.includes("@")
      ? afterProto.split("@")[1]
      : afterProto;
    return withoutCreds.split("/")[0];
  } catch {
    return "(unknown host)";
  }
}

// API Routes
app.use("/api/customer", customerRoutes);
app.use("/api/store", storeRoutes);

// Page Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/index.html"));
});

app.get("/customer/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/customer/login.html"));
});

app.get("/customer/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/customer/register.html"));
});

app.get("/customer/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/customer/dashboard.html"));
});

app.get("/store-owner/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/store-owner/login.html"));
});

app.get("/store-owner/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/store-owner/register.html"));
});

app.get("/store-owner/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/store-owner/dashboard.html"));
});

// Add this with your other routes
app.get("/customer/products", (req, res) => {
  res.sendFile(path.join(__dirname, "../views/customer/products.html"));
});

// Add this route just before app.listen
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
