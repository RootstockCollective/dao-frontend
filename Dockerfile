FROM node:24-alpine@sha256:e8e882c692a08878d55ec8ff6c5a4a71b3edca25eda0af4406e2a160d8a93cf2 AS builder

# Install required dependencies for Trezor (and possibly Ledger)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    eudev-dev \
    libusb-dev \
    linux-headers 


# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Skip cypress install
ENV CYPRESS_INSTALL_BINARY 0

# Install dependencies
RUN npm ci --verbose

# Copy the rest of the application code
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Set the build arguments
ARG PROFILE
ARG NEXT_PUBLIC_BUILD_ID
ARG SENTRY_AUTH_TOKEN

# Inject the NEXT_PUBLIC_BUILD_ID into the profile env file BEFORE copying
# This is critical because next.config.mjs loads from .env.${PROFILE} with override: true
RUN sed -i "s/^NEXT_PUBLIC_BUILD_ID=.*/NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}/" .env.${PROFILE}

# Rename environment files based on PROFILE 
RUN cp .env.${PROFILE} .env.local

# Also export as environment variable for the build step
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

# Build the Next.js application
RUN --mount=type=cache,target=/app/.next/cache npm run build

# Clean node_modules for production after build
RUN npm prune --production

FROM node:24-alpine@sha256:e8e882c692a08878d55ec8ff6c5a4a71b3edca25eda0af4406e2a160d8a93cf2 AS runner

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.local ./.env.local
COPY --from=builder /app/node_modules ./node_modules

# Copy database migration scripts
COPY --from=builder /app/src/db ./src/db


# Download AWS RDS CA certificate
RUN apk add --no-cache wget && \
    wget -O rds-ca-cert.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem


# Expose the port that Next.js will run on
EXPOSE 3000

# Run database migrations and start the Next.js application
# Migration errors are logged but won't prevent startup (as per requirements)
CMD ["sh", "-c", "node src/db/migrate.js; npm start"]
