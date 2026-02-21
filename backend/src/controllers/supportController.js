const { listTickets, createTicket } = require('../services/supportService');

const getTickets = async (req, res) => {
  try {
    const items = await listTickets();
    res.json({ tickets: items });
  } catch (err) {
    console.error('Get tickets error:', err);
    res.status(500).json({ error: 'Failed to load tickets' });
  }
};

const postTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) return res.status(400).json({ error: 'all fields required' });
    const created = await createTicket({ name, email, subject, message });
    res.status(201).json({ ticket: created });
  } catch (err) {
    console.error('Create ticket error:', err);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

module.exports = { getTickets, postTicket };
