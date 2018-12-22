import * as os from 'os';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { pathExists, remove } from 'fs-extra';
import axios from 'axios';

import { buildValidFileName, download, unzip, unwrap } from '../../services/utils';
import { setPackageDotJson, setSheetbaseDotJson } from '../../services/project';
import { logError, logOk, logAction } from '../../services/message';

import { Options } from './project';

export async function projectStartCommand(params: string[], options?: Options) {
    // project name and path
    let [name, url ] = params;
    name = buildValidFileName(name || `sheetbase-project-${(new Date()).getTime()}`);
    const deployPath = resolve(name);

    // check if a project exists
    if (await pathExists(name)) {
        return logError('PROJECT_START__ERROR__EXISTS');
    }

    // prepare the resource url
    url = await resolveResource(url);
    if (!url || (!url.endsWith('.git') && !url.endsWith('.zip'))) {
        return logError('PROJECT_START__ERROR__INVALID_RESOURCE');
    }

    // project files
    await logAction('Get the resource: ' + url, async () => {
        if (url.endsWith('.git')) {
            gitClone(url, name); // clone the repo when has .git
            await remove(deployPath + '/' + '.git'); // delete .git folder
        } else {
            const downloadedPath = await download(url, deployPath, 'resource.zip');
            await unzip(downloadedPath, deployPath);
            await remove(downloadedPath);
            await unwrap(deployPath); // if wrapped in a folder
        }
    });

    // finalize for theme
    if (await pathExists(deployPath + '/sheetbase.json')) {

        // reset theme configs
        await logAction('Initial config the project', async () => {
            // package.json
            await setPackageDotJson(
                {
                    name,
                    version: '1.0.0',
                    description: 'A Sheetbase project',
                },
                (currentData, data) => {
                    // keep these fields
                    const { author, homepage, scripts } = currentData;
                    return { ... data, author, homepage, scripts };
                },
                deployPath,
            );

            // sheetbase.json
            await setSheetbaseDotJson(
                {
                    driveFolder: '',
                    configs: {
                        backend: {},
                        frontend: {},
                    },
                },
                // override above fields and keep the rest
                (currentData, data) => ({ ... currentData, ... data }),
                deployPath,
            );
        });

        // install packages
        if (options.npm) {
            await logAction('Install dependencies (please wait, could take minutes)', async () => {
                const NPM = (os.type() === 'Windows_NT') ? 'npm.cmd' : 'npm';
                execSync(`${NPM} install`, { cwd: deployPath + '/backend', stdio: 'inherit' });
                execSync(`${NPM} install`, { cwd: deployPath + '/frontend', stdio: 'inherit' });
            });
        }

        // run setup
        if (options.setup) {
            const SHEETBASE = (os.type() === 'Windows_NT') ? 'sheetbase.cmd' : 'sheetbase';
            execSync(`${SHEETBASE} setup`, { cwd: deployPath, stdio: 'inherit' });
        } else {
            logOk('PROJECT_START__OK__THEME', true);
        }

    } else {
        logOk('PROJECT_START__OK__NOT_THEME', true);
    }

}

async function resolveResource(resource?: string) {
    /**
     * n/a > blank-angular@latest
     * name > name@latest
     * name@ver > name@ver
     * <name>/<repo>@ver
     * full zip url > full zip url
     */
    resource = (resource || 'sheetbase-themes/blank-angular').replace('@latest', '');
    if (!resource.endsWith('.git') && !resource.endsWith('.zip')) {
        // add repo org
        if (resource.indexOf('/') < 0) {
            resource = 'sheetbase-themes/' + resource;
        }
        // add version
        if (resource.indexOf('@') < 0) {
            const { data } = await axios({
                method: 'GET',
                url: `https://api.github.com/repos/${resource}/releases/latest`,
            });
            resource = resource + '@' + data.name;
        }
        // final resource = <org>/<repo>@<version>
        const [ name, version ] = resource.split('@');
        resource = `https://github.com/${name}/archive/${version}.zip`;
    }
    return resource;
}

function gitClone(url: string, name: string) {
    execSync(`git clone ${url} ${name}`, { stdio: 'ignore' });
}