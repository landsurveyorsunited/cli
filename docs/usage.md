## Usage

### Google

Manage Google accounts.
Sub-commands: list|ls, connect|add, disconnect|remove|rm, default.

#### Options

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `-y,--yes`: (connect) Agree on account connection.
- `-c,--creds`: (connect) Save credential to .googlerc.json.
- `-f,--full`: (connect) Not recommended, grant full access to Drive.
- `-d,--default`: (list) Show default account only.

### Project

Project general tasks.
Sub-commands: start, setup, configs, config, urls, url, info, models, model.

#### Options

- `subCommand`: Supported sub-commands.
- `params`: Command params, comma-separated.
- `-i,--install`: (start) Install npm packages.
- `-m,--no-setup`: (start) Do not run setup command.
- `-o,--open`: (url) Open the url in browser.
- `-d,--database`: (model) Custom database.
- `-c,--clean`: (model) Remove the default 'Sheet1'.

### Start

Start a new project.
Proxy of **project start**

#### Options

- `projectName`: Name of the project, auto default.
- `resource`: Resource to create the project with, default to theme **blank_angular**.
- `-i,--install`: Install npm packages.
- `-m,--no-setup`: Do not run setup command.

### Setup

Setup the project.
Proxy of **project setup**

### Configs

View project configs.
Proxy of **project configs**

### Config

Config the project.
Proxy of **project config**
Sub-commands: list, update, import, export

#### Options

- `subCommand`: Optional supported sub-commands, default: **list**.
- `params`: Command params, comma-separated.

### Urls

View project URLs.
Proxy of **project urls**

### Url

View or open a project URL.
Proxy of **project url**

#### Options

- `name`: Url name to view or open with.
- `-o,--open`: Open the url in browser.

### Models

View project models.
Proxy of **project models**

### Model

Create database models.
Proxy of **project model**

#### Options

- `schemaFiles`: List of schema files.
- `-d,--database`: Custom database.
- `-c,--clean`: Remove the default 'Sheet1'.

### Info

Output project info.
Proxy of **project info**

### Backend

Run backend related commands.

#### Options

- `subCommand`: Optional supported sub-commands.

### Frontend

Run frontend related commands.

#### Options

- `subCommand`: Optional supported sub-commands.

### Docs

Open the documentation.

### Update

Check and install update.

#### Options

- `-y,--yes`: Install update when available.

### Help

Display help.

#### Options

- `-d,--detail`: Detail help.

### *

Any other command will run: npm run <cmd>.