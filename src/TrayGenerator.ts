import { app, Menu, Tray } from 'electron';

export default class TrayGenerator {
  iconPath: string;

  constructor(iconPath: string) {
    this.iconPath = iconPath;
  }

  public createTray = (): Tray => {
    const tray = new Tray(this.iconPath);
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
    tray.setIgnoreDoubleClickEvents(true);
    return tray;
  };
}
