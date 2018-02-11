import installExtension, {VUEJS_DEVTOOLS} from 'electron-devtools-installer';
import {app, BrowserWindow, globalShortcut} from 'electron';
import * as url from 'url';
import {Logger} from './api/dev/Logger';
import {initApplication, stopApplication} from './api/main';
import {Ipc} from './api/ipc/Ipc';
import {ApiDevUtilities} from './api/dev/ApiDevUtilities';

const paths = require('../config/paths');
const sourceMapSupport = require('source-map-support');
sourceMapSupport.install();
const logger = Logger.getLogger('electron-main.ts');

const userDataDir = app.getPath('userData');
logger.info('');
logger.info('');
logger.info('=============================');
logger.info('Starting Abc-Map application');
logger.info(`NODE_ENV=${process.env.NODE_ENV}`);
logger.info(`DEV_MODE=${ApiDevUtilities.isDevMode()}`);
logger.info(`User data can be found at: ${userDataDir}`);
logger.info('=============================');
logger.info('');
logger.info('');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow;

async function createWindow() {

    // Create the browser window.
    win = new BrowserWindow({
        height: 768,
        webPreferences: {
            nodeIntegration: true,
        },
        width: 1024,
    });
    win.setMenu(null);
    win.maximize();

    // and load the index.html of the app.
    let indexUrl = url.format({
        pathname: paths.INDEX_DEST,
        protocol: 'file:',
        slashes: true,
    });
    if (ApiDevUtilities.isDevMode()) {
        logger.info(' ** Dev mode enabled, installing dev tools ** ');
        indexUrl = url.format('http://localhost:9090');
        setupDevTools();
    }
    logger.info(`Using URL for index: ${indexUrl}`);
    win.loadURL(indexUrl);

    // Open the DevTools.
    setTimeout(() => {
        win.webContents.openDevTools();
    }, 500);

    // Emitted when the window is closed.
    win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        (win as any) = null;
    });

    // init api application
    const ipc = Ipc.newInstance(win.webContents);

    const services = await initApplication(ipc);

    if (ApiDevUtilities.isDevMode()) {
        logger.info('Setting up dev project.');
        await ApiDevUtilities.setupDevProject(services);
    }

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', async () => {

    logger.info('All windows are closed, shutting down app ...');

    try {
        await stopApplication();
        logger.info('Database closed, quitting app');
        app.exit(0);
    } catch (error) {
        logger.error('Error while closing app, quitting app. Error: ', error);
        app.exit(1);
    }

});

process.on('SIGINT', async () => {
    console.log('Caught interrupt signal');

    await stopApplication();
    process.exit();

});

process.on('exit', (code) => {
    logger.info(`Process will exit with code ${code}`);
});

// listen for unhandled rejections and uncaught errors
process.on('unhandledRejection', (reason, p) => {
    logger.error('[UNHANDLED REJECTION ERROR]', {reason, p});
});

process.on('uncaughtException', (err) => {
    logger.error('[UNCAUGHT ERROR]', {error: err});
});

function setupDevTools() {
    // install VueJS dev tools
    installExtension(VUEJS_DEVTOOLS)
        .then((name) => logger.info(`Added Extension:  ${name}`))
        .catch((err) => logger.error('An error occurred: ', err));
}
