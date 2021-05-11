import {log} from '@core';
import {execute as initializeApp} from './initialize-app';
import {execute as migrateDatabase} from './migrate-database';
import {execute as test} from './test';

const execute = () => {
  const args = process.argv;
  if (args.length < 3) {
    log.warn('Please specify the script name');
    return;
  }

  const scripts = {
    'initialize-app': initializeApp,
    'migrate-database': migrateDatabase,
    test,
  };
  if (!scripts[args[2]]) {
    log.warn('Invalid script name');
    return;
  }
  scripts[args[2]]();
};

execute();
