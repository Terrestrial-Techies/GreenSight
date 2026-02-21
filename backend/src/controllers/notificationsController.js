const { createNotification, listNotifications } = require('../services/notificationsService');

const getNotifications = async (req, res) => {
  try {
    const items = await listNotifications();
    res.json({ notifications: items });
  } catch (err) {
    console.error('Get notifications error:', err);
    res.status(500).json({ error: 'Failed to load notifications' });
  }
};

const postNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ error: 'title and message required' });
    const created = await createNotification({ title, message, type: type || 'info' });
    res.status(201).json({ notification: created });
  } catch (err) {
    console.error('Create notification error:', err);
    res.status(500).json({ error: 'Failed to create notification' });
  }
};

module.exports = { getNotifications, postNotification };
