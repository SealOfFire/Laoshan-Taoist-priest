import * as path from "path";
import { v4 as uuidv4 } from "uuid"
import { existsSync } from 'fs';
import { writeFile, mkdir } from 'fs/promises';
import type { IVPNConfig } from "../common/interface/ivpn_config";
import type { ILink } from "../common/interface/ilink";
// import { Key } from "readline";

export class Config implements IVPNConfig {

    server: string;
    server_port: number;
    password: string;
    obfs: string;
    obfs_param: string = "";
    method: string;
    protocol: string;
    protocol_param: string = "";
    local_address: string = "";
    local_port: number = -1;
    remarks: string = "";
    group: string = "";

    constructor(value: string) {
        // 去掉开头的ssr://
        const buf = Buffer.from(value.substring("ssr://".length, value.length), "base64");

        const text = buf.toString();
        const values1 = text.split("/?");
        const values2 = values1[0].split(":");
        this.server = values2[0];
        this.server_port = Number(values2[1]);
        this.protocol = values2[2];
        this.method = values2[3];
        this.obfs = values2[4];
        const buf2 = Buffer.from(values2[5], "base64");
        this.password = buf2.toString();

        //const name = ["obfsparam", "protoparam", "remarks"];
        const dict = { "obfsparam": "obfs_param", "protoparam": "protocol_param", "remarks": "remarks", "group": "group" }

        const values3 = values1[1].split("&")
        for (let i = 0; i < values3.length; i++) {
            const value4 = values3[i].split("=")
            const buf3 = Buffer.from(value4[1], "base64");

            //type key1Type = keyof typeof dict;
            //const key2: key1Type = value4[0]
            //// const key2 = dict[key1]
            const key = value4[0] as keyof typeof dict
            //const key2 = dict[key] as keyof Config

            //type keyType = keyof Config
            //const key3: keyType = key2

            // Object.assign(this, { key2: buf3.toString() });
            (<any>this)[dict[key]] = buf3.toString();
            // this[key3] = buf3.toString();


            //const aa: Config = new Config("")
            //const key4 ="obfs_param"
            //aa[key3] = ""
            //aa[key2 as keyof Config] = ""
            //aa[key4] = "aa"
        }

    }

    /**
     * 保存配置文件
     * @param fullFileName 文件名
     */
    async Save(fullFileName: string): Promise<void> {
        console.log("v2ray Config SaveConfig");

        // 判断文件路径是否存在，
        const p = path.dirname(fullFileName);
        console.log("v2ray Config SaveConfig:", p)
        if (!existsSync(p)) {
            // 路径不存在，创建路径
            await mkdir(p, { recursive: true });
        }

        await writeFile(fullFileName, JSON.stringify(this), { encoding: "utf8", flag: 'w' });
    }

    /**
     * 配置文件转成link数据
     */
    ToLink(): ILink {
        const link: ILink =
        {
            id: uuidv4(),
            title: this.remarks,
            protocol: "ssr",
            configFileName: "",
            url: this.server,
            delay: 0,
        }

        return link
    }
}
