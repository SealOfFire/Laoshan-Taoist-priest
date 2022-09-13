import * as path from "path";
import { constants } from 'fs';
import { spawn, ChildProcess } from 'child_process'
import { writeFile, readFile, access } from 'fs/promises';
import { Base } from "../manage/base";
import type { IVPNSetting } from '../common/interface/ivpn_setting'
import type { ILink } from "../common/interface/ilink";

export class Setting implements IVPNSetting {

    home: string = "";
    protocol: string = "socks";
    port: number = 1080;
    settingFileName: string = "v2ray_setting.json";
    excuteFileName: string = "v2ray.exe"

    /*
    constructor() {
        console.log("v2raysettin constructor");
    }
    */

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
        console.log("v2ary Setting Save");

        // 判断v2ray.exe存在
        // TODO 根据系统不同后缀名
        const exeFileName = path.join(this.home, this.excuteFileName);
        try {
            await access(exeFileName, constants.F_OK);
        } catch (err: any) {
            // 读取文件出错
            console.error("v2ary Setting saveSetting:", err);
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
        console.log("v2ray setting connect", link);
        // v2ray.exe路径
        // TODO 根据系统使用不同的文件名
        const executeFileName = path.join(this.home, this.excuteFileName);
        // console.log("v2ray manager connect", executeFileName);
        console.log("v2ray setting connect", executeFileName)

        // 配置文件的路径
        const configFileName = path.join(Base.getAppDataPath(), link.configFileName);
        console.log("v2ray setting connect", configFileName)

        // 子线程参数
        const args = Array<string>();
        args.push(`-config=${configFileName}`);
        // 启动子线程
        const childProcess = spawn(executeFileName, args);
        return childProcess

        //return null;
    }
}