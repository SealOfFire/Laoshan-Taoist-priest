// main.js

// Modules to control application life and create native browser window

import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  IpcMainInvokeEvent,
  WebContents,
} from "electron";
import * as path from "path";
import { ChildProcess } from 'child_process'
import type { IConfig } from './common/interface/iconfig';
import type { IVPNSetting } from './common/interface/ivpn_setting';

import { Setting as SSRSetting } from './ssr/setting';
import { Setting as V2RaySetting } from './v2ray/setting';

import { VPNSetting } from './manage/vpn_setting';
import { MainManager } from './manage/main_manager';
import { MenuManage } from "./manage/menu_manage";
import { Config } from "./manage/config";

/*
const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  webContents } = require("electron");
const path = require('path')
const { ChildProcess } = require("child_process");
const { IConfig } = require("./common/interface/iconfig");
const { IVPNSetting } = require("./common/interface/ivpn_setting");

const SSRSetting = require("./ssr/setting").Setting;
const V2RaySetting2 = require("./v2ray/setting").Setting;

const { VPNSetting } = require("./manage/vpn_setting")
const { MainManager } = require("./manage/main_manager")
const { MenuManage } = require("./manage/menu_manage");
const { Config } = require("./manage/config")
*/
//let mainWindow: BrowserWindow;
let mainWindow: any = null;
// 选中的链接id
let selectServerId: string;
let selectLinkId: string;
// 打开的链接
let childProcess: ChildProcess;


const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    "title": "laoshan taoist priest",
    width: 800,
    height: 600,
    frame: true,
    titleBarStyle: "hidden", // 无边框
    webPreferences: {
      //
      preload: path.join(__dirname, './preload.js'),
      // 启动多线程
      nodeIntegrationInWorker: true
    }
  })

  // 加载 index.html
  mainWindow.loadFile('./pages/index.html')

  // 打开开发工具
  // mainWindow.webContents.openDevTools()
}

/**
 * 创建托盘图标
 */
const createTray = () => {
  // 托盘图标上的菜单
  MenuManage.CreateMenu(exit_click, Connect2, Disconnect2);

  // 双击系统托盘
  MenuManage.tray.on('double-click', () => {
    mainWindow.show();
  });
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  // -------------------------------------------------------------
  ipcMain.on("windows-min", () => { mainWindow.minimize(); })
  ipcMain.on("windows-max", () => { mainWindow.maximize(); })
  ipcMain.on("windows-close", () => { mainWindow.close(); })
  //
  ipcMain.handle('dialog:openFile', handleFileOpen)
  //
  ipcMain.handle('LoadConfig', LoadConfig);
  ipcMain.handle('AddServer', AddServer);
  ipcMain.handle('DeleteServer', DeleteServer);
  ipcMain.handle('RefreshServer', RefreshServer);
  ipcMain.handle('GetConnectStatus', GetConnectStatus);
  //
  ipcMain.handle('LoadV2RaySetting', LoadV2RaySetting);
  ipcMain.handle('LoadSSRSetting', LoadSSRSetting);
  ipcMain.handle('LoadVPNSetting', LoadVPNSetting);
  ipcMain.handle('SaveVPNSetting', SaveVPNSetting);
  //
  ipcMain.handle('Connect', Connect);
  ipcMain.handle('Disconnect', Disconnect);
  // 
  ipcMain.handle('Ping', Ping);
  // -------------------------------------------------------------

  // -------------------------------------------------------------
  // 创建窗口
  createWindow();

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  })

  // 关闭时最小化到系统托盘
  mainWindow.on("close", (event: Event) => {
    // 截获 close 默认行为
    event.preventDefault();
    // 点击关闭时触发close事件，我们按照之前的思路在关闭时，隐藏窗口，隐藏任务栏窗口
    mainWindow.hide();
    //mainWindow.setSkipTaskbar(true);
  });

  // -------------------------------------------------------------
  // 创建托盘图标
  createTray();

})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

/**
 * 单击推出菜单
 * @param event 
 * @param focusedWindow 
 * @param focusedWebContents 
 */
function exit_click(event: KeyboardEvent, focusedWindow: typeof BrowserWindow, focusedWebContents: WebContents) {
  // TODO 关闭已经打开的链接

  // 推出程序
  app.quit();
  app.exit(0);
}

/**
 * 链接vpn
 * @param serverId
 * @param linkId
 * @param send 是否要发送消息
 */
async function Connect2(serverId: string, linkId: string, send: boolean): Promise<void> {
  console.log("main Connect2", serverId, linkId);

  selectLinkId = linkId;
  selectServerId = serverId;

  // const childProcess: ChildProcess = await MainManager.Connect(serverId, linkId);
  childProcess = await MainManager.Connect(serverId, linkId);

  childProcess.stdout?.on("data", (data: any) => {
    const text = `${data}`;
    mainWindow.webContents.send('VPNOutput', text);
  });

  // 通过后台创建练级，后台建立vpn连接时,把链接状态发送回前台
  // 通过前台创建链接时，不需要
  if (send) {
    mainWindow.webContents.send('RefreshConnect', serverId, linkId);
    console.log("send RefreshConnect", serverId, linkId);
  }
}

/**
 * 断开链接
 * @param send 是否要发送消息
 */
function Disconnect2(send: boolean): void {
  console.log("main Disconnect2");
  selectLinkId = "";
  selectServerId = "";

  MenuManage.Disconnect();

  // 关闭子线程
  if (childProcess != undefined) {
    console.log("kill");
    childProcess.kill();
  }

  // 后台断开链接时,把链接状态发送回前台
  // 通过前台创建链接时，不需要
  if (send) {
    mainWindow.webContents.send('RefreshDisconnect');
    console.log("send RefreshDisconnect");
  }
}

// In this file you can include the rest of your app's specific main process
// code. 也可以拆分成几个文件，然后用 require 导入。

async function handleFileOpen(event: IpcMainInvokeEvent, defaultPath: string,) {
  const options: Electron.OpenDialogOptions = { defaultPath: defaultPath, properties: ["openDirectory"] };
  const { canceled, filePaths } = await dialog.showOpenDialog(options);
  if (canceled) {
    return
  } else {
    return filePaths[0]
  }
}

/**
 * 读取配置文件
 */
async function LoadConfig(): Promise<IConfig> {
  // await config.Load();
  const config = await Config.Load();
  // 刷新托盘图标菜单
  MenuManage.GetVPNMenuItem(config);
  return config;
}

/**
* 添加一个订阅服务
* @param event
* @param title
* @param url
*/
async function AddServer(event: IpcMainInvokeEvent, title: string, url: string): Promise<IConfig> {
  //await config.AddServer(title, url);
  const config = await Config.AddServer(title, url);
  // 刷新托盘图标菜单
  MenuManage.GetVPNMenuItem(config);
  return config;
}

/**
* 删除订阅服务
* @param event
* @param serverId
*/
async function DeleteServer(event: IpcMainInvokeEvent, serverId: string): Promise<IConfig> {
  //await config.DeleteServer(serverId);
  const config = await Config.DeleteServer(serverId);
  // 刷新托盘图标菜单
  MenuManage.GetVPNMenuItem(config);
  return config;
}

/**
* 刷新订阅服务
* @param event
* @param serverId
*/
async function RefreshServer(event: IpcMainInvokeEvent, serverId: string): Promise<IConfig> {
  // await config.RefreshService(serverId);
  const config = await Config.RefreshService(serverId);
  return config;
}

/**
 * 获取链接状态
 * @param event
 */
function GetConnectStatus(event: IpcMainInvokeEvent): { serverId: string, linkId: string } {
  const result = { serverId: selectServerId, linkId: selectLinkId };
  return result;
}

/**
 * 
 * @param event
 */
async function LoadV2RaySetting(event: IpcMainInvokeEvent): Promise<IVPNSetting> {
  //await v2raySetting.Load();
  const setting: V2RaySetting = await VPNSetting.Load(V2RaySetting);
  return setting;
}


/**
 * 
 * @param event
 */
async function LoadSSRSetting(event: IpcMainInvokeEvent): Promise<IVPNSetting> {
  //await ssrSetting.Load();
  //return ssrSetting;
  const setting: SSRSetting = await VPNSetting.Load(SSRSetting);
  return setting;
}


/**
 * 读取vpn配置
 * @param event
 * @param c
 */
async function LoadVPNSetting<T extends IVPNSetting>(event: IpcMainInvokeEvent, c: new () => T): Promise<T> {
  const setting: T = await VPNSetting.Load(c);
  return setting;
}

/**
 * 保存vpn配置
 * @param event
 * @param setting
 */
async function SaveVPNSetting(event: IpcMainInvokeEvent, setting: IVPNSetting): Promise<void> {
  console.log("main SaveVPNSetting", setting);
  //const oldSetting = MainManager.getVPNSetting(typeof (setting));
  await VPNSetting.Save(setting);
  // await setting.Save();
}

/**
 * 链接vpn
 * @param event
 * @param serverId
 * @param linkId
 */
async function Connect(event: IpcMainInvokeEvent, serverId: string, linkId: string): Promise<void> {
  console.log("main Connect");
  MenuManage.Connect(serverId, linkId);

  await Connect2(serverId, linkId, false);
  /*
  const childProcess: ChildProcess = await MainManager.Connect(serverId, linkId);

  childProcess.stdout?.on("data", (data: any) => {
    const text = `${data}`;
    mainWindow.webContents.send('VPNOutput', text);
  });
  */
}

/**
 * 断开链接
 * @param event
 */
async function Disconnect(event: IpcMainInvokeEvent): Promise<void> {
  console.log("main Disconnect");
  Disconnect2(false);
}

/**
* ping 链接地址
* @param event
* @param serverId
*/
async function Ping(event: IpcMainInvokeEvent, serverId: string) {
  //await MainManager.ping(serverId);
  await MainManager.ping99(serverId, mainWindow);
}