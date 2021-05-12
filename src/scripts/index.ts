import {execute as initializeApp} from './initialize-app';
import {execute as migrateDatabase} from './migrate-database';
import {execute as changeEnv} from './change-env';
import {execute as updateBuild} from './update-build';
import {execute as demo} from './demo';

const execute = () => {
  const args = process.argv;
  if (args.length < 3) {
    // eslint-disable-next-line no-console
    console.log('Please specify the script name');
    return;
  }

  const scripts = {
    'initialize-app': initializeApp,
    'migrate-database': migrateDatabase,
    'change-env': changeEnv,
    'update-build': updateBuild,
    demo,
  };
  if (!scripts[args[2]]) {
    // eslint-disable-next-line no-console
    console.log('Invalid script name');
    return;
  }
  scripts[args[2]]();
};

execute();
