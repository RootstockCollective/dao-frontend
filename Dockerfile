# ---------- shared base ----------
FROM node:24.13.1-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS base

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy Prisma schema so prisma generate can find it
COPY prisma/schema.prisma ./prisma/schema.prisma

# Skip cypress install
ENV CYPRESS_INSTALL_BINARY 0

# ---------- stage 1: full install + build ----------
FROM base AS builder

# Install all dependencies (including devDependencies for the build) without running their install scripts
RUN npm ci --ignore-scripts --verbose && node_modules/.bin/prisma generate

# Copy the rest of the application code
COPY . .

# Disable telemetry
ENV NEXT_TELEMETRY_DISABLED 1

# Set the build arguments
ARG PROFILE
ARG NEXT_PUBLIC_BUILD_ID
ARG BUILD_SCRIPT=build

# Inject build args into the profile env file BEFORE copying
# This is critical because next.config.mjs loads from .env.${PROFILE} with override: true
RUN sed -i -e "s/^NEXT_PUBLIC_BUILD_ID=.*/NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}/" -e '/^BLOCKSCOUT_API_KEY=/d' .env.${PROFILE}

# Rename environment files based on PROFILE
RUN cp .env.${PROFILE} .env.local

# Also export as environment variable for the build step
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}

# Build the Next.js application. The mounted secrets only exist while this step runs; at runtime the
# container gets its secrets from the ECS task definition, like DAO_DATA_DB_CONNECTION_STRING.
RUN --mount=type=cache,target=/app/.next/cache \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    --mount=type=secret,id=BLOCKSCOUT_API_KEY,env=BLOCKSCOUT_API_KEY \
    npm run ${BUILD_SCRIPT}

# ---------- stage 2: production-only deps (runs in parallel with build) ----------
FROM base AS prod-deps

# The generated Prisma client and engines are copied from the builder stage.
RUN npm ci --omit=dev --ignore-scripts --verbose

# ---------- stage 3: runner ----------
FROM node:24.13.1-alpine@sha256:4f696fbf39f383c1e486030ba6b289a5d9af541642fc78ab197e584a113b9c03 AS runner

WORKDIR /app

# Copy build output from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.env.local ./.env.local

# Copy production-only node_modules from prod-deps stage (built in parallel)
COPY --from=prod-deps /app/node_modules ./node_modules

# Copy the generated Prisma Client and the engines prisma generate fetched in the builder stage,
# so prisma migrate deploy does not download them when the container starts.
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/engines ./node_modules/@prisma/engines

# Copy Prisma schema and migrations
COPY --from=builder /app/prisma ./prisma

# AWS RDS CA bundle, from https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem
COPY certs/rds-global-bundle.pem ./rds-ca-cert.pem

# Enable source maps so stack traces reference original TypeScript files
ENV NODE_OPTIONS="--enable-source-maps"

# Expose the port that Next.js will run on
EXPOSE 3000

# Run Prisma migrations and start the Next.js application
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy; npm start"]
