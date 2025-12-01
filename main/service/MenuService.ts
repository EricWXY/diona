import { ipcMain, Menu, type MenuItemConstructorOptions } from 'electron';
import { CONFIG_KEYS, IPC_EVENTS } from '@common/constants';
import { cloneDeep } from '@common/utils';
import { createTranslator } from '../utils'
import logManager from './LogService';
import configManager from './ConfigService';

let t: ReturnType<typeof createTranslator> = createTranslator();

class MenuService {
  private static _instance: MenuService;
  private _menuTemplates: Map<string, MenuItemConstructorOptions[]> = new Map();
  private _currentMenu?: Menu = void 0;

  private constructor() {
    this._setupIpcListener();
    this._setupLanguageChangeListener();
    logManager.info('MenuService initialized successfully.');
  }

  private _setupIpcListener() {
    ipcMain.handle(IPC_EVENTS.SHOW_CONTEXT_MENU, (_, menuId, dynamicOptions?: string) => new Promise((resolve) => this.showMenu(menuId, () => resolve(true), dynamicOptions)))
  }

  private _setupLanguageChangeListener() {
    configManager.onConfigChange((config)=>{
      if(!config[CONFIG_KEYS.LANGUAGE]) return;

      t = createTranslator()
    })
  }

  public static getInstance() {
    if (!this._instance)
      this._instance = new MenuService();
    return this._instance;
  }

  public register(menuId: string, template: MenuItemConstructorOptions[]) {
    this._menuTemplates.set(menuId, template);
    return menuId;
  }

  public showMenu(menuId: string, onClose?: () => void, dynamicOptions?: string) {
    if (this._currentMenu) return;

    const template = cloneDeep(this._menuTemplates.get(menuId));

    if (!template) {
      logManager.warn(`Menu ${menuId} not found.`);
      onClose?.();
      return;
    }

    let _dynamicOptions: Array<Partial<MenuItemConstructorOptions> & { id: string }> = [];
    try {
      _dynamicOptions = Array.isArray(dynamicOptions) ? dynamicOptions : JSON.parse(dynamicOptions ?? '[]');
    } catch (error) {
      logManager.error(`Failed to parse dynamicOptions for menu ${menuId}: ${error}`);
    }

    const translationItem = (item: MenuItemConstructorOptions): MenuItemConstructorOptions => {
      if (item.submenu) {
        return {
          ...item,
          label: t(item?.label) ?? void 0,
          submenu: (item.submenu as MenuItemConstructorOptions[])?.map((item: MenuItemConstructorOptions) => translationItem(item))
        }
      }
      return {
        ...item,
        label: t(item?.label) ?? void 0
      }
    }
    const localizedTemplate = template.map(item => {
      if (!Array.isArray(_dynamicOptions) || !_dynamicOptions.length) {
        return translationItem(item);
      }

      const dynamicItem = _dynamicOptions.find(_item => _item.id === item.id);

      if (dynamicItem) {
        const mergedItem = { ...item, ...dynamicItem };
        return translationItem(mergedItem);
      }

      if (item.submenu) {
        return translationItem({
          ...item,
          submenu: (item.submenu as MenuItemConstructorOptions[])?.map((__item: MenuItemConstructorOptions) => {
            const dynamicItem = _dynamicOptions.find(_item => _item.id === __item.id);
            return { ...__item, ...dynamicItem };
          })
        })
      }

      return translationItem(item);
    })

    const menu = Menu.buildFromTemplate(localizedTemplate);

    this._currentMenu = menu;

    menu.popup({
      callback: () => {
        this._currentMenu = void 0;
        onClose?.();
      }
    })
  }

  public destroyMenu(menuId: string) {
    this._menuTemplates.delete(menuId);
  }

  public destroyed() {
    this._menuTemplates.clear();
    this._currentMenu = void 0;
  }
}

export const menuManager = MenuService.getInstance();
export default menuManager;
