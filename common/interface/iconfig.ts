import type { IServers } from "./iserver";

export interface IConfig {
    readonly configFileName: string; // 保存文件名
    servers: IServers;

    /**
    * 保存配置文件
    */
    Save(): void;

    /**
     * 读取配置文件
     */
    Load(): void;

    /**
     * 添加一个订阅服务器
     * @param title
     * @param url
     */
    AddServer(title: string, url: string): void;

    /**
     * 删除一个订阅服务器
     * @param id
     */
    DeleteServer(id: string): void;

    /**
     * 刷新订阅服务器
     * @param id
     */
    RefreshService(id: string): void;
}