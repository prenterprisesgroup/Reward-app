# Production Deployment Guide

This document outlines the standard operating procedures for deploying the Enterprise Reward Application backend to a production environment (e.g., AWS, GCP, Heroku, or Kubernetes).

## 1. Environment Variables

The application enforces **strict environment validation** on startup. The application will crash immediately (`exit 1`) if any of these are missing:

- `NODE_ENV`: Must be set to `production`.
- `PORT`: E.g., `8080`.
- `JWT_SECRET`: A strong, randomly generated secret (min 64 chars).
- `MONGODB_URI`: The connection string for the MongoDB Atlas Replica Set.
- `CLOUDINARY_NAME`: Cloudinary Cloud Name.
- `CLOUDINARY_API_KEY`: Cloudinary API Key.
- `CLOUDINARY_API_SECRET`: Cloudinary API Secret.

Optional but highly recommended for production:
- `SENTRY_DSN`: Sentry Data Source Name for error tracking.
- `LOG_LEVEL`: Set to `info` (default for prod) or `warn`.

## 2. Build & Deployment Steps

1. **Install Dependencies:**
   ```bash
   npm ci --production
   ```
   *Note: Using `npm ci` ensures exact versions from `package-lock.json` are installed, preventing dependency drift.*

2. **Start the Application:**
   ```bash
   npm start
   ```
   *Note: In production, it is recommended to run the app using a process manager like PM2 or inside a Docker container.*

   Example PM2:
   ```bash
   pm2 start src/server.js --name "reward-app-backend" --env production
   ```

## 3. Health & Readiness Checks

Configure your load balancer or container orchestrator (e.g., Kubernetes, AWS ALB) to use the following endpoints:

- **Liveness Probe:** `GET /health/live`
  - Returns `200 OK` if the Node.js process is running.
- **Readiness Probe:** `GET /health/ready`
  - Returns `200 OK` only if the database is connected and environment variables are valid. If this fails, the orchestrator should stop routing traffic to this instance.
- **Deep Health Check:** `GET /health`
  - Returns a detailed JSON object with uptime, version, and dependency status. Used for monitoring dashboards.

## 4. Monitoring & Observability

- **Application Errors:** Captured automatically by **Sentry**. Check the Sentry dashboard for stack traces, unhandled promise rejections, and performance bottlenecks.
- **Structured Logging:** The application uses **Pino** to output structured JSON logs to `stdout`.
  - *Recommendation:* Do not store logs locally. Configure a log shipper (e.g., FluentBit, Datadog Agent, AWS CloudWatch) to ingest `stdout` and forward logs to a centralized aggregation service (Elasticsearch, Datadog, Splunk).

## 5. Scaling Strategy

- **Horizontal Scaling:** The backend is completely stateless (JWT for auth, MongoDB for persistence). You can safely scale horizontally by spinning up additional instances/containers.
- **Idempotency:** Because idempotency is backed by the database (`IdempotencyKey`), requests retried across different instances will be handled safely without race conditions.

## 6. Rollback Plan

If a deployment introduces critical bugs (monitored via Sentry spike alerts):
1. Immediately revert the deployment artifact (e.g., rollback the Kubernetes deployment or switch the load balancer target group back to the previous version).
2. If the deployment included a breaking database schema migration, restore the database using the manual snapshot taken before the deployment (See `BACKUP_STRATEGY.md`).
