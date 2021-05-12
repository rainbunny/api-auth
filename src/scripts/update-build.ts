import {ReplaceStringTask, runReplaceTasks} from './run-replace-tasks';

export const updateBuild = (build: string = process.env.APP_BUILD_NO || ''): void => {
  if (!build) {
    return;
  }

  const replaceTasks: ReplaceStringTask[] = [
    {
      src: `./src/server.config.ts`,
      replaces: [
        {
          old: /BUILD: process.env.BUILD \|\| '.*',/,
          new: `BUILD: process.env.BUILD || '${build}',`,
        },
      ],
    },
  ];

  runReplaceTasks(replaceTasks);
};

export const execute = (): void => {
  updateBuild(process.argv[3]);
};
