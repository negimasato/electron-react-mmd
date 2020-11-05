import { IpcRenderer } from 'electron';

// global の名前空間にある定義を上書き
declare global {
  interface Window {
    ipcRenderer: IpcRenderer;
  }
}