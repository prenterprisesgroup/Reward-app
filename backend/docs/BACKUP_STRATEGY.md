# Disaster Recovery & Backup Strategy

This document outlines the backup, restore, and disaster recovery (DR) protocols for the Enterprise Reward Application backend.

## 1. MongoDB Atlas Backups

### Automated Cloud Backups
The database runs on MongoDB Atlas, which is configured for automated snapshot backups:
- **Continuous Cloud Backups (Point-in-Time Recovery - PITR):** Enables restoring the cluster to any exact second within the last 7 days.
- **Daily Snapshots:** A complete snapshot of the database is taken every 24 hours.
- **Retention Policy:**
  - Daily snapshots are retained for **7 days**.
  - Weekly snapshots are retained for **4 weeks**.
  - Monthly snapshots are retained for **12 months**.

### Manual Snapshots
Before any major schema migration, application upgrade, or massive data import, a **manual snapshot** MUST be initiated via the MongoDB Atlas UI or Atlas Admin API.
- Wait for the manual snapshot to complete (`Status: Completed`) before executing the migration.

## 2. Restore Process

### Restoring from a Snapshot (Full Cluster Recovery)
1. Log into the MongoDB Atlas Console.
2. Navigate to **Clusters** -> **Backup** -> **Snapshots**.
3. Select the desired snapshot.
4. Click **Restore**.
5. Choose **Restore to a New Cluster** (Recommended for forensic auditing before swapping connection strings) OR **Restore to the Original Cluster**.
6. Wait for the restoration to complete (usually 10-30 minutes depending on data size).
7. If restored to a new cluster, update the `MONGODB_URI` environment variable in the application's production environment.

### Point-in-Time Recovery (PITR)
If accidental deletion or corruption occurs, you can restore to the exact second prior to the incident:
1. Go to **Clusters** -> **Backup** -> **Point in Time**.
2. Select the target Date and Time.
3. Follow the restore wizard to spin up a recovered cluster.

## 3. Disaster Recovery (DR) Metrics

- **Recovery Time Objective (RTO):** 1 Hour. This is the maximum acceptable time the system can be offline while restoring the database and redirecting traffic.
- **Recovery Point Objective (RPO):** 0-1 Second. With Atlas PITR, data loss is effectively zero, limited only by the replication lag at the exact moment of failure.

## 4. Recovery Testing Protocol
To ensure backups are valid and the DR plan works:
- **Quarterly Tests:** A designated DevOps engineer must execute a dry-run restoration of the latest backup to an isolated staging cluster.
- The application must be pointed to the staging cluster to verify data integrity (e.g., verifying user balances and withdrawal requests are intact).
- The test results and restoration duration must be documented in a DR log.
