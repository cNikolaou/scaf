#!/usr/bin/env node

// Entry point used to select which module to load and run it's `main()`
// function.

// NOTE: To run scripts from the `examples/` directory and load the
// dependencies from the `scaf` project, and be able to test them, we are
// adding a alias from `scaf` to `dist`. This assumes that installing
// `scaf` as a package, adds the files of `scaf` under a `/node_modules/`
// directory, which is what happens usually for Node projects. In that
// case the alias is not used. Maybe there is a better way to do that.
if (!__dirname.includes('/node_modules/')) {
    require('module-alias/register');
}

import path from 'path';

async function scriptRun() {
    // Run the TS module passed as a second command line argument
    //  npm start <script_name>

    const fileName = process.argv[2];

    try {
        const scriptPath = path.join(process.cwd(), fileName);
        const moduleFunc = await import(scriptPath);
        const mainFunc = moduleFunc['main'];

        if (typeof mainFunc === 'function') {
            await mainFunc();
        } else {
            console.log(`The module "${fileName}" does not export a function.`);
        }
    } catch (error) {
        console.error(`Failed to load module "${fileName}".`, error);
    }
}

scriptRun().catch((error) => {
    console.log(error);
});
