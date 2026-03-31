FROM node:24-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS builder

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

# Copy Prisma schema so postinstall hook (prisma generate) can find it
COPY prisma/schema.prisma ./prisma/schema.prisma

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
ARG ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL
# Embedded by Next at `next build`; https://nextjs.org/docs/messages/failed-to-find-server-action
# Build-args may appear in image history/provenance — restrict who can pull the image.
ARG NEXT_SERVER_ACTIONS_ENCRYPTION_KEY

# Inject build args into the profile env file BEFORE copying
# This is critical because next.config.mjs loads from .env.${PROFILE} with override: true
RUN sed -i "s/^NEXT_PUBLIC_BUILD_ID=.*/NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}/" .env.${PROFILE} && \
    if [ -n "$ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL" ]; then sed -i "s|^ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL=.*|ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL=${ENVIO_SYNC_CHECK_SLACK_WEBHOOK_URL}|" .env.${PROFILE}; fi

# Rename environment files based on PROFILE 
RUN cp .env.${PROFILE} .env.local

# Also export as environment variable for the build step
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}
ENV SENTRY_AUTH_TOKEN=${SENTRY_AUTH_TOKEN}

# Build the Next.js application (CI passes key via --build-arg)
RUN --mount=type=cache,target=/app/.next/cache \
    NEXT_SERVER_ACTIONS_ENCRYPTION_KEY="${NEXT_SERVER_ACTIONS_ENCRYPTION_KEY}" npm run build

# Clean node_modules for production after build
RUN npm prune --production

FROM node:24-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS runner

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.local ./.env.local
COPY --from=builder /app/node_modules ./node_modules

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma


# Download AWS RDS CA certificate
RUN apk add --no-cache wget && \
    wget -O rds-ca-cert.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem


# Expose the port that Next.js will run on
EXPOSE 3000

# Run Prisma migrations and start the Next.js application
CMD ["sh", "-c", "npx prisma migrate deploy; npm start"]
