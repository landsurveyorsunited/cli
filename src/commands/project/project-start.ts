import { resolve } from 'path';
import { execSync } from 'child_process';
import { pathExists, remove } from 'fs-extra';
import axios from 'axios';

import { buildValidFileName } from '../../services/utils';
import { download, unzip, unwrap } from '../../services/file';
import { setPackageDotJson, setSheetbaseDotJson } from '../../services/project';
import { setClaspConfigs } from '../../services/clasp';
import { exec } from '../../services/command';
import { logError, logOk, logAction } from '../../services/message';

import { Options } from './project';

export async function projectStartCommand(params: string[], options?: Options) {
    // project name and path
    let [name, url ] = params;
    name = buildValidFileName(name || `sheetbase-project-${(new Date()).getTime()}`);
    const deployPath = resolve(name);

    // check if a project exists
    if (await pathExists(name)) {
        return logError('PROJECT__ERROR__EXISTS');
    }

    // prepare the resource url
    url = await resolveResource(url);
    if (!url || (!url.endsWith('.git') && !url.endsWith('.zip'))) {
        return logError('PROJECT_START__ERROR__INVALID_RESOURCE');
    }

    // project files
    await logAction('Get the resource: ' + url, async () => {
        if (url.endsWith('.git')) {
            // clone the repo when has .git url
            execSync(`git clone ${url} ${name}`, { stdio: 'ignore' });
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

        // reset configs
        await logAction('Initial config the project', async () => {
            // package.json
            await setPackageDotJson(
                {
                    name,
                    version: '1.0.0',
                    description: 'A Sheetbase project',
                },
                (currentData, data) => {
                    // keep only these fields
                    const { author, homepage, license, scripts } = currentData;
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
            // backend/.clasp.json
            await setClaspConfigs({ scriptId: '', projectId: '' }, true, deployPath);
        });

        // run setup
        if (options.setup) {
            await exec('sheetbase setup', deployPath);
        }

        // install packages
        if (options.install) {
            await logAction('Install backend dependencies', async () => {
                await exec('npm install', deployPath + '/backend');
            });
            await logAction('Install frontend dependencies', async () => {
                await exec('npm install', deployPath + '/frontend');
            });
        }

        logOk('PROJECT_START__OK__THEME', true, [name, options]);

    } else {
        // install packages
        if (options.install) {
            await logAction('Install dependencies', async () => {
                await exec('npm install', deployPath);
            });
        }
        logOk('PROJECT_START__OK__NOT_THEME', true, [name, options]);
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
