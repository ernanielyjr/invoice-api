const { dbUser, dbPass, dbHost, dbPort, dbName, appPassKey, jwtSecret } = process.env;

class Database {
  get uri(): string {

    let uriPrefix = '';
    if (dbUser && dbPass) {
      uriPrefix = `${dbUser}:${dbPass}@`;
    }
    return `mongodb://${uriPrefix}${dbHost || 'localhost'}:${dbPort || 27017}/${dbName}`;
  }
}

class AppConfig {
  passKey = appPassKey || '8C1DFCE96682D7472406DF6C2F29EFD9F71E39F06EEA71DB564CBC496E4C19C6';
  database = new Database();
  jwt = {
    secret: jwtSecret || 'D6DC9BECDD295E9663AF19F889C8F0CD91B5C30970C47EB4897A9A4824C4C1CD',
    expiration: 24 * 60 * 60,
  };
}

export default new AppConfig();
