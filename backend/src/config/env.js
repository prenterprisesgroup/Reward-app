const fs = require('fs');

function validateEnv() {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'MONGODB_URI',
  ];

  if (process.env.NODE_ENV === 'production') {
    requiredVars.push(
      'CLOUDINARY_NAME',
      'CLOUDINARY_API_KEY',
      'CLOUDINARY_API_SECRET'
    );
  }

  const missing = [];

  requiredVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missing.push(envVar);
    }
  });

  if (missing.length > 0) {
    console.error(`\n[FATAL ERROR] Environment validation failed.`);
    console.error(`The following required environment variables are missing:`);
    missing.forEach((v) => console.error(` - ${v}`));
    console.error(`\nPlease provide them in your .env file or environment and restart the server.\n`);
    process.exit(1);
  }
}

module.exports = validateEnv;
