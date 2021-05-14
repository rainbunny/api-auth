/* eslint-disable no-control-regex */
import path from 'path';
import fs from 'fs';

interface CopyFileTask {
  src: string;
  des: string;
}

export const changeEnv = (environment = 'prod'): void => {
  const envFolder = `environments/${environment}`;
  const copyTasks: CopyFileTask[] = [
    {
      src: path.resolve(`./${envFolder}/${environment}.env`),
      des: path.resolve(`./.env`),
    },
  ];
  copyTasks.forEach((copyTask) => {
    if (!fs.existsSync(copyTask.src)) {
      return;
    }
    fs.copyFileSync(copyTask.src, copyTask.des);
    // eslint-disable-next-line no-console
    console.log(`copied ${copyTask.src} \n to ${copyTask.des}`);
  });
  // eslint-disable-next-line no-console
  console.log(`changed environment to "${environment}"`);
};

export const execute = (): void => {
  changeEnv(process.argv[3]);
};
