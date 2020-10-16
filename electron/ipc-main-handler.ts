import { ipcMain } from "electron";
import * as Store from "electron-store";
import * as fs from "fs";

export const initIpcMain = (): void => {
  const store = new Store();
  ipcMain.handle("read-dir", async () => fs.promises.readdir("./"));
  ipcMain.handle("save", (event, str: string) => {
    store.set("unicorn", str);
    console.log(`save: ${str}`);
  });
};