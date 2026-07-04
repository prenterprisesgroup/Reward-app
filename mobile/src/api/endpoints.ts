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
  }
} as const;
