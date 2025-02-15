# ./frontend/Dockerfile
# Use an official Node.js runtime as a parent image.
FROM node:18-alpine

# Set the working directory.
WORKDIR /app

# Copy package files first for better caching.
COPY package.json package-lock.json* ./

# Install dependencies using npm ci for a clean, fast install.
RUN npm ci

# Copy the rest of the frontend code.
COPY . .

# Expose the port on which the React app runs.
EXPOSE 3000

# Start the React development server.
CMD ["npm", "start"]