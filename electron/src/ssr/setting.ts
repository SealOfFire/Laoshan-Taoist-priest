import * as path from "path";
import { constants } from 'fs';
import { spawn, ChildProcess } from "child_process"
import { writeFile, readFile, access } from "fs/promises";
import { Base } from "../manage/base";
import type { IVPNSetting } from '../common/interface/ivpn_setting'
import type { ILink } from "../common/interface/ilink";

export class Setting implements IVPNSetting {

    home: string = "";
    protocol: string = "socks";
    port: number = 1080;
    settingFileName: string = "ssr_setting.json";
    excuteFileName: string = "local.py"

    constructor() {

    }

    /**
     * 获取完整文件名 
     */
    GetFullFileName(): string {
        const rootPath = Base.getAppDataPath();
        const fileName = path.join(rootPath, this.settingFileName);
        return fileName
    }

    /**
     * 保存配置文件
     */
    async Save(): Promise<void> {
        console.log("ssr Setting Save");

        // 判断local.py存在
        // TODO 根据系统不同后缀名
        const exeFileName = path.join(this.home, this.excuteFileName);
        try {
            await access(exeFileName, constants.F_OK);
        } catch (err: any) {
            // 读取文件出错
            console.error("ssr manager saveSetting:", err);
            throw Error(`${exeFileName}不存在`);
        }

        // 文件写入硬盘
        await writeFile(this.GetFullFileName(), JSON.stringify(this), { encoding: "utf8", flag: 'w' });
    }

    /**
     * 读取配置文件
     */
    async Load(): Promise<void> {

        try {
            const data = await readFile(this.GetFullFileName(), { encoding: "utf8", flag: 'r' });
            // console.log(JSON.parse(data))
            const config: Setting = JSON.parse(data);

            // 
            this.home = config.home;

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
     * @param link
     */
    Connect(link: ILink): ChildProcess {
        // v2ray.exe路径
        // 配置文件的路径
        const configFileName = path.join(Base.getAppDataPath(), link.configFileName);
        // 子线程参数
        const args = Array<string>();
        args.push(`-c=${configFileName}`);
        // 启动子线程
        const childProcess = spawn("python", args);
        return childProcess
    }
}