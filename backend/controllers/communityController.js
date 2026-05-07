const { query } = require('../services/db');
const { mapPost } = require('../utils/mappers');

const addPost = async (req, res) => {
  try {
    const { id, userId, userName, userAvatar, mensaje, createdAt } = req.body;
    const now = createdAt ?? new Date().toISOString();

    await query(
      'INSERT INTO community (id, userId, userName, userAvatar, mensaje, likes, createdAt) VALUES (?,?,?,?,?,0,?)',
      [id, userId, userName, userAvatar, mensaje, now],
    );

    const [rows] = await query('SELECT * FROM community WHERE id = ?', [id]);
    res.status(201).json(mapPost(rows[0]));
  } catch (err) {
    console.error('Add post error:', err);
    res.status(500).json({ error: err.message });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    await query('UPDATE community SET likes = likes + 1 WHERE id = ?', [id]);
    const [rows] = await query('SELECT * FROM community WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ error: 'Post no encontrado.' });
    res.json(mapPost(rows[0]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addPost, likePost };