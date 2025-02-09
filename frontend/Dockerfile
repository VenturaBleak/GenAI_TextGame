FROM node:16-alpine
WORKDIR /app

# Copy package files and install dependencies.
COPY package*.json ./
RUN npm install

# Copy the remaining code.
COPY . .

# Get the build-time variable for the backend URL.
ARG REACT_APP_BACKEND_URL
# Set the environment variable for the build.
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

# Build the React app.
RUN npm run build

# Expose port 3000.
EXPOSE 3000

# Use a simple static file server to serve the built app.
RUN npm install -g serve
CMD ["serve", "-s", "build", "-l", "3000"]