const tickets = [];

const listTickets = async () => tickets;

const createTicket = async ({ name, email, subject, message }) => {
  const id = tickets.length + 1;
  const ticket = { id, name, email, subject, message, status: 'open', createdAt: new Date().toISOString() };
  tickets.unshift(ticket);
  return ticket;
};

module.exports = { listTickets, createTicket };
