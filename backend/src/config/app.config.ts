function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Variable de entorno requerida faltante: ${key}`);
  }
  return value;
}

export default () => ({
  port: parseInt(getRequiredEnv('PORT'), 10),
  apiUrl: getRequiredEnv('API_URL'),
  serverUrl: getRequiredEnv('SERVER_URL'),
  frontendUrl: getRequiredEnv('FRONTEND_URL'),
  trustProxy: getRequiredEnv('TRUST_PROXY') === 'true',
  mongodb: {
    uri: getRequiredEnv('MONGODB_URI'),
  },
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    refreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'),
    expiresIn: '24h',
  },
  google: {
    clientId: getRequiredEnv('GOOGLE_CLIENT_ID'),
    clientSecret: getRequiredEnv('GOOGLE_CLIENT_SECRET'),
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  resend: {
    apiKey: process.env.RESEND_API_KEY || '',
    emailFrom:
      process.env.EMAIL_FROM || 'noreply@practicas-profesionales-itca.lat',
    emailFromName:
      process.env.EMAIL_FROM_NAME || 'Prácticas Profesionales ITCA-FEPADE',
  },
});
