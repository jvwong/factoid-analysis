import r from 'rethinkdb';
import fs from 'fs';
import * as config from '../config.js';

const MAX_DATE = '9999-12-31';
const MIN_DATE = '1400-01-01';

export default {
  connect: function () {
    if (this.conn) {
      return Promise.resolve(this.conn);
    } else {
      return r.connect({
        host: config.DB_HOST,
        port: config.DB_PORT,
        db: config.DB_NAME,
        user: config.DB_USER,
        password: config.DB_PASS,
        ssl: config.DB_CERT
          ? {
              ca: fs.readFileSync(config.DB_CERT)
            }
          : undefined
      }).then(conn => {
        this.conn = conn;

        return conn;
      });
    }
  },

  reconnectOnClose: function (doConnect) {
    const shouldRec = this.shouldReconnectOnClose = doConnect;

    if (!this.preparedForClose) {
      this.preparedForClose = true;

      const reconnect = () => this.conn.reconnect({ noreplyWait: false }).run();
      const keepTrying = () => reconnect().catch(keepTrying);

      this.conn.on('close', function () {
        if (shouldRec) {
          reconnect().catch(keepTrying);
        }
      });
    }
  },

  getTable: function (tableName) {
    return this.connect().then(() => {
      return this.getDb();
    }).then(() => {
      return this.db.tableList().run(this.conn);
    }).then(tables => {
      if (!tables.includes(tableName)) {
        throw new Error(`Cannot find table ${tableName}`);
      } else {
        return Promise.resolve();
      }
    }).then(() => {
      return this.db.table(tableName);
    });
  },

  getDb: function () {
    if (this.db) {
      return Promise.resolve(this.db);
    }

    return this.connect().then(() => {
      return r.dbList().run(this.conn);
    }).then(dbs => {
      if (!dbs.includes(config.DB_NAME)) {
        throw new Error(`Cannot find database ${config.DB_NAME}`);
      } else {
        return Promise.resolve();
      }
    }).then(() => {
      this.db = r.db(config.DB_NAME);
      return this.db;
    });
  },

  accessTable: function (tableName) {
    return this.getTable(tableName).then(table => {
      return {
        rethink: r,
        conn: this.conn,
        db: this.db,
        table
      };
    });
  },

  tryForTable: function (tableName, maxTries = 6) {
    const BASE = 8;
    const delay = retryCount => new Promise(resolve => setTimeout(resolve, 1000 + BASE ** retryCount));
    const tryTable = (name, retryCount = 0) => this.accessTable(name)
      .catch(() => {
        if (retryCount <= maxTries) {
          console.warn(`Attempt ${retryCount} at accessing table '${name}' failed`);
          console.warn(`Next try in ${(1000 + BASE ** retryCount) / 1000} seconds`);
          return delay(retryCount).then(() => tryTable(name, retryCount + 1));
        }
      });

    return tryTable(tableName);
  }
};

export {
  MAX_DATE,
  MIN_DATE
};
