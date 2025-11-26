export enum IPC_EVENTS {
  // renderer to main
  OPEN_WINDOW = 'open-window',
  CLOSE_WINDOW = 'close-window',
  MINIMIZE_WINDOW = 'minimize-window',
  MAXIMIZE_WINDOW = 'maximize-window',
  IS_WINDOW_MAXIMIZED = 'is-window-maximized',
  SET_THEME_MODE = 'set-theme-mode',
  GET_THEME_MODE = 'get-theme-mode',
  IS_DARK_THEME = 'is-dark-theme',
  RENDERER_IS_READY = 'renderer-ready',
  SHOW_CONTEXT_MENU = 'show-context-menu',

  START_A_DIALOGUE = 'start-a-dialogue',

  LOG_DEBUG = 'log-debug',
  LOG_INFO = 'log-info',
  LOG_WARN = 'log-warn',
  LOG_ERROR = 'log-error',
  // LOG_FATAL = 'log-fatal',


  // main to renderer
  THEME_MODE_UPDATED = 'theme-mode-updated',
}


export enum WINDOW_NAMES {
  MAIN = 'main',
  SETTING = 'setting',
  DIALOG = 'dialog',
}


export const MAIN_WIN_SIZE = {
  width: 1024,
  height: 800,
  minWidth: 1024,
  minHeight: 800,
} as const

export enum MENU_IDS {
  CONVERSATION_ITEM = 'conversation-item',
  CONVERSATION_LIST = 'conversation-list',
  MESSAGE_ITEM = 'message-item',
}

export enum CONVERSATION_ITEM_MENU_IDS {
  PIN = 'pin',
  RENAME = 'rename',
  DEL = 'del',
}

export enum CONVERSATION_LIST_MENU_IDS {
  NEW_CONVERSATION = 'newConversation',
  SORT_BY = 'sortBy',
  SORT_BY_CREATE_TIME = 'sortByCreateTime',
  SORT_BY_UPDATE_TIME = 'sortByUpdateTime',
  SORT_BY_NAME = 'sortByName',
  SORT_BY_MODEL = 'sortByModel',
  SORT_ASCENDING = 'sortAscending',
  SORT_DESCENDING = 'sortDescending',
  BATCH_OPERATIONS = 'batchOperations',
}

export enum MESSAGE_ITEM_MENU_IDS {
  COPY = 'copy',
  DELETE = 'delete',
  SELECT = 'select',
}
