import fs from 'fs';

export interface ReplaceStringTask {
  src: string;
  replaces: {
    old: RegExp | string;
    new: string;
  }[];
}

export const runReplaceTasks = (replaceTasks: ReplaceStringTask[]): void => {
  replaceTasks.forEach((replaceTask) => {
    if (!fs.existsSync(replaceTask.src)) {
      return;
    }
    const oldContent = fs.readFileSync(replaceTask.src, {
      encoding: 'utf8',
    });

    let newContent = oldContent;
    replaceTask.replaces.forEach((replace) => {
      newContent = newContent.replace(replace.old, replace.new);
    });

    fs.writeFileSync(replaceTask.src, newContent);
    // eslint-disable-next-line no-console
    console.log(`updated ${replaceTask.src}`);
  });
};
