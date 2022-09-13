import * as path from "path";
import { constants } from 'fs';
//import { spawn, ChildProcess } from 'child_process';
import { writeFile, readFile, access } from 'fs/promises';
import { Base } from './base'
import { IVPNSetting } from '../common/interface/ivpn_setting';
//import { ILink } from "../common/interface/ilink";

export class VPNSetting {

    /**
     * 获取完整文件名 
     */
    static GetFullFileName(setting: IVPNSetting): string {
        const rootPath = Base.getAppDataPath();
        const fileName = path.join(rootPath, setting.settingFileName);
        return fileName
    }

    /**
     * 
     * @param c
     */
    static async Load<T extends IVPNSetting>(c: new () => T): Promise<T> {
        let config = new c();

        try {
            const data = await readFile(VPNSetting.GetFullFileName(config), { encoding: "utf8", flag: 'r' });
            // console.log(JSON.parse(data))
            config = JSON.parse(data);
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
     * @param setting
     */
    static async Save(setting: IVPNSetting): Promise<void> {
        console.log("Setting Save", setting);

        // 判断local.py存在
        // TODO 根据系统不同后缀名
        const exeFileName = path.join(setting.home, setting.excuteFileName);
        console.log("Setting Save", exeFileName);
        try {
            await access(exeFileName, constants.F_OK);
        } catch (err: any) {
            // 读取文件出错
            console.error("ssr manager saveSetting:", err);
            throw Error(`${exeFileName}不存在`);
        }

        // 文件写入硬盘
        await writeFile(VPNSetting.GetFullFileName(setting), JSON.stringify(setting), { encoding: "utf8", flag: 'w' });
    }
}