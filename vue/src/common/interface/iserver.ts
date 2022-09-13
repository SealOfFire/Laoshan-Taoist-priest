import type { ILinks } from "./ilink";

export interface IServer {
    id: string;
    title: string;
    url: string;
    links: ILinks;
}

export interface IServers {
    [index: string]: IServer;
}