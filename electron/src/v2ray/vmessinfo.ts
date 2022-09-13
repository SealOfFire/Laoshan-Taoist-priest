export interface VMessInfo {
    host: string;
    path: string;
    tls: string;
    verify_cert: boolean;
    add: string;
    port: number;
    aid: number;
    net: "tcp" | "kcp" | "ws" | "http" | "domainsocket" | "quic",
    headerType: string;
    v: string;
    type: string
    ps: string
    remark: string
    id: string
    class: 2
}