import * as dotenv from 'dotenv';

dotenv.config();

const {
  dbUser,
  dbPass,
  dbHost,
  dbName,
  apiBaseUrl,
  adminEmail,
  emailBaseUrl,
  smtpService,
  smtpUser,
  smtpPass,
  smtpName,
  smtpEmail,
  appPassKey,
  jwtSecret,
  pagSeguroEmail,
  pagSeguroToken,
  pagSeguroMode,
  pagSeguroNotificationUrl,
  pagSeguroAllowedOriginUrl
} = process.env;

class Database {
  get uri(): string {

    let uriPrefix = '';
    if (dbUser && dbPass) {
      uriPrefix = `${dbUser}:${dbPass}@`;
    }
    return `mongodb+srv://${uriPrefix}${dbHost}/${dbName}`;
  }
}

class AppConfig {
  apiBaseUrl = apiBaseUrl;
  adminEmail = adminEmail;
  emailBaseUrl = emailBaseUrl;
  smtp = {
    service: smtpService,
    user: smtpUser,
    pass: smtpPass,
    name: smtpName,
    email: smtpEmail,
  };
  passKey = appPassKey;
  database = new Database();
  jwt = {
    secret: jwtSecret,
    expiration: 24 * 60 * 60,
  };
  pagSeguro = {
    email: pagSeguroEmail,
    token: pagSeguroToken,
    mode: pagSeguroMode as 'payment' | 'sandbox' | 'subscription',
    notificationUrl: pagSeguroNotificationUrl,
    allowedOriginUrl: pagSeguroAllowedOriginUrl,
  };
}

export default new AppConfig();
