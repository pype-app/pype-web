# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.js ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

# Install dependencies
RUN npm ci --frozen-lockfile

# Copy source code
COPY src ./src
COPY public ./public

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Environment variables with default values
ENV NODE_ENV=production \
    PORT=3000 \
    PYPE_API_URL=http://localhost:8080 \
    HOSTNAME=0.0.0.0

# Copy built application from builder
# Next.js standalone already includes all necessary dependencies
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Health check (using PORT environment variable)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Expose port - use default 3000, but will be overridden by ENV at runtime
EXPOSE 3000

# Start application - Next.js standalone will read PORT env variable
CMD ["node", "server.js"]
