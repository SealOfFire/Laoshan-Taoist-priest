import * as path from "path";
import { v4 as uuidv4 } from "uuid";
import { existsSync, constants } from "fs";
import { writeFile, mkdir } from 'fs/promises';
import { IVPNConfig } from "../common/interface/ivpn_config";
import { VMessInfo } from "./vmessinfo";
import { ILink } from "../common/interface/ilink";

export class Config implements IVPNConfig {

    log?: Ilog | null;
    api?: {};
    dns?: {};
    stats?: {};
    routing?: {};
    reverse?: {};
    inbounds: IInbound[];
    outbounds: IOutbound[];
    transport?: {};

    constructor(value: string) {
        // 去掉开头的vmess://
        const buf = Buffer.from(value.substring("vmess://".length, value.length), "base64");
        const vmessinfo = JSON.parse(buf.toString()) as VMessInfo

        this.log = {
            access: null,
            error: null,
            loglevel: "warning"
        };

        this.inbounds = new Array<IInbound>();
        this.outbounds = new Array<IOutbound>();

        const inbound: IInbound = {
            port: 1880,
            listen: "127.0.0.1",
            protocol: "socks",
        }
        this.inbounds?.push(inbound);


        const user: IUser = {
            id: vmessinfo.id,
            alterId: 0
        }

        const vnext: IVnext = {
            address: vmessinfo.add,
            port: vmessinfo.port,
            users: [user]
        }

        const vmess: IVMess = {
            vnext: [vnext]
        }

        const outbound: IOutbound = {
            protocol: "vmess",
            settings: vmess,
            tag: vmessinfo.ps,
            streamSettings: {
                network: vmessinfo.net,
                wsSettings: {
                    path: vmessinfo.path,
                    headers: {
                        host: vmessinfo.host,
                    }
                }
            }
        }
        this.outbounds?.push(outbound);
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
            title: this.outbounds[0].tag,
            protocol: this.outbounds[0].protocol,
            configFileName: "",
            url: (this.outbounds[0].settings as IVMess).vnext[0].address,
            delay: 0,
        }

        return link
    }
}


export interface Ilog {
    // 文件地址
    access: string | null;

    // 文件地址
    error: string | null;

    // warning
    loglevel: "debug" | "info" | "warning" | "error" | "none";
}

export interface IInbound {
    port?: number | string;
    listen?: string;
    protocol?: string;
    settings?: IInboundConfiguration | null;
    streamSettings?: IStreamSettings | null;
    tag?: string | null;
    sniffing?: ISniffing | null;
    allocate?: IAllocate | null;
}

export interface IInboundConfiguration { }

export interface IStreamSettings {
    network?: "tcp" | "kcp" | "ws" | "http" | "domainsocket" | "quic";
    security?: "none" | "tls";
    tlsSettings?: ITLS | null;
    tcpSettings?: {}
    kcpSettings?: {}
    wsSettings?: {}
    httpSettings?: {}
    dsSettings?: {}
    quicSettings?: {}
    sockopt?: {}
}

export interface ITLS {
    serverName?: string;
    allowInsecure?: boolean;
    alpn?: string[];
    certificates?: null;
    allowInsecureCiphers?: boolean;
    disableSystemRoot?: boolean;
}

export interface ISniffing { }

export interface IAllocate { }

export interface IOutbound {
    sendThrough?: string | null;
    protocol: string;
    settings?: IOutboundConfiguration;
    tag: string | null;
    streamSettings?: IStreamSettings | null;
    proxySettings?: IProxySettings | null;
    mux?: IMux | null;
}

export interface IOutboundConfiguration { }

export interface IProxySettings { }

export interface IMux { }

export interface IVMess extends IOutboundConfiguration {
    vnext: Array<IVnext>;
}

export interface IVnext {
    address: string;
    port: number;
    users: Array<IUser>
}

export interface IUser {
    id: string;
    alterId: number;
    security?: string;
    level?: number;
}