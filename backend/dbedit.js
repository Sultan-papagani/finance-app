const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
const PORT = 3001; // Runs on 3001 so it doesn't conflict with your main server

app.use(express.json({ limit: '10mb' }));

let db;
(async () => {
  // Connects to the same database your server uses
  db = await open({ filename: './finance.db', driver: sqlite3.Database });
  console.log('✅ Admin DB Editor connected to finance.db');
})();

// Serve the UI
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Finance DB Editor</title>
      <style>
        body { font-family: system-ui, -apple-system, sans-serif; margin: 0; display: flex; height: 100vh; background: #f3f4f6; color: #1f2937; }
        .sidebar { width: 300px; background: #ffffff; border-right: 1px solid #e5e7eb; overflow-y: auto; display: flex; flex-direction: column; }
        .header { padding: 20px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; font-weight: bold; }
        .user-item { padding: 15px 20px; border-bottom: 1px solid #e5e7eb; cursor: pointer; transition: background 0.2s; }
        .user-item:hover { background: #f3f4f6; }
        .user-item.active { background: #e0f2fe; border-left: 4px solid #3b82f6; }
        .user-name { font-weight: bold; margin-bottom: 4px; }
        .user-email { font-size: 0.85em; color: #6b7280; }
        .main { flex: 1; display: flex; flex-direction: column; padding: 20px; }
        .toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        textarea { flex: 1; width: 100%; font-family: monospace; font-size: 14px; padding: 15px; border: 1px solid #d1d5db; border-radius: 8px; resize: none; outline: none; box-sizing: border-box; }
        textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2); }
        .btn { padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; color: white; transition: opacity 0.2s; }
        .btn:hover { opacity: 0.9; }
        .btn-blue { background: #3b82f6; }
        .btn-green { background: #10b981; }
        .empty-state { flex: 1; display: flex; align-items: center; justify-content: center; color: #6b7280; }
        #notification { display: none; padding: 10px; border-radius: 6px; margin-bottom: 10px; font-weight: bold; }
      </style>
    </head>
    <body>

      <div class="sidebar" id="user-list">
        <div class="header">👥 Users in Database</div>
        </div>

      <div class="main">
        <div id="notification"></div>
        <div id="editor-area" style="display: none; height: 100%; flex-direction: column;">
          <div class="toolbar">
            <div>
              <h2 style="margin: 0;" id="editing-title">Editing User</h2>
            </div>
            <div>
              <button class="btn btn-blue" onclick="formatJSON()">Format JSON</button>
              <button class="btn btn-green" onclick="saveJSON()">Save to Database</button>
            </div>
          </div>
          <textarea id="json-input" spellcheck="false"></textarea>
        </div>
        <div id="empty-state" class="empty-state">
          <h2>Select a user from the left to edit their finances</h2>
        </div>
      </div>

      <script>
        let currentUser = null;

        async function fetchUsers() {
          const res = await fetch('/api/users');
          const users = await res.json();
          const list = document.getElementById('user-list');
          list.innerHTML = '<div class="header">👥 Users in Database</div>';
          
          users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'user-item';
            div.innerHTML = \`<div class="user-name">\${user.username}</div><div class="user-email">\${user.email}</div>\`;
            div.onclick = () => loadUser(user, div);
            list.appendChild(div);
          });
        }

        function loadUser(user, element) {
          document.querySelectorAll('.user-item').forEach(el => el.classList.remove('active'));
          element.classList.add('active');
          
          currentUser = user;
          document.getElementById('empty-state').style.display = 'none';
          document.getElementById('editor-area').style.display = 'flex';
          document.getElementById('editing-title').innerText = \`Editing Finances for: \${user.username}\`;
          
          try {
            // Pretty print the JSON
            const parsed = JSON.parse(user.finances || '{}');
            document.getElementById('json-input').value = JSON.stringify(parsed, null, 2);
          } catch (e) {
            document.getElementById('json-input').value = user.finances;
          }
        }

        function formatJSON() {
          const input = document.getElementById('json-input');
          try {
            const parsed = JSON.parse(input.value);
            input.value = JSON.stringify(parsed, null, 2);
            showNotification('JSON Formatted!', '#10b981');
          } catch (e) {
            showNotification('Invalid JSON syntax!', '#ef4444');
          }
        }

        async function saveJSON() {
          if (!currentUser) return;
          const inputData = document.getElementById('json-input').value;
          
          // Pre-flight validation
          try {
            JSON.parse(inputData);
          } catch (e) {
            return showNotification('Cannot save: Invalid JSON syntax!', '#ef4444');
          }

          const res = await fetch(\`/api/users/\${currentUser.id}\`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ finances: inputData })
          });

          if (res.ok) {
            showNotification('✅ Saved to database successfully!', '#10b981');
            // Update local state
            currentUser.finances = inputData; 
          } else {
            showNotification('❌ Failed to save!', '#ef4444');
          }
        }

        function showNotification(msg, color) {
          const notif = document.getElementById('notification');
          notif.style.display = 'block';
          notif.style.backgroundColor = color;
          notif.style.color = 'white';
          notif.innerText = msg;
          setTimeout(() => notif.style.display = 'none', 3000);
        }

        // Init
        fetchUsers();
      </script>
    </body>
    </html>
  `);
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await db.all('SELECT id, username, email, finances FROM users');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update specific user's finances
app.put('/api/users/:id', async (req, res) => {
  try {
    const { finances } = req.body;
    
    // Double check it's valid JSON before injecting into the database
    JSON.parse(finances); 

    await db.run('UPDATE users SET finances = ? WHERE id = ?', [finances, req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Invalid JSON format or DB error' });
  }
});

app.listen(PORT, () => {
  console.log(`🛠️  DB Editor UI is live at http://localhost:${PORT}`);
});