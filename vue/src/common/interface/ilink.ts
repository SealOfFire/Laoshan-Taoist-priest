export interface ILink {
    id: string;
    title: string | null;
    protocol: string;
    configFileName: string; // 配置文件名
    url: string; // ping测试的地址
    delay: number | string | undefined | null;
}

export interface ILinks {
    [index: string]: ILink;
}