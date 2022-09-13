import * as path from "path";
import axios from "axios"
import { existsSync } from 'fs';
import { mkdir } from 'fs/promises';
import { spawnSync, execSync } from 'child_process'
import { ILink, ILinks } from '../common/interface/ilink'
import { Base } from './base'
import { IVPNConfig } from '../common/interface/ivpn_config'
//import { Config as V2RayConfig } from '../v2ray/config'
//import { Config as SSRConfig } from '../ssr/config'

/**
 * http 处理操作
 */
export class HttpManager {

    /**
     * 获取配置文件
     * @param serverId
     * @param url
     */
    public static async getVPNConfig(serverId: string, url: string): Promise<ILinks> {
        console.log("HttpManager getVPNConfig");

        const links: ILinks = {};
        const configs: Array<IVPNConfig> = []

        const response = await axios.get(url);
        const buf = Buffer.from(response.data, "base64");
        const text = buf.toString();
        const urls: Array<string> = text.split(/[\s\n]/);

        // 判断文件路径是否存在，
        const rootPath = path.join(Base.getAppDataPath(), serverId);
        console.log("HttpManager getVPNConfig:", rootPath)
        if (!existsSync(rootPath)) {
            // 路径不存在，创建路径
            await mkdir(rootPath, { recursive: true });
        }

        for (let i = 0; i < urls.length; i++) {

            let config: IVPNConfig

            const url: Array<string> = urls[i].split("://");

            if (url.length >= 2) {
                config = new Base.vpnConfig[url[0]](urls[i]);

                configs.push(config)

                const link: ILink = config.ToLink();
                console.log('getVPNConfig link:', link)
                link.configFileName = path.join(serverId, link.id + ".json");
                links[link.id] = link;

                // 保存配置文件
                const fileName = path.join(rootPath, link.id + ".json");
                await config.Save(fileName);
            }
        }

        return links;
    }

    ///**
    // * ping测试
    // * @param url
    // */
    //public static async ping(url: string): Promise<string> {

    //    const requestCount = 1; // 发送ping的次数
    //    const bufferSize = 32; // 发送ping的buffer大小
    //    const args = Array<string>();
    //    args.push(`-l`);
    //    args.push(`${bufferSize}`);
    //    args.push(`-n`);
    //    args.push(`${requestCount}`);
    //    args.push(`${url}`);
    //    const childProcess = spawnSync("ping", args);

    //    const output = `${childProcess.output}`
    //    // 从output字符串中获取 Average = 16ms
    //    const lines: Array<string> = output.split(/[\n]/);
    //    const lastLine = lines[lines.length - 2]
    //    const temp1 = lastLine.split(",");
    //    const temp2 = temp1[temp1.length - 1].split("=")
    //    const result = temp2[temp2.length - 1].replace(" ", "")

    //    console.log("url:", url, `${result}`);

    //    return result;
    //}
}