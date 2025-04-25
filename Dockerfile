FROM node:22-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS builder

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
ARG THE_GRAPH_API_KEY

# Rename environment files based on PROFILE 
RUN cp .env.${PROFILE} .env.local

# Export the NEXT_PUBLIC_BUILD_ID as an environment variable
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}
ENV THE_GRAPH_API_KEY=${THE_GRAPH_API_KEY}

# Build the Next.js application
RUN npm run build

FROM node:22-alpine@sha256:ad1aedbcc1b0575074a91ac146d6956476c1f9985994810e4ee02efd932a68fd AS runner

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.local ./.env.local

ARG THE_GRAPH_API_KEY

ENV THE_GRAPH_API_KEY=${THE_GRAPH_API_KEY}

# Install production dependencies
RUN npm install --production
# Expose the port that Next.js will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
