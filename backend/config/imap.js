const imapConfig = {
    gmail: {
      host: 'imap.gmail.com',
      port: 993,
      secure: true,
      tls: {
        rejectUnauthorized: false,
      },
    },
    outlook: {
      host: 'outlook.office365.com',
      port: 993,
      secure: true,
    },
    yahoo: {
      host: 'imap.mail.yahoo.com',
      port: 993,
      secure: true,
    },
    proton: {
      host: 'imap.protonmail.com',
      port: 993,
      secure: true,
    },
    aol: {
      host: 'imap.aol.com',
      port: 993,
      secure: true,
    },
  };
  
  module.exports = imapConfig;