require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { query } = require('./services/db');
const { authenticate } = require('./middleware/auth');
const { mapUser, mapProperty, mapPost } = require('./utils/mappers');

const app = express();
app.use(cors());
app.use(express.json());

// Routes 
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/users'));
app.use('/properties', require('./routes/properties'));
app.use('/community', require('./routes/community'));

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// DB Init 
// Solo carga la primera pagina de properties y community.
app.get('/db/init', authenticate, async (req, res) => {
  try {
    const PROP_LIMIT = 20;
    const COMM_LIMIT = 30;

    const [[users], [properties], [community], [propCount], [commCount]] =
      await Promise.all([
        query('SELECT * FROM users ORDER BY createdAt DESC'),
        query('SELECT * FROM properties ORDER BY createdAt DESC LIMIT ?', [PROP_LIMIT]),
        query('SELECT * FROM community  ORDER BY createdAt DESC LIMIT ?', [COMM_LIMIT]),
        query('SELECT COUNT(*) AS total FROM properties'),
        query('SELECT COUNT(*) AS total FROM community'),
      ]);

    res.json({
      users: users.map(mapUser),
      properties: properties.map(mapProperty),
      community: community.map(mapPost),
      meta: {
        propertiesTotal: propCount[0].total,
        propertiesPage: 1,
        propertiesLimit: PROP_LIMIT,
        communityTotal: commCount[0].total,
        communityPage: 1,
        communityLimit: COMM_LIMIT,
      },
    });
  } catch (err) {
    console.error('DB init error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Error interno del servidor.' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Virtual Agent API corriendo en http://localhost:${PORT}`);
});