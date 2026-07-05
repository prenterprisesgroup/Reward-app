export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/v1/auth/login',
    ME: '/api/v1/auth/me',
    UPDATE_ME: '/api/v1/auth/me',
    UPDATE_PHOTO: '/api/v1/auth/me/photo',
  },
  SYSTEM: {
    WALLET: '/api/v1/system/wallet',
    WALLET_BREAKDOWN: '/api/v1/system/wallet/breakdown',
    WALLET_UPI: '/api/v1/system/wallet/upi',
    BARCODE_SCAN: '/api/v1/system/scan',
    WITHDRAW: '/api/v1/system/withdrawals',
  },
  ADMIN: {
    DASHBOARD_STATS: '/api/v1/system/dashboard/stats',
    DASHBOARD_ACTIVITY: '/api/v1/system/dashboard/activity',
    PENDING_WITHDRAWALS: '/api/v1/system/withdrawals', // uses ?status=PENDING
    PAYMENT_REQUESTS: '/api/v1/system/withdrawals',
    APPROVE_WITHDRAWAL: (id: string) => `/api/v1/system/withdrawals/${id}/approve`,
    REJECT_WITHDRAWAL: (id: string) => `/api/v1/system/withdrawals/${id}/reject`,
    BARCODE_BATCHES: '/api/v1/system/barcode-batches',
    BARCODE_BATCHES_SCANS: '/api/v1/system/barcode-batches/scans',
    BATCH_SCAN: (id: string) => `/api/v1/system/barcode-batches/scans/${id}`,
    BARCODE_BATCH: (id: string) => `/api/v1/system/barcode-batches/${id}`,
    DUPLICATE_BATCH: (id: string) => `/api/v1/system/barcode-batches/${id}/duplicate`,
    BATCH_PDF: (id: string) => `/api/v1/system/barcode-batches/${id}/pdf`,
    WORKERS: '/api/v1/system/workers',
    WORKER_DETAILS: (id: string) => `/api/v1/system/workers/${id}`,
    WORKER_REWARDS: (id: string) => `/api/v1/system/workers/${id}/rewards`,
    WORKER_WITHDRAWALS: (id: string) => `/api/v1/system/workers/${id}/withdrawals`,
    WORKER_QR_ACTIVITY: (id: string) => `/api/v1/system/workers/${id}/qr-activity`,
  }
} as const;
