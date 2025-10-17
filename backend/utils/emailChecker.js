const { ImapFlow } = require('imapflow');

const FOLDER_MAPPINGS = {
  gmail: {
    inbox: 'INBOX',
    spam: '[Gmail]/Spam',
    promotions: '[Gmail]/Promotions',
    social: '[Gmail]/Social',
    updates: '[Gmail]/Updates',
  },
  outlook: {
    inbox: 'INBOX',
    spam: 'Junk Email',
    promotions: 'Promotions',
  },
  yahoo: {
    inbox: 'INBOX',
    spam: 'Bulk Mail',
    promotions: '[Yahoo]/Promotions',
  },
  proton: {
    inbox: 'INBOX',
    spam: 'Spam',
    trash: 'Trash',
  },
  aol: {
    inbox: 'INBOX',
    spam: 'Spam',
  },
};

class EmailChecker {
  constructor(config) {
    this.config = config;
  }

  async connect() {
    this.client = new ImapFlow({
      host: this.config.imap,
      port: 993,
      secure: true,
      auth: {
        user: this.config.user,
        pass: this.config.pass,
      },
      logger: false,
      maxRedirects: 5,
    });

    await this.client.connect();
    return this;
  }

  async searchEmail(testCode) {
    try {
      const boxes = await this.client.mailboxes();
      const result = {
        received: false,
        folder: 'Not Found',
        timestamp: new Date(),
      };

      const foldersToCheck = [
        'INBOX',
        'Junk Email',
        '[Gmail]/Spam',
        'Spam',
        'Bulk Mail',
        '[Gmail]/Promotions',
        'Promotions',
        '[Yahoo]/Promotions',
      ];

      for (const folderName of foldersToCheck) {
        if (boxes.has(folderName)) {
          const lock = await this.client.getMailboxLock(folderName);
          try {
            const messages = await this.client.search({
              body: testCode,
              headerFields: { subject: 1 },
            });

            if (messages.length > 0) {
              result.received = true;
              result.folder = folderName;
              result.messageCount = messages.length;
              break;
            }
          } catch (err) {
            console.error(`Error searching ${folderName}:`, err);
          } finally {
            lock.release();
          }
        }
      }

      return result;
    } catch (err) {
      console.error('Error searching email:', err);
      throw err;
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.logout();
    }
  }
}

module.exports = EmailChecker;