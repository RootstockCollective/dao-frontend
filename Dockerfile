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

# Set the build argument 
ARG PROFILE
ARG NEXT_PUBLIC_BUILD_ID
ARG THE_GRAPH_API_KEY
ARG DB_CONNECTION_STRING
ARG DAO_GRAPH_API_KEY

# Rename environment files based on PROFILE 
RUN cp .env.${PROFILE} .env.local

# Export the NEXT_PUBLIC_BUILD_ID as an environment variable
ENV NEXT_PUBLIC_BUILD_ID=${NEXT_PUBLIC_BUILD_ID}
ENV THE_GRAPH_API_KEY=${THE_GRAPH_API_KEY}
ENV DB_CONNECTION_STRING=${DB_CONNECTION_STRING}
ENV DAO_GRAPH_API_KEY=${DAO_GRAPH_API_KEY}

# Build the Next.js application
RUN npm run build

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

ARG THE_GRAPH_API_KEY
ARG DB_CONNECTION_STRING
ARG DAO_GRAPH_API_KEY

ENV THE_GRAPH_API_KEY=${THE_GRAPH_API_KEY}
ENV DB_CONNECTION_STRING=${DB_CONNECTION_STRING}
ENV DAO_GRAPH_API_KEY=${DAO_GRAPH_API_KEY}

# Download AWS RDS CA certificate
RUN apk add --no-cache wget && \
    wget -O rds-ca-cert.pem https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem


# Expose the port that Next.js will run on
EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
