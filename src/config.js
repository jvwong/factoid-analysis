import _ from 'lodash';

const env = (key, defaultVal) => {
  const envObj = typeof process !== 'undefined' && process.env ? process.env : {};
  if (envObj[key] != null) {
    let val = envObj[key];

    if (_.isInteger(defaultVal)) {
      val = parseInt(val);
    } else if (_.isBoolean(defaultVal)) {
      val = JSON.parse(val);
    }

    return val;
  } else {
    return defaultVal;
  }
};

// General
export const NODE_ENV = env('NODE_ENV', undefined);

// Filesystem
export const DATA_FOLDER_ROOT = env('DATA_FOLDER_ROOT', './data');

// Database
export const DB_NAME = env('DB_NAME', 'factoid');
export const DB_HOST = env('DB_HOST', 'localhost');
export const DB_PORT = env('DB_PORT', 28015);
export const DB_USER = env('DB_USER', undefined); // username if db uses auth
export const DB_PASS = env('DB_PASS', undefined); // password if db uses auth
export const DB_CERT = env('DB_CERT', undefined); // path to a certificate (cert) file if db uses ssl