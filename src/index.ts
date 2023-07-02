// Entry point used to select which module to load and run it's `main()`
// function.

async function scriptRun() {
    // Run the TS module passed as a second command line argument
    //  npm start <script_name>

    const fileName = process.argv[2];

    try {
        const moduleFunc = await import(`../dist/${fileName}`);
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
