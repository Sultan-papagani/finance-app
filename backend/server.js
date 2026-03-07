const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Sunucu baba çalışıyor");
});

// Örnek kullanıcı getir
app.get("/api/users", (req, res) => {
  const users = [
    { id: 1, name: "Alirıza Baba" },
    { id: 2, name: "Mahmut Hakul Hakulefendi" },
  ];

  res.json(users);
});

// post request örneği
app.post("/api/users", (req, res) => {
  const newUser = req.body;

  res.json({
    message: "Kullanıcı oluşturuldu umarım",
    user: newUser,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT}'de çalışıyo olmalı.`);
});