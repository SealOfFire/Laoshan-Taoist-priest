import * as path from "path";
import { existsSync } from 'fs';
import { writeFile, readFile, rmdir, rename } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import { HttpManager } from './http_manager';
import { Base } from './base';
import { IConfig } from '../common/interface/iconfig';
import { IServer, IServers } from '../common/interface/iserver';
import { ILinks } from '../common/interface/ilink';
// import { config } from "process";

export class Config implements IConfig {

    readonly configFileName: string = "config.json";
    servers: IServers = {};

    GetFullFileName(): string {
        const fileName = path.join(Base.getAppDataPath(), this.configFileName);
        console.log("v2ray config GetFullFileName", fileName)
        return fileName;
    }

    /**
     * 
     */
    async Save(): Promise<void> {
        console.log("Config Save:", this);
        for (let key1 in this.servers) {
            console.log('Config Save:', this.servers[key1].links)
        }
        // 文件写入硬盘
        await writeFile(this.GetFullFileName(), JSON.stringify(this), { encoding: "utf8", flag: 'w' });
    }

    /**
     * 
     */
    async Load(): Promise<void> {
        try {
            const data = await readFile(this.GetFullFileName(), { encoding: "utf8", flag: 'r' });
            // console.log(JSON.parse(data))
            const config: Config = JSON.parse(data);
            //
            this.servers = config.servers;

        } catch (err: any) {
            // 读取文件出错
            console.error(err);
            if (err.code === "ENOENT") {
                // 文件不存在，创建一个默认配置文件
                console.error(err);
            }
        }
    }

    /**
     * 
     * @param title
     * @param url
     */
    async AddServer(title: string, url: string): Promise<void> {
        const server: IServer = {
            id: uuidv4(),
            title: title,
            url: url,
            links: {},
        }
        server.links = await HttpManager.getVPNConfig(server.id, server.url);
        if (this.servers == undefined)
            this.servers = {}
        this.servers[server.id] = server;
        await this.Save();
    }

    /**
     * 
     * @param id
     */
    async DeleteServer(id: string): Promise<void> {
        // 删除项目
        // const key = id as keyof typeof config.servers
        if (this.servers.hasOwnProperty(id)) {
            //console.log("has id");
            delete this.servers[id]
            // 删除配置文件夹
            const p = path.join(Base.getAppDataPath(), id);
            if (existsSync(p)) {
                await rmdir(p, { recursive: true });
            }
        }
        // 保存项目
        await this.Save();
    }

    /**
     * 
     * @param id
     */
    async RefreshService(id: string): Promise<void> {
        console.log("Config RefreshService", id)
        // throw new Error('Method not implemented.');

        const odlServer: IServer = this.servers[id];

        // 获取链接
        //const newServer: IServer = {
        //    id: uuidv4(),
        //    title: odlServer.title,
        //    url: odlServer.url,
        //    links: {},
        //}
        //newServer.links = await HttpManager.getVPNConfig(newServer.id, newServer.url);

        // 运行到这里说明执行成功了
        // 旧的数据替换成新的

        // TODO 删掉旧的配置文件，如果更新失败，旧的配置文件就没了
        // 获取到的文件放入临时文件夹
        const links: ILinks = await HttpManager.getVPNConfig(this.servers[id].id + "_temp", this.servers[id].url);

        // 删除旧的配置文件
        const p = path.join(Base.getAppDataPath(), id);
        if (existsSync(p)) {
            await rmdir(p, { recursive: true });
        }

        // 重命名新配置文件
        const oldPath = path.join(Base.getAppDataPath(), id + "_temp");
        const newPath = path.join(Base.getAppDataPath(), id);
        await rename(oldPath, newPath)

        // 保存新的链接
        this.servers[id].links = links;
        await this.Save();
    }

    /**
     * 
     * @param config
     */
    static GetFullFileName(config: IConfig): string {
        const fileName = path.join(Base.getAppDataPath(), config.configFileName);
        return fileName;
    }

    /**
     * 
     */
    static async Load(): Promise<IConfig> {
        let config: Config = new Config();

        try {
            const data = await readFile(Config.GetFullFileName(config), { encoding: "utf8", flag: 'r' });
            // console.log(JSON.parse(data))
            config = JSON.parse(data);
            // 
            // this.servers = config.servers;

        } catch (err: any) {
            // 读取文件出错
            console.error(err);
            if (err.code === "ENOENT") {
                // 文件不存在，创建一个默认配置文件
                console.error(err);
            }
        }

        return config;
    }

    /**
     * 
     * @param config
     */
    static async Save(config: IConfig): Promise<void> {
        console.log("Config Save:", config);
        for (let key1 in config.servers) {
            console.log('Config Save:', key1, config.servers[key1].links)
        }
        // 文件写入硬盘
        await writeFile(Config.GetFullFileName(config), JSON.stringify(config), { encoding: "utf8", flag: 'w' });
    }

    /**
     * 
     * @param title
     * @param url
     */
    static async AddServer(title: string, url: string): Promise<IConfig> {
        const server: IServer = {
            id: uuidv4(),
            title: title,
            url: url,
            links: {},
        }
        server.links = await HttpManager.getVPNConfig(server.id, server.url);

        const config = await Config.Load();
        //
        if (config.servers == undefined)
            config.servers = {}
        //
        config.servers[server.id] = server;
        console.log("AddServer", config.servers[server.id].links)
        await Config.Save(config);
        return config;
    }

    /**
     * 
     * @param id
     */
    static async DeleteServer(id: string): Promise<IConfig> {
        console.log("config delete server", id)
        // 删除项目
        const config = await Config.Load();
        // const key = id as keyof typeof config.servers
        if (config.servers.hasOwnProperty(id)) {
            //console.log("has id");
            delete config.servers[id]
            // 删除配置文件夹
            const p = path.join(Base.getAppDataPath(), id);
            if (existsSync(p)) {
                await rmdir(p, { recursive: true });
            }
        }
        // 保存项目
        await Config.Save(config);
        return config;
    }

    static async RefreshService(id: string): Promise<IConfig> {
        // throw new Error('Method not implemented.');

        const config = await Config.Load();
        const odlServer: IServer = config.servers[id];

        // 获取链接
        //const newServer: IServer = {
        //    id: uuidv4(),
        //    title: odlServer.title,
        //    url: odlServer.url,
        //    links: {},
        //}
        //newServer.links = await HttpManager.getVPNConfig(newServer.id, newServer.url);

        // 运行到这里说明执行成功了
        // 旧的数据替换成新的

        // TODO 删掉旧的配置文件，如果更新失败，旧的配置文件就没了
        // 获取到的文件放入临时文件夹
        const links: ILinks = await HttpManager.getVPNConfig(config.servers[id].id + "_temp", config.servers[id].url);

        // 删除旧的配置文件
        const p = path.join(Base.getAppDataPath(), id);
        if (existsSync(p)) {
            await rmdir(p, { recursive: true });
        }

        // 重命名新配置文件
        const oldPath = path.join(Base.getAppDataPath(), id + "_temp");
        const newPath = path.join(Base.getAppDataPath(), id);
        await rename(oldPath, newPath)

        // 保存新的链接
        config.servers[id].links = links;
        console.log("RefreshService", config.servers[id].links)
        await Config.Save(config);
        return config;
    }

}