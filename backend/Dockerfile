# Use the same Node version Render was trying to use
FROM node:22-slim

# Set the working directory inside the container
WORKDIR /app

# Copy package files first to optimize build speed (layer caching)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Documentation: Tell Render which port your app uses
EXPOSE 5000

# Start the server using your server.js file
CMD ["node", "server.js"]
