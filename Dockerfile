# Use the official Node.js 18 image as a base
FROM node:18-alpine AS builder

# Set the environment variable
ARG arg_env
ENV NODE_ENV="$arg_env"

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Skip cypress install
ENV CYPRESS_INSTALL_BINARY 0

# Install dependencies
RUN npm install --verbose

# Copy the rest of the application code
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1
# Build the Next.js application
RUN npm run build

# Use a minimal Node.js image for the production environment
FROM node:18-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

# Install production dependencies
RUN npm install --production

# Expose the port that Next.js will run on
EXPOSE 3000

# Set the environment variable
ARG arg_env
ENV NODE_ENV="$arg_env"


# Start the Next.js application
CMD ["npm", "start"]
