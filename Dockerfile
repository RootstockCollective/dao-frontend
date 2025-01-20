# Use the official Node.js 18 image as a base
FROM node:23-alpine@sha256:498bf3e45a4132b99952f88129ae5429e3568f3836edbfc09e3661515f620837 AS builder

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

# Set the build argument 
ARG PROFILE
ARG NEXT_PUBLIC_BUILD_ID

# Rename environment files based on PROFILE 
RUN cp .env.${PROFILE} .env.local

# Export the NEXT_PUBLIC_BUILD_ID as an environment variable
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}

# Build the Next.js application
RUN npm run build

# Use a minimal Node.js image for the production environment
FROM node:23-alpine@sha256:498bf3e45a4132b99952f88129ae5429e3568f3836edbfc09e3661515f620837 AS runner

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

# Start the Next.js application
CMD ["npm", "start"]
