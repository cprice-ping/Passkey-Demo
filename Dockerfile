# Use official Node.js LTS image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy all source files
COPY . .

# Expose the Fastify port
EXPOSE 5555

# Start the server
CMD ["node", "server.js"]
