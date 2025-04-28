# Setup Scripts - README

This folder (`setup/containers/apps`) contains helper scripts for setting up the Keycloak Demo workshop environment.
They automate the configuration of environment files, verification, and installation of project dependencies.

## Folder Structure

```
setup/
└── containers/
    └── apps/
        ├── install_env.bat       (generate .env files - Windows)
        ├── install_env.sh        (generate .env files - Linux/Mac)
        ├── check_env.bat         (verify .env files exist - Windows)
        ├── check_env.sh          (verify .env files exist - Linux/Mac)
        ├── install_deps.bat      (npm install all projects - Windows)
        ├── install_deps.sh       (npm install all projects - Linux/Mac)
        ├── install_all.bat       (run install_env + check_env + install_deps - Windows)
        └── install_all.sh        (run install_env + check_env + install_deps - Linux/Mac)
```

## Scripts Description

- **install\_env**

  - Creates all necessary `.env` files for backend and frontend services.

- **check\_env**

  - Verifies that all `.env` files were correctly created and exist in the right directories.

- **install\_deps**

  - Executes `npm install` inside each project folder to install all Node.js dependencies.

- **install\_all**

  - Calls `install_env`, `check_env`, and `install_deps` sequentially.
  - Recommended script to run for full environment preparation.

## Usage

Navigate to the `setup/containers/apps` directory and run the appropriate script for your OS.

For Windows (PowerShell or CMD):

```bash
install_all.bat
```

For Linux/Mac:

```bash
./install_all.sh
```

> **Note:** All scripts automatically switch back to their own script directory after execution to maintain context.

