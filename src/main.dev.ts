/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build-main`, this file is compiled to
 * `./src/main.prod.js` using webpack. This gives us some performance wins.
 */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import { app, BrowserWindow, Menu, shell, Tray } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { menubar } from 'menubar';

import fetch from 'node-fetch';
import Jimp from 'jimp';
import MenuBuilder from './menu';
import TrayGenerator from './TrayGenerator';
import { Entry } from './nsAPI';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

const mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let tray2: Tray | null = null;
let tray3: Tray | null = null;
let tray4: Tray | null = null;

const isMac = process.platform === 'darwin';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (
  process.env.NODE_ENV === 'development' ||
  process.env.DEBUG_PROD === 'true'
) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

const doImageStuff = (glucose: string, exportImageName: string) => {
  const imgExported = exportImageName;

  const textData = {
    text: glucose, // the text to be rendered on the image
    maxWidth: 16,
    maxHeight: 16,
    placementX: 0,
    placementY: 0,
  };

  const image = new Jimp(16, 16, 'white', (err) => {
    if (err) console.log(err);
  });

  Jimp.loadFont(Jimp.FONT_SANS_8_BLACK)
    .then((font) => [image, font])
    .then((data) => {
      const tpl: any = data[0];
      const font: any = data[1];

      return tpl.print(
        font,
        textData.placementX,
        textData.placementY,
        {
          text: textData.text,
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
        },
        textData.maxWidth,
        textData.maxHeight
      );
    })
    .then((tpl: any) => tpl.quality(100).write(imgExported)) // catch errors
    .catch((err) => {
      console.error(err);
    });
};

const createWindowsTrayIcons = (
  glucoseMmol: string,
  differenceString: string
) => {
  doImageStuff(glucoseMmol, getAssetPath('icons/glucose.png'));

  doImageStuff(differenceString, getAssetPath('icons/delta.png'));

  tray2?.setImage(getAssetPath('icons/glucose.png'));
  tray4?.setImage(getAssetPath('icons/delta.png'));
  tray3?.setImage(getAssetPath('arrows/flat.png'));
};

const handleGlucoseUpdate = async (
  sgv: number,
  direction: string,
  difference: number
) => {
  const glucoseMmolNumber = sgv / 18;
  const differenceMmolNumber = difference / 18;
  const glucoseMmol = glucoseMmolNumber.toFixed(1);
  const differenceMmol = differenceMmolNumber.toFixed(1);

  const differenceOperator = difference >= 0 ? '+' : '';
  const differenceString = differenceOperator + differenceMmol.toString();

  if (!isMac) createWindowsTrayIcons(glucoseMmol.toString(), differenceString);

  

  // const image = await Jimp.read(getAssetPath('icons/blank.png'));

  // const font = await Jimp.loadFont(Jimp.FONT_SANS_16_BLACK);

  // image.print(font, 0, 0, {
  //   text: 'Hello world!',
  //   alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
  //   alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE,
  // });

  // image.write(getAssetPath('icons/blank_text.png'));

  // updateTrayIcon(glucoseMmolNumber);
  // tray.setToolTip(glucoseMmolString);
  tray?.setTitle(`${glucoseMmol.toString()} ${``} ${differenceString}`); // macOS specific
};

const fetchCurrentGlucose = async () => {
  return fetch('https://maigaard.herokuapp.com/api/v1/entries/sgv.json')
    .then((response: any) => response.json())
    .then((result: any) => result)
    .catch((error: any) => console.log(error));
};

const difference = function (a, b) {
  return Math.abs(a - b);
};

const fetchGlucose = () => {
  return fetchCurrentGlucose()
    .then((entries: Entry[]) => {
      if (!entries) return;
      const firstEntry = entries[0];
      const secondEntry = entries[1];
      const { sgv, direction } = firstEntry;
      let delta = difference(firstEntry.sgv, secondEntry.sgv);
      delta = firstEntry.sgv >= secondEntry.sgv ? delta : -Math.abs(delta);
      handleGlucoseUpdate(sgv, direction, delta);
      return { sgv, direction, delta };
    })
    .catch((error) => console.log(error));
};

const updateGlucose = () => {
  fetchGlucose();
  setInterval(() => fetchGlucose(), 5000);
};

const rightClickMenu = () => {
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click: () => {
        app.quit();
      },
    },
  ]);
  tray?.popUpContextMenu(contextMenu);
};

const start = async () => {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const browserWindowOptions = {
    width: 600,
    height: 450,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      nodeIntegration: true,
    },
    show: false,
    frame: false,
    fullscreenable: false,
    resizable: false,
  };

  if (!isMac) {
    const T = new TrayGenerator(getAssetPath('icons/blank_tray_icon.png'));
    tray2 = T.createTray();
    const T3 = new TrayGenerator(getAssetPath('icons/blank_tray_icon.png'));
    tray3 = T3.createTray();
    const T4 = new TrayGenerator(getAssetPath('icons/blank_tray_icon.png'));
    tray4 = T4.createTray();
  }

  const mb = menubar({
    index: `file://${__dirname}/index.html`,
    icon: getAssetPath('icons/tray_icon.png'),
    preloadWindow: true,
    browserWindow: browserWindowOptions,
  });

  mb.on('ready', () => {
    mb.app?.dock?.hide(); // Hides dock on mac
    tray = mb.tray;
    mb.tray.on('right-click', rightClickMenu);
    updateGlucose();
    mb.app.setLoginItemSettings({
      openAtLogin: true,
    });

    // fetch glucose
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(start).catch(console.log);

// app.on('activate', () => {
//   // On macOS it's common to re-create a window in the app when the
//   // dock icon is clicked and there are no other windows open.
//   if (mainWindow === null) createWindow();
// });
