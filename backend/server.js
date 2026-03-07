const express = require("express");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("Express server is running 🚀");
});

// Example API route
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Alice" },
    { id: 2, name: "Bob" },
  ];

  res.json(users);
});

// POST example
app.post("/api/users", (req, res) => {
  const newUser = req.body;

  res.json({
    message: "User created",
    user: newUser,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});