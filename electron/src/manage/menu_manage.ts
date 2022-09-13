/**
 * 菜单处理
 */
import {
    nativeImage,
    Tray,
    Menu,
    MenuItem
} from "electron";
import * as path from "path";
import type { IConfig } from '../common/interface/iconfig';

/**
 * 获取vpn链接的菜单项目
 */
export class MenuManage {

    static taryMenu: Menu
    static tray: Tray;
    static connectCallback: (serverId: string, linkId: string, send: boolean) => Promise<void>;
    static disconnectCallback: (send: boolean) => void;

    //static exitCallback: any;
    static exitMenuItem: MenuItem;
    static separatorMenuItem: MenuItem = new MenuItem({
        id: "separator",
        type: 'separator'
    });

    /**
     * 创建托盘图标菜单
     * @param exit 退出函数
     */
    public static CreateMenu(exit: any, connectCallback: any, disconnectCallback: any) {

        MenuManage.connectCallback = connectCallback;
        MenuManage.disconnectCallback = disconnectCallback;

        const iconPath = path.join(__dirname, '../assets/images/lan-connect1.png')
        //console.log("CreateMenu", iconPath);
        const icon = nativeImage.createFromPath(iconPath);
        //const icon = nativeImage.createFromPath("D:\\MyProgram\\github\\SealOfFire\\Laoshan Taoist priest\\electron\\assets\\images\\lan-connect1.png");
        MenuManage.tray = new Tray(icon);

        MenuManage.exitMenuItem = new MenuItem({
            id: "exit",
            label: 'exit',
            type: 'normal',
            click: exit
        });

        MenuManage.taryMenu = Menu.buildFromTemplate([
            { label: 'Item1', type: 'radio' },
            { label: 'Item2', type: 'radio' },
            { label: 'Item3', type: 'radio', checked: true },
            { label: 'Item4', type: 'radio' },
            {
                label: "子菜单", submenu: [
                    { label: 'Item1', type: 'radio' },
                    { label: 'Item2', type: 'radio' }
                ]
            },
            { id: "separator", type: 'separator' },
            { id: "exit", label: 'exit', type: 'normal', click: exit }
        ]);

        // 托盘图标上的菜单
        MenuManage.tray.setContextMenu(MenuManage.taryMenu);
        MenuManage.tray.setToolTip("laoshan taoist priest");
        MenuManage.tray.setTitle("laoshan taoist priest");
    }

    /**
     * 修改vpn菜单
     */
    public static aaaa() {

    }

    /**
     * 
     * @param config 根据配置文件创建菜单
     */
    public static GetVPNMenuItem(config: IConfig): void {
        console.log('menu_manage GetVPNMenuItem:');

        // const result: any = [];
        // MenuManage.DeleteVPNMenuItem()
        MenuManage.taryMenu = new Menu();


        let index = 0;
        const template = [];
        for (const serverId in config.servers) {
            // 菜单项目
            template.push({
                id: serverId,
                label: config.servers[serverId].title,
                submenu: [] as object[],
            });
            // 子菜单
            template[template.length - 1].submenu.push({
                id: serverId,
                label: "断开链接",
                type: "radio",
                checked: false,
                serverId: serverId,
                linkId: serverId,
                click: (menuItem: any, browserWindow: any, event: any) => {
                    // 断开链接
                    console.log("serverId", menuItem.serverId);
                    console.log("linkId", menuItem.linkId);
                    MenuManage.disconnectCallback(true);
                },
            });
            for (const keyId in config.servers[serverId].links) {
                template[template.length - 1].submenu.push({
                    id: keyId,
                    label: `${config.servers[serverId].links[keyId].title}`,
                    type: "radio",
                    checked: false,
                    click: (menuItem: any, browserWindow: any, event: any) => {
                        // 启动链接
                        console.log("serverId", menuItem.serverId);
                        console.log("linkId", menuItem.linkId);
                        MenuManage.connectCallback(menuItem.serverId, menuItem.linkId, true);
                    },
                    serverId: serverId,
                    linkId: keyId
                });
            }
        }

        MenuManage.taryMenu = Menu.buildFromTemplate(template)
        MenuManage.taryMenu.append(MenuManage.separatorMenuItem);
        MenuManage.taryMenu.append(MenuManage.exitMenuItem);
        MenuManage.tray.setContextMenu(MenuManage.taryMenu);
    }

    /**
     * 删掉vpn链接
     */
    public static DeleteVPNMenuItem(): void {
        // MenuManage.taryMenu.items
        console.log('menu_manage DeleteVPNMenuItem:', MenuManage.taryMenu.items.length);
        MenuManage.taryMenu.items.splice(0, MenuManage.taryMenu.items.length - 2);
    }

    /**
     * 修改菜单项的延迟
     */
    public static RefreshDelay(serverId: string, linkId: string, result: string): void {
        const subItem = MenuManage.taryMenu.getMenuItemById(serverId)?.submenu?.getMenuItemById(linkId);
        if (subItem != null) {
            subItem.label = subItem.label + `(${result})`;
        }
    }

    /**
     * 设置打开的链接的radio选中状态
     */
    public static Connect(serverId: string, linkId: string): void {
        // 先设置空白链接
        MenuManage.Disconnect()
        const subItem = MenuManage.taryMenu.getMenuItemById(serverId)?.submenu?.getMenuItemById(linkId);
        if (subItem != null) {
            subItem.checked = true;
        }
    }

    /**
     * 清楚选择状态
     */
    public static Disconnect(): void {
        // 先设置空白链接
        for (let i = 0; i < MenuManage.taryMenu.items.length - 2; i++) {
            const subItems = MenuManage.taryMenu.items[i].submenu;
            if (subItems != undefined || subItems != null) {
                subItems.items[0].checked = true;
                /*
                for (let n = 1; n < MenuManage.taryMenu.items[i].submenu.items.length - 1; n++) {
                    console.log(MenuManage.taryMenu.items[i].submenu.items[n].checked);
                    MenuManage.taryMenu.items[i].submenu.items[n].checked = false;
                }
                */
            }
        }
    }
}