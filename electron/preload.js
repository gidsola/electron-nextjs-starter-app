const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('processBridge', {
  minimize: () => ipcRenderer.send('minimize'),
  maximize: () => ipcRenderer.send('maximize'),
  close: () => ipcRenderer.send('close')
});

