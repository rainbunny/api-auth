/* eslint-disable no-control-regex */
import path from 'path';
import fs from 'fs';
import {ReplaceStringTask, runReplaceTasks} from './run-replace-tasks';

interface CopyFileTask {
  src: string;
  des: string;
}

export const changeEnv = async (environment = 'production'): Promise<void> => {
  const envFolder = `environments/${environment}`;
  const copyTasks: CopyFileTask[] = [
    {
      src: path.resolve(__dirname, `../${envFolder}/.env.${environment}`),
      des: path.resolve(__dirname, `.env`),
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

  const replaceTasks: ReplaceStringTask[] = [
    // {
    //   src: path.resolve(__dirname, `../android/app/build.gradle`),
    //   replaces: [
    //     {
    //       old: /applicationId "[\w,.]*"/,
    //       new: `applicationId "${config().android.id}"`,
    //     },
    //   ],
    // },
  ];

  runReplaceTasks(replaceTasks);
};

((): void => {
  changeEnv(process.argv[2]);
})();
