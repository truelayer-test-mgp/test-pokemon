# Use Node.js 22 (LTS) or higher for native testing features
FROM node:22-slim

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies
RUN npm install

# Bundle app source
COPY . .

# Default command (can be overridden)
CMD [ "npx", "tsx", "src/index.ts" ]
