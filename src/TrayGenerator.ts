import { app, Menu, Tray } from 'electron';

export default class TrayGenerator {
  iconPath: string;

  tray: Tray | null;

  constructor(iconPath: string) {
    this.iconPath = iconPath;
    this.tray = null;
  }

  rightClickMenu = () => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ]);
    this.tray?.popUpContextMenu(contextMenu);
  };

  public createTray = (): Tray => {
    this.tray = new Tray(this.iconPath);
    // const contextMenu = Menu.buildFromTemplate([
    //   {
    //     label: 'Quit',
    //     accelerator: 'Command+Q',
    //     click: () => {
    //       app.quit();
    //     },
    //   },
    // ]);
    // tray.setContextMenu(contextMenu);
    this.tray.setIgnoreDoubleClickEvents(true);
    this.tray.on('right-click', this.rightClickMenu);
    return this.tray;
  };
}
