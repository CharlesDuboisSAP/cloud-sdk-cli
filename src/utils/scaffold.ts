/*!
 * Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
 */

import cli from 'cli-ux';
import * as execa from 'execa';
import * as fs from 'fs';
import * as path from 'path';
import * as rm from 'rimraf';
import { recordWarning } from '../utils/';

export async function shouldBuildScaffold(projectDir: string, buildScaffold: boolean, force: boolean = false): Promise<boolean> {
  if (buildScaffold) {
    await checkForEmptyDir(projectDir, force);
    return true;
  }

  if (fs.existsSync(path.resolve(projectDir, 'package.json'))) {
    return false;
  }

  cli.log(`The target directory (${projectDir}) does not contain a \`package.json.\``);

  if (await cli.confirm('Should a new `nest.js` project be initialized in the target directory? (y|n)')) {
    await checkForEmptyDir(projectDir, force);
    return true;
  }
  cli.info('➡️ Cancelling `init` because a valid `package.json` is required to run.');
  return cli.exit(13);
}

async function checkForEmptyDir(projectDir: string, force: boolean) {
  if (fs.readdirSync(projectDir).length !== 0) {
    const dirString = projectDir === '.' ? 'this directory' : `"${projectDir}"`;
    const question = `Directory is not empty. Creating the scaffold will fail if there are conflicting files. Should ALL files in ${dirString} be removed? (y|n)`;
    if (force || (await cli.confirm(question))) {
      rm.sync(`${projectDir}/{*,.*}`);
    }
  }
}

export async function buildScaffold(projectDir: string, verbose: boolean, addCds: boolean) {
  cli.action.start('Building application scaffold');
  const options: execa.Options = {
    cwd: projectDir,
    stdio: verbose ? 'inherit' : 'ignore'
  };

  await execa('npx', ['-p', '@nestjs/cli', 'nest', 'new', '.', '--skip-install', '--package-manager', 'npm'], options);

  fs.unlinkSync(path.resolve(projectDir, 'README.md'));
  modifyMainTs(path.resolve(projectDir, 'src', 'main.ts'));
  modifyTsconfigBuildJson(path.resolve(projectDir, 'tsconfig.build.json'));
  modifyTsconfigJson(path.resolve(projectDir, 'tsconfig.json'));
  if (addCds) {
    addCatalogueModule(path.resolve(projectDir, 'src', 'app.module.ts'));
  }
  cli.action.stop();
}

function modifyMainTs(pathToMainTs: string) {
  const mainTs = fs.readFileSync(pathToMainTs, { encoding: 'utf8' });
  const modifiedListen = '.listen(process.env.PORT || 3000)';
  const modifiedMainTs = mainTs.replace('.listen(3000)', modifiedListen);

  if (!modifiedMainTs.includes(modifiedListen)) {
    recordWarning('Could not set listening port to `process.env.PORT`', 'in file `app.module.ts`. Please adjust manually.');
  } else {
    try {
      fs.writeFileSync(pathToMainTs, modifiedMainTs);
    } catch (err) {
      recordWarning('Could not set listening port to `process.env.PORT`', 'in file `app.module.ts`. Please adjust manually.');
    }
  }
}

function modifyTsconfigBuildJson(pathToTsconfigBuildJson: string) {
  const tsconfigBuildJson = fs.readFileSync(pathToTsconfigBuildJson, { encoding: 'utf8' });
  const jsonObj = JSON.parse(tsconfigBuildJson);
  if (jsonObj.exclude) {
    jsonObj.exclude = [...jsonObj.exclude, 'deployment'];
  }
  try {
    fs.writeFileSync(pathToTsconfigBuildJson, JSON.stringify(jsonObj, null, 2));
  } catch (err) {
    recordWarning('Could not exclude deployment`', 'in file `tsconfig.build.json`. Please adjust manually.');
  }
}

function modifyTsconfigJson(pathToTsconfigJson: string) {
  const tsconfigJson = fs.readFileSync(pathToTsconfigJson, { encoding: 'utf8' });
  const jsonObj = JSON.parse(tsconfigJson);
  if (jsonObj.compilerOptions) {
    jsonObj.compilerOptions = { ...jsonObj.compilerOptions, allowJs: true };
  }
  try {
    fs.writeFileSync(pathToTsconfigJson, JSON.stringify(jsonObj, null, 2));
  } catch (err) {
    recordWarning('Could not add compiler option "allowJs": true`', 'in file `tsconfig.json`. Please adjust manually.');
  }
}

export function addCatalogueModule(pathToAppModuleTs: string) {
  const appModuleTs = fs.readFileSync(pathToAppModuleTs, { encoding: 'utf8' });
  const moduleName = 'CatalogueModule';
  const importToAdd = `import { ${moduleName} } from './catalogue/catalogue.module';`;
  const modifiedAppModuleTs = appModuleTs
    .replace('@Module', [importToAdd, '@Module'].join('\n\n'))
    .replace('imports: []', `imports: [${moduleName}]`);

  if (!modifiedAppModuleTs.includes(`imports: [${moduleName}]`)) {
    recordWarning(`Could not add module ${moduleName} to \`app.module.ts\`. Please add manually.`);
  } else {
    fs.writeFileSync(pathToAppModuleTs, modifiedAppModuleTs);
  }
}
