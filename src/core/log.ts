/* eslint-disable no-console */
import {config} from '@tqt/api-core';
import bunyan from 'bunyan';

const bunyanLog = bunyan.createLogger({name: config().APP_NAME, level: process.env.LOG_LEVEL as bunyan.LogLevel});

const debug = {
  info: (...params) => {
    params.forEach((val) => console.log(val));
    return true;
  },
  error: (...params) => {
    params.forEach((val) => console.error(val));
    return true;
  },
  debug: (...params) => {
    params.forEach((val) => console.debug(val));
    return true;
  },
  warn: (...params) => {
    params.forEach((val) => console.warn(val));
    return true;
  },
} as unknown as typeof bunyanLog;

const log = process.env.NODE_ENV === 'develop' ? debug : bunyanLog;
export {log};
