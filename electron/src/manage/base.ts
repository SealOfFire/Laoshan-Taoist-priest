import { app } from "electron";
import * as path from "path";
//import { IVPNConfig } from "../common/interface/ivpn_config";
import { IVPNSetting } from "../common/interface/ivpn_setting";
import { Config as SSRConfig } from "../ssr/config";
import { Setting as SSRSetting } from "../ssr/setting";
import { Config as V2RayConfig } from "../v2ray/config";
import { Setting as V2RaySetting } from "../v2ray/setting";


/**
 * 基础项目处理
 */
export class Base {

    public static vpnConfig: any = { "vmess": V2RayConfig, "ssr": SSRConfig, };
    public static vpnSetting: any = { "vmess": V2RaySetting, "ssr": SSRSetting, };

    public static configFileName: string = "config.json";

    /*
    constructor() {
        console.log("constructor");
        Base.vpnConfig = { "sample": SampleConfig, "vmess": V2RayConfig, "ssr": SSRConfig, };
        Base.vpnSetting = { "sample": SampleSetting, "vmess": V2RaySetting, "ssr": SSRSetting, };
        console.log("constructor", Base.vpnConfig);
        console.log("constructor", Base.vpnSetting);
    }
    */

    /**
     * 创建vpn配置文件对象
     * @param protocol 
     */
    public static CreateSetting(protocol: string): IVPNSetting {
        switch (protocol) {
            case "vmess":
                return new V2RaySetting();
                break;
            case "ssr":
                return new SSRSetting();
                break;
        }
        throw new Error(`缺少支持的协议:${protocol}`);
    }

    /**
     * 获取数据文件路径
     * @returns 数据文件路径
     */
    public static getAppDataPath(): string {
        console.log("Base getAppDataPath");
        // 当前app应用的路径作为数据文件路径
        // TODO app在控制台不可用
        //const p = "D:\\download\\vpn";

        const p = app.getAppPath();
        const result = path.join(p, 'vpn_config');
        return result;
    }

    /**
    * 执行多个异步任务
    * @param fnList 任务列表
    * @param max 最大并发数限制
    * @param taskName 任务名称
    */
    public static async concurrentRun(fnList: any[] = [], max: number = 5, taskName: string = "未命名"): Promise<any[] | void> {
        if (!fnList.length) return;

        console.log(`开始执行多个异步任务，最大并发数： ${max}`);

        const replyList: any[] = []; // 收集任务执行结果
        const count = fnList.length; // 总任务数量
        const startTime = new Date().getTime(); // 记录任务执行开始时间

        let current = 0;

        // 任务执行程序
        const schedule = async (index: number) => {
            return new Promise<void>(async (resolve) => {
                const fn = fnList[index];
                if (!fn) return resolve();

                // 执行当前异步任务
                const reply = await fn();
                console.log("", reply)
                replyList[index] = reply;
                console.log(`${taskName} 事务进度 ${((++current / count) * 100).toFixed(2)}% `);

                // 执行完当前任务后，继续执行任务池的剩余任务
                await schedule(index + max);
                resolve();
            });
        };

        // 任务池执行程序
        const scheduleList = new Array(max)
            .fill(0)
            .map((_, index) => schedule(index));

        // 使用 Promise.all 批量执行
        const r = await Promise.all(scheduleList);

        const cost = (new Date().getTime() - startTime) / 1000;
        console.log(`执行完成，最大并发数： ${max}，耗时：${cost}s`);
        return replyList;
    }
}