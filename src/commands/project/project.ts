import { isValid } from '../../services/project';
import { projectHelp } from '../../services/help';
import { logInfo, logError } from '../../services/message';

import { projectStartCommand } from './project-start';
import { projectSetupCommand } from './project-setup';
import { projectConfigsCommand } from './project-configs';
import { projectConfigCommand } from './project-config';
import { projectInfoCommand } from './project-info';
import { projectUrlsCommand } from './project-urls';
import { projectUrlCommand } from './project-url';
import { projectModelsCommand } from './project-models';
import { projectModelCommand } from './project-model';

export interface Options {
    npm?: boolean;
    setup?: boolean;
    open?: boolean;
    database?: string;
    clean?: boolean;
}

export async function projectCommand(command: string, params: string[] = [], options: Options = {}) {
    if (
        !!command &&
        !['start', 'new'].includes(command) &&
        !await isValid()
    ) {
        return logError('PROJECT__ERROR__INVALID');
    }

    switch (command) {
        case 'start':
        case 'new':
            await projectStartCommand(params, options);
        break;

        case 'setup':
            await projectSetupCommand();
        break;

        case 'configs':
            await projectConfigsCommand();
        break;

        case 'config':
            await projectConfigCommand(params.shift(), params);
        break;

        case 'urls':
            await projectUrlsCommand();
        break;

        case 'url':
            await projectUrlCommand(params.shift(), options);
        break;

        case 'models':
            await projectModelsCommand();
        break;

        case 'model':
            await projectModelCommand(params, options);
        break;

        case 'info':
            await projectInfoCommand();
        break;

        default:
            logInfo('APP__INFO__INVALID_SUBCOMMAND');
            console.log(projectHelp());
        break;
    }
}
