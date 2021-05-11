import {ReplaceStringTask, runReplaceTasks} from './run-replace-tasks';

export const updateBuild = (build: string = process.env.APP_BUILD_NO || ''): void => {
  if (!build) {
    return;
  }

  const replaceTasks: ReplaceStringTask[] = [];

  runReplaceTasks(replaceTasks);
};

((): void => {
  updateBuild(process.argv[2]);
})();
