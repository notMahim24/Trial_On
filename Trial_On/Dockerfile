# Use Node 22 (as specified in package.json)
FROM node:22-alpine AS build

# Set working directory
WORKDIR /app

# Install dependencies separately to leverage Docker cache
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Vite React Frontend
RUN npm run build

# Start a new production stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy production dependencies (we could prune, but keeping simple for now)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./
COPY --from=build /app/package.json ./

# Make sure to copy other necessary server files
COPY --from=build /app/lib ./lib
COPY --from=build /app/deploy1.json ./

# Expose port
EXPOSE 3000

# Set Node environment to production
ENV NODE_ENV=production

# Start the server using tsx
CMD ["npx", "tsx", "server.ts"]
