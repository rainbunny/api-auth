import bunyan from 'bunyan';
import {config} from '@tqt/api-core';

const log = bunyan.createLogger({
  name: config().APP_NAME,
  level: process.env.LOG_LEVEL as unknown as bunyan.LogLevel,
});

export {log};
