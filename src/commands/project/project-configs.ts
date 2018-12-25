const ttyTable = require('tty-table');

import { getBackendConfigs, getFrontendConfigs } from '../../services/project';
import { green, logOk } from '../../services/message';

export async function projectConfigsCommand() {
    // load configs
    const backendConfigs = await getBackendConfigs();
    const frontendConfigs = await getFrontendConfigs();

    // print out backend configs
    if (backendConfigs) {
        const table = ttyTable([
            {value: 'Key', width: 100, align: 'left'},
            {value: 'Value', width: 500, align: 'left'},
        ], []);
        for(const key of Object.keys(backendConfigs)) {
            table.push([ key, green(backendConfigs[key] || 'n/a') ]);
        }
        console.log('\n Backend configs:');
        console.log(table.render());
    }

    // print out frontend configs
    if (frontendConfigs) {
        const table = ttyTable([
            {value: 'Key', width: 100, align: 'left'},
            {value: 'Value', width: 500, align: 'left'},
        ], []);
        for(const key of Object.keys(frontendConfigs)) {
            table.push([ key, green(frontendConfigs[key] || 'n/a') ]);
        }
        console.log('\n Frontend configs:');
        console.log(table.render());
    }

    // done
    logOk('PROJECT_CONFIGS__OK', true);
}