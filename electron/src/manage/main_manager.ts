import { ChildProcess, exec } from 'child_process'
import { BrowserWindow } from "electron";
import { Base } from './base'
import { Config } from './config'
import { IVPNSetting } from '../common/interface/ivpn_setting'
import { ILink } from '../common/interface/ilink'
import { link } from 'fs'
//import { MenuManage } from "./menu_manage";

export class MainManager {

    /**
     * 开启vpn
     * @param serverId
     * @param linkId
     */
    public static async Connect(serverId: string, linkId: string): Promise<ChildProcess> {
        console.log("MainManager Connect", serverId, linkId)
        const config: Config = new Config();
        await config.Load();
        // const config = await Config.Load();
        //console.log("MainManager Connect", config);
        //console.log("MainManager Connect", config.servers[serverId]);
        //console.log("MainManager Connect", config.servers[serverId].links[linkId]);
        const link: ILink = config.servers[serverId].links[linkId];
        //console.log("MainManager Connect", link);
        //console.log("MainManager Connect", link.protocol);
        //console.log("MainManager Connect", Base.vpnSetting);
        //const setting: IVPNSetting = new (Base.vpnSetting[link.protocol])();
        const setting: IVPNSetting = Base.CreateSetting(link.protocol);
        //console.log("MainManager Connect", setting);
        await setting.Load();
        console.log("MainManager Connect", setting)

        const childProcess: ChildProcess = setting.Connect(link)

        childProcess.stdout?.on("data", (data: any) => {
            console.log(`stdout: ${data}`);
        });

        childProcess?.stderr?.on("data", (data: any) => {
            console.log(`stdout: ${data}`);
        });

        childProcess.on('close', (code: any) => {
            console.log(`child process exited with code ${code}`);
        });

        return childProcess;
    }

    //public static async ping2(url: string): Promise<string> {
    //    console.log("ping url:", url);
    //    const requestCount = 1; // 发送ping的次数
    //    const bufferSize = 32; // 发送ping的buffer大小

    //    const cmd = `ping -l ${bufferSize} -n ${requestCount} ${url}`;
    //    const { stdout, stderr } = await exec(cmd)
    //    //console.log('stdout:', `${stdout}`);
    //    //console.error('stderr:', `${stderr}`);
    //    console.log('stdout:', stdout);
    //    console.error('stderr:', stderr);
    //    return ""
    //}

    public static ping2(url: string): Promise<string> {
        //console.log("ping url:", url);
        //const requestCount = 1; // 发送ping的次数
        //const bufferSize = 32; // 发送ping的buffer大小
        //const cmd = `ping -l ${bufferSize} -n ${requestCount} ${url}`;
        //exec(cmd, (error, stdout, stderr) => {
        //    if (error) {
        //        console.error(`exec error: ${error}`);
        //        return;
        //    }
        //    console.log(`stdout: ${stdout}`);
        //    console.error(`stderr: ${stderr}`);

        //    const output = `${stdout}`
        //    // 从output字符串中获取 Average = 16ms
        //    const lines: Array<string> = output.split(/[\n]/);
        //    const lastLine = lines[lines.length - 2]
        //    const temp1 = lastLine.split(",");
        //    const temp2 = temp1[temp1.length - 1].split("=")
        //    const result = temp2[temp2.length - 1].replace(" ", "")
        //    console.log("url:", url, `${result}`);
        //})

        console.log("ping url:", url);
        const requestCount = 1; // 发送ping的次数
        const bufferSize = 32; // 发送ping的buffer大小
        const cmd = `ping -l ${bufferSize} -n ${requestCount} ${url}`;

        const promise = new Promise<string>((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    //console.error(`exec error: ${error}`);
                    reject(error)
                }
                //console.log("ping", )
                //console.log(`stdout: ${stdout}`);
                //console.error(`stderr: ${stderr}`);

                const output = `${stdout}`
                // 从output字符串中获取 Average = 16ms
                const lines: Array<string> = output.split(/[\n]/);
                const lastLine = lines[lines.length - 2]
                const temp1 = lastLine.split(",");
                const temp2 = temp1[temp1.length - 1].split("=")
                const result = temp2[temp2.length - 1].replace(" ", "")
                const value = Number(result.replace("ms", ""))
                console.log("url:", url, `${result}`);
                resolve(result);
            })
        })

        return promise;
    }


    public static async ping(serverId: string) {
        const config: Config = new Config();
        await config.Load();

        const fnList: Array<any> = [];
        const links = config.servers[serverId].links;
        //console.log('ping', links)

        for (let key in links) {
            fnList.push(links[key].url);
            // fnList.push((() => Common.ping(links[key].url)));
        }
        //console.log('ping', fnList)
        const requestFnList = fnList.map((url) => () => MainManager.ping2(url));

        //console.log('ping', requestFnList);
        const reply = await Base.concurrentRun(requestFnList, 5, "ping");
        console.log("MainManager ping", reply)
    }

    public static async ping99(serverId: string, mainWindow: BrowserWindow): Promise<void> {
        const config: Config = new Config();
        await config.Load();
        const links = config.servers[serverId].links;

        const results = [];

        for (let key in links) {
            // fnList.push(links[key].url);
            // fnList.push((() => Common.ping(links[key].url)));
            const p = MainManager.ping2(links[key].url)
                .then((result) => {
                    console.log("ping99", serverId, key, result)
                    // 执行结果返回给客户端
                    // send("RefreshDelay", serverId, key, result);
                    mainWindow.webContents.send('RefreshDelay', serverId, key, result);
                    // 执行结果回写配置文件
                    const delayValue = result.replace(/[\r\n]/g, "");
                    config.servers[serverId].links[key].delay = delayValue;
                    // 修改菜单项上的延迟
                    // MenuManage.RefreshDelay(serverId, key, delayValue);
                }).catch((err) => {
                    console.log("ping99", serverId, key, err)
                    // ping超时
                    // send("RefreshDelay", serverId, key, "timeout");
                    mainWindow.webContents.send('RefreshDelay', serverId, key, "timeout");
                    config.servers[serverId].links[key].delay = "timeout"
                });
            results.push(p);
        }

        // 等待全部执行完
        await Promise.all(results);
        // 保存修改后的配置文件
        await config.Save();
    }

}