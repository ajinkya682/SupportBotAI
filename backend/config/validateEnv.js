const REQUIRED_VARS = [
  { key: 'PORT', hint: 'Set PORT to the port number your server should listen on. Example: 3000' },
  { key: 'MONGODB_URI', hint: 'Set MONGODB_URI to your MongoDB Atlas connection string.' },
  { key: 'JWT_SECRET', hint: 'Set JWT_SECRET to a random 64-character string.' },
  { key: 'JWT_EXPIRES_IN', hint: 'Set JWT_EXPIRES_IN to how long tokens last. Example: 30d' },
  { key: 'AI_PROVIDER', hint: 'Set AI_PROVIDER to: mistral' },
  { key: 'FRONTEND_URL', hint: 'Set FRONTEND_URL to the URL of your React frontend.' },
  { key: 'SERVER_BASE_URL', hint: 'Set SERVER_BASE_URL to the full URL of this backend server.' },
  { key: 'VAPID_PUBLIC_KEY', hint: 'Generate using: npx web-push generate-vapid-keys' },
  { key: 'VAPID_PRIVATE_KEY', hint: 'Generate using: npx web-push generate-vapid-keys' },
  { key: 'RESEND_API_KEY', hint: 'Get your API key from resend.com' },
];

const validateEnv = () => {
  const missing = [];

  for (const { key, hint } of REQUIRED_VARS) {
    if (!process.env[key]) {
      missing.push({ key, hint });
    }
  }

  const provider = process.env.AI_PROVIDER;
  if (provider === 'mistral' && !process.env.MISTRAL_API_KEY) {
    missing.push({
      key: 'MISTRAL_API_KEY',
      hint: 'AI_PROVIDER is set to "mistral" but MISTRAL_API_KEY is missing.',
    });
  }

  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    console.warn('⚠️  WARNING: JWT_SECRET is too short. Use at least 64 characters for production security.');
  }

  if (missing.length > 0) {
    console.error('\n❌ SERVER STARTUP FAILED — Missing required environment variables:\n');
    for (const { key, hint } of missing) {
      console.error(`  ✗ ${key}`);
      console.error(`    → ${hint}\n`);
    }
    process.exit(1);
  }
};

module.exports = validateEnv;
