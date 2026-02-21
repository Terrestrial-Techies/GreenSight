const notifications = [];

const createNotification = async (payload) => {
  const id = notifications.length + 1;
  const entry = { id, ...payload, createdAt: new Date().toISOString() };
  notifications.unshift(entry);
  return entry;
};

const listNotifications = async () => {
  return notifications;
};

module.exports = { createNotification, listNotifications };
