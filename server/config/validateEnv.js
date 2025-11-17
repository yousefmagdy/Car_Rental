/**
 * Validates required environment variables on server startup
 * Prevents the server from starting with missing critical configuration
 */

const requiredEnvVars = [
  'MONGODB_URI',
  'NODE_ENV',
  'PORT',
  'FRONTEND_URL',
];

const validateEnv = () => {
  const missingVars = [];

  requiredEnvVars.forEach((envVar) => {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  });

  if (missingVars.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ Missing required environment variables:');
    missingVars.forEach((varName) => {
      console.error('\x1b[33m%s\x1b[0m', `   - ${varName}`);
    });
    console.error('\x1b[36m%s\x1b[0m', '\n💡 Please create a .env file with the required variables');
    throw new Error(`Missing required environment variable(s): ${missingVars.join(', ')}`);
  }

  console.log('\x1b[32m%s\x1b[0m', '✓ All required environment variables are set');
};

module.exports = validateEnv;

