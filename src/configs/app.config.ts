const appConfig = {
  passKey: '8C1DFCE96682D7472406DF6C2F29EFD9F71E39F06EEA71DB564CBC496E4C19C6',
  database: {
    uri: 'mongodb://myplan:mYpl75$nAp1@ds263161.mlab.com:63161/myplan-api',
    // uri: 'mongodb://127.0.0.1:27017/myplan-api',
  },
  jwt: {
    secret: 'D6DC9BECDD295E9663AF19F889C8F0CD91B5C30970C47EB4897A9A4824C4C1CD',
    expiration: 24 * 60 * 60,
  }
};

export default appConfig;
