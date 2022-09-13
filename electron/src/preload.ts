// preload.js
import { contextBridge, ipcRenderer } from 'electron'
import type { IVPNSetting } from './common/interface/ivpn_setting'

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: (defaultPath: string) => ipcRenderer.invoke('dialog:openFile', defaultPath),
  // -------------------------------------------------------------
  WindowsMinimize: () => ipcRenderer.send("windows-min"),
  WindowsMaximize: () => ipcRenderer.send("windows-max"),
  WindowsClose: () => ipcRenderer.send("windows-close"),
  // -------------------------------------------------------------
  LoadConfig: () => ipcRenderer.invoke('LoadConfig'),
  AddServer: (title: string, url: string) => ipcRenderer.invoke('AddServer', title, url),
  DeleteServer: (severId: string) => ipcRenderer.invoke('DeleteServer', severId),
  RefreshServer: (severId: string) => ipcRenderer.invoke('RefreshServer', severId),
  GetConnectStatus: () => ipcRenderer.invoke('GetConnectStatus'),
  //
  LoadV2RaySetting: () => ipcRenderer.invoke('LoadV2RaySetting'),
  LoadSSRSetting: () => ipcRenderer.invoke('LoadSSRSetting'),
  LoadVPNSetting: (setting: any) => ipcRenderer.invoke('LoadVPNSetting', setting),
  SaveVPNSetting: (setting: IVPNSetting) => ipcRenderer.invoke('SaveVPNSetting', setting),
  //
  Connect: (serverId: string, linkId: string) => ipcRenderer.invoke('Connect', serverId, linkId),
  Disconnect: () => ipcRenderer.invoke('Disconnect'),
  //
  VPNOutput: (callback: any) => ipcRenderer.on('VPNOutput', callback),
  RefreshDelay: (callback: any) => ipcRenderer.on('RefreshDelay', callback),
  RefreshConnect: (callback: any) => ipcRenderer.on('RefreshConnect', callback),
  RefreshDisconnect: (callback: any) => ipcRenderer.on('RefreshDisconnect', callback),
  //
  Ping: (severId: string) => ipcRenderer.invoke('Ping', severId),
});