import { CONFIG_KEYS } from "@common/constants";

// HEX HSL
const generateColorPalette = (baseColor: string) => {
  const hsl = hexToHsl(baseColor);

  // 锁定色相，确保所有衍生色在同一色系
  const fixedHue = hsl.h;

  // 动态亮度调整因子，根据基础亮度自动调整
  const lightnessStep = hsl.l > 0.7 ? 0.1 : hsl.l < 0.3 ? 0.2 : 0.15;

  return {
    DEFAULT: baseColor,
    // 浅色变体：提高亮度，保持饱和度
    light: hslToHex(fixedHue, hsl.s, Math.min(hsl.l + lightnessStep, 0.95)),
    // 深色变体：降低亮度，保持饱和度
    dark: hslToHex(fixedHue, hsl.s, Math.max(hsl.l - lightnessStep, 0.05)),
    // 悬停变体：略微提高饱和度和亮度
    hover: hslToHex(fixedHue, Math.min(hsl.s + 0.05, 0.95), Math.min(hsl.l + 0.03, 0.95)),
    // 激活变体：提高饱和度，降低亮度
    active: hslToHex(fixedHue, Math.min(hsl.s + 0.1, 0.95), Math.max(hsl.l - 0.05, 0.05)),
    // 柔和变体：降低饱和度，提高亮度
    subtle: hslToHex(fixedHue, Math.max(hsl.s - 0.3, 0.1), Math.min(hsl.l + 0.2, 0.95))
  }
}


const hexToHsl = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error('Invalid HEX color');

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s as number, l };
}

// HSL转HEX格式 (h: 0-360, s: 0-1, l: 0-1)
const hslToHex = (h: number, s: number, l: number) => {
  // 将色相转换为0-1范围
  const normalizedHue = h / 360;

  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  let r, g, b;
  if (s === 0) {
    r = g = b = l; // 灰度
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, normalizedHue + 1 / 3);
    g = hue2rgb(p, q, normalizedHue);
    b = hue2rgb(p, q, normalizedHue - 1 / 3);
  }

  // 将0-1范围转换为0-255并格式化为HEX
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}


export const setPrimaryColor = (color: string) => {
  const colors = generateColorPalette(color);
  ['DEFAULT', 'light', 'dark', 'hover', 'active', 'subtle'].forEach(key => {
    if (key === 'DEFAULT')
      return document.documentElement.style.setProperty('--primary-color', colors[key]);
    document.documentElement.style.setProperty(`--primary-color-${key}`, colors[key as keyof typeof colors]);
  });
  window.api.setConfig(CONFIG_KEYS.PRIMARY_COLOR, colors.DEFAULT);
  return colors
}

export const getPrimaryColor = async () => {
  const baseColor = await window.api.getConfig(CONFIG_KEYS.PRIMARY_COLOR);
  const colors = generateColorPalette(baseColor);
  return colors;
}

export const getCSSVariable = (name: string) => {
  if (typeof window !== 'undefined') {
    const rootStyle = window.getComputedStyle(document.documentElement);
    return rootStyle.getPropertyValue(name).trim();
  }
  return ''
}
