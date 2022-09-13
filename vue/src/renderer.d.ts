//import { Config } from '../common/config'
//import { IConfig } from '../_backup/ssr/config';
import { IConfig } from "@/common/interface/iconfig";
import { IVPNSetting } from "@/common/interface/ivpn_setting";
//import { Setting as V2RaySetting } from "@/common/v2ray/setting";
//import { Setting as SSRSetting } from "@/common/v2ray/setting";

export interface IElectronAPI {
  openFile: (defaultPath: string) => Promise<string>;
  //
  WindowsMinimize: () => void;
  WindowsMaximize: () => void;
  WindowsClose: () => void;
  // -------------------------------------------------------------
  LoadConfig: () => Promise<IConfig>;
  AddServer: (title: string, url: string) => Promise<IConfig>;
  DeleteServer: (severId: string) => Promise<IConfig>;
  RefreshServer: (severId: string) => Promise<IConfig>;
  GetConnectStatus: () => Promise<{ serverId: string; linkId: string }>;
  //
  LoadV2RaySetting: () => Promise<IVPNSetting>;
  LoadSSRSetting: () => Promise<IVPNSetting>;
  LoadVPNSetting: (setting: any) => Promise<IVPNSetting>;
  SaveVPNSetting: (setting: IVPNSetting) => Promise<void>;
  //
  Connect: (serverId: string, linkId: string) => Promise<void>;
  Disconnect: () => Promise<void>;
  //
  VPNOutput: (callback: any) => void;
  RefreshDelay: (callback: any) => void;
  RefreshConnect: (callback: any) => void;
  RefreshDisconnect: (callback: any) => void;
  //
  Ping: (severId: string) => Promise<string>;
  // -------------------------------------------------------------
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
