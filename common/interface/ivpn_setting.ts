import type { ILink } from "./ilink";
import type { ChildProcess } from "child_process";

/**
 * vpn程序 配置文件
 */
export interface IVPNSetting {
    home: string; // vpn程序的路径
    protocol: string; // 协议
    port: number; // 端口号
    readonly settingFileName: string; // 保存文件名
    readonly excuteFileName: string; // 可执行文件名

    /**
     * 保存配置文件
     */
    Save(): void;

    /**
     * 读取配置文件
     */
    Load(): void;

    /**
     * 获取完整文件名
     */
    GetFullFileName(): string | undefined;

    /**
     * 链接vpn
     */
    Connect(link: ILink): ChildProcess | any;
}


export interface IVPNSettingMethod {
    /**
     * 保存配置文件
     */
    Save(): void;

    /**
     * 读取配置文件
     */
    Load(): void;

    /**
     * 获取完整文件名
     */
    GetFullFileName(): string | undefined;

    /**
     * 链接vpn
     */
    Connect(link: ILink): ChildProcess | any;
}