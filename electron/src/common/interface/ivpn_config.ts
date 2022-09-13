import type { ILink } from "./ilink";

/**
 * vpn的配置文件
 */
export interface IVPNConfig {

    /**
     * 保存配置文件
     * @param fullFileName 文件名
     */
    Save(fullFileName: string): void;

    /**
     * 配置文件转成link数据
     */
    ToLink(): ILink;

}