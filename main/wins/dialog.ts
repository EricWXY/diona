import { IPC_EVENTS, WINDOW_NAMES } from '@common/constants';
import { BrowserWindow, ipcMain } from 'electron';
import { windowManager } from '../service/WindowService';

export function setupDialogWindow() {
  let dialogWindow: BrowserWindow | void;
  let params: CreateDialogProps | void;
  let feedback: string | void

  ipcMain.handle(WINDOW_NAMES.DIALOG + 'get-params',(e)=>{
    if(BrowserWindow.fromWebContents(e.sender) !== dialogWindow) return
    return {
      winId: e.sender.id,
      ...params
    }
  });

  ['confirm','cancel'].forEach(_feedback => {
    ipcMain.on(WINDOW_NAMES.DIALOG + _feedback,(e,winId:number)=> {
      if(e.sender.id !== winId) return
      feedback = _feedback;
      windowManager.close(BrowserWindow.fromWebContents(e.sender));
    });
  });

  ipcMain.handle(`${IPC_EVENTS.OPEN_WINDOW}:${WINDOW_NAMES.DIALOG}`, (e, _params) => {
    params = _params;
    dialogWindow = windowManager.create(
      WINDOW_NAMES.DIALOG,
      {
        width: 350, height: 200,
        minWidth: 350, minHeight: 200,
        maxWidth: 400, maxHeight: 300,
      },
      {
        parent: BrowserWindow.fromWebContents(e.sender) as BrowserWindow,
        resizable: false
      }
    );

    return new Promise<string | void>((resolve) => dialogWindow?.on('closed', () => {
      resolve(feedback);
      feedback = void 0;
    }))
  })

}

export default setupDialogWindow
