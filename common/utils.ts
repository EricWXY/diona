import type { OpenAISetting } from './types';
import { encode, decode } from 'js-base64';
/**
 * 防抖函数
 * @param fn 需要执行的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(fn: T, delay: number): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return function (this: any, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 需要执行的函数
 * @param interval 间隔时间（毫秒）
 * @returns 节流处理后的函数
 */
export function throttle<T extends (...args: any[]) => any>(fn: T, interval: number): (...args: Parameters<T>) => void {
  let lastTime = 0;
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      fn.apply(this, args);
      lastTime = now;
    }
  };
}

export function deepMerge<T extends Record<string, any>>(target: T, source: T): T {
  // 处理 null 或 undefined 的情况
  if (target === null || target === undefined) {
    return source;
  }

  if (source === null || source === undefined) {
    return target;
  }

  // 如果 target 和 source 都是数组，合并它们
  if (Array.isArray(target) && Array.isArray(source)) {
    return [...target, ...source] as unknown as T;
  }

  // 如果 target 和 source 都是对象，递归合并
  if (typeof target === 'object' && typeof source === 'object') {
    const merged = { ...target } as T;

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = (target as any)[key];

        if (Object.prototype.hasOwnProperty.call(target, key) &&
          typeof sourceValue === 'object' && sourceValue !== null &&
          typeof targetValue === 'object' && targetValue !== null &&
          !Array.isArray(sourceValue) && !Array.isArray(targetValue)) {
          // 如果目标对象中已有该属性，且两者都是非数组对象，递归合并
          (merged as any)[key] = deepMerge(targetValue, sourceValue);
        } else {
          // 其他情况，直接替换/添加
          (merged as any)[key] = sourceValue;
        }
      }
    }

    return merged;
  }

  // 其他情况（基本类型），直接返回 source
  return source;
}

export function cloneDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cloneDeep(item)) as T;
  }

  const clone = Object.assign({}, obj);
  for (const key in clone) {
    if (Object.prototype.hasOwnProperty.call(clone, key)) {
      clone[key] = cloneDeep(clone[key]);
    }
  }
  return clone;
}

export function simpleCloneDeep<T>(obj: T): T {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    console.error('simpleCloneDeep failed:', error);
    return obj;
  }
}

export function stringifyOpenAISetting(setting: OpenAISetting) {
  try {
    return encode(JSON.stringify(setting));
  } catch (error) {
    console.error('stringifyOpenAISetting failed:', error);
    return '';
  }
}

export function parseOpenAISetting(setting: string): OpenAISetting {
  try {
    return JSON.parse(decode(setting));
  } catch (error) {
    console.error('parseOpenAISetting failed:', error);
    return {} as OpenAISetting;
  }
}

export function uniqueByKey<T extends Record<string, any>>(arr: T[], key: keyof T): T[] {
  const seen = new Map<any, boolean>();
  return arr.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.set(keyValue, true);
    return true;
  });
}
