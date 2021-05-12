import fs from 'fs';
import _ from 'lodash/fp';
import {Observable, of} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import {RxExtendedPoolClient} from '@rainbunny/pg-extensions';
import {Database, log} from '@core';
import {configureServer} from '../server.config';

const migrationFolder = `./db-migration`;

const createMigrationTableQuery = `
  CREATE TABLE IF NOT EXISTS migration(
      id INT PRIMARY KEY,
      version VARCHAR(4000) NOT NULL,
      createdAt BIGINT NOT NULL DEFAULT(
          extract(
              epoch
              from now()
          ) * 1000
      ) 
  );
`;

const getLatestVersionQuery = `
  SELECT id, version
  FROM migration
  ORDER BY id DESC
  LIMIT 1;
`;

const insertVersionQuery = `
  INSERT INTO migration(id, version) VALUES(:id, :version);
`;

const deleteVersionQuery = `
  DELETE FROM migration WHERE version = :version;
`;

const runMigration = ({
  currentVersion,
  mode,
  targetVersion,
  client,
}: {
  currentVersion: {
    id: number;
    version: string;
  };
  mode: string;
  targetVersion: string;
  client: RxExtendedPoolClient;
}): Observable<void> => {
  if (!['up', 'down'].includes(mode)) {
    throw new Error(`Invalid migration operation: ${mode}`);
  }
  const versionFilePaths = _.sortedUniq(fs.readdirSync(`${migrationFolder}/${mode}`));
  if (targetVersion && !versionFilePaths.includes(`${targetVersion}.sql`)) {
    throw new Error(`Invalid target version: ${targetVersion}`);
  }
  let currentId = currentVersion ? currentVersion.id : -1;
  const currentVer = currentVersion?.version;
  const currentVersionIndex = versionFilePaths.indexOf(`${currentVer}.sql`);

  let executor = of(undefined);
  if (mode === 'up') {
    versionFilePaths
      .filter((_versionFilePath, index) => index > currentVersionIndex)
      .forEach((versionFilePath) => {
        executor = executor.pipe(
          tap(() => log.info(`Migrating up ${versionFilePath}...`)),
          switchMap(() =>
            client.executeQuery({queryText: fs.readFileSync(`${migrationFolder}/${mode}/${versionFilePath}`, 'utf8')}),
          ),
          switchMap(() => {
            currentId += 1;
            return client.executeQuery({
              queryText: insertVersionQuery,
              params: {id: currentId, version: versionFilePath.split('.')[0]},
            });
          }),
        );
      });
    return executor;
  }

  if (!targetVersion) {
    throw new Error(`Missing target version`);
  }
  const targetVersionIndex = versionFilePaths.indexOf(`${targetVersion}.sql`);

  versionFilePaths
    .filter((_versionFilePath, index) => index > targetVersionIndex && index <= currentVersionIndex)
    .reverse()
    .forEach((versionFilePath) => {
      executor = executor.pipe(
        tap(() => log.info(`Migrating down ${versionFilePath}...`)),
        switchMap(() =>
          client.executeQuery({queryText: fs.readFileSync(`${migrationFolder}/${mode}/${versionFilePath}`, 'utf8')}),
        ),
        switchMap(() =>
          client.executeQuery({
            queryText: deleteVersionQuery,
            params: {version: versionFilePath.split('.')[0]},
          }),
        ),
      );
    });
  return executor;
};

export const execute = (): void => {
  const executor = configureServer()
    .container.resolve<Database>('writeDatabase')
    .executeTransaction((client) =>
      of({}).pipe(
        switchMap(() => client.executeQuery({queryText: createMigrationTableQuery})),
        switchMap(() => client.executeQuery({queryText: getLatestVersionQuery})),
        switchMap((latestVersion: {id: number; version: string}[]) =>
          latestVersion.length === 0 ? of(undefined) : of(latestVersion[0]),
        ),
        switchMap((currentVersion) =>
          runMigration({
            mode: _.lowerCase(process.argv[3]),
            targetVersion: process.argv[4],
            currentVersion,
            client,
          }),
        ),
      ),
    )
    .subscribe(() => {
      log.info('Migration completed');
      executor.unsubscribe();
    }, log.error.bind(log));
};
