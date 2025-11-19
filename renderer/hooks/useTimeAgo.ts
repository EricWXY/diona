
function isSameCalenderWeek(date1: Date, date2: Date): boolean {
  const getStartOfWeek = (date: Date): Date => {
    const start = new Date(date);
    const day = start.getDay(); // 0 = 星期日, 1 = 星期一, ..., 6 = 星期六

    // 如果是周日，减去6天就回调到上一周周一
    // 否则减去1 就回调到本周周一
    const diff = start.getDate() - (day === 0 ? 6 : day - 1);
    return new Date(start.setDate(diff));
  }

  const getStartOfWeek1 = getStartOfWeek(date1);
  const getStartOfWeek2 = getStartOfWeek(date2);

  return getStartOfWeek1.toDateString() === getStartOfWeek2.toDateString();
}

function formatTimeOny(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function getWeekDay(date: Date, t: any): string {
  const weekDays = [
    t('timeAgo.weekday.sun'),
    t('timeAgo.weekday.mon'),
    t('timeAgo.weekday.tue'),
    t('timeAgo.weekday.wed'),
    t('timeAgo.weekday.thu'),
    t('timeAgo.weekday.fri'),
    t('timeAgo.weekday.sat'),
  ];
  return weekDays[date.getDay()];
}

function formatMonthDay(date: Date, locale: string): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  if (locale === 'en') {
    return `${month}/${day}`;
  } else {
    return `${month}月${day}日`;
  }
}

function formatFullDateTime(date: Date, locale: string): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  if (locale === 'en') {
    // 英文格式: MM/DD/YYYY HH:MM
    return `${month}/${day}/${year} ${hours}:${minutes}`;
  } else {
    // 中文格式: YYYY年MM月DD日 HH:MM
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }
}

function formatTimeAgoCore(targetDate: Date, nowDate: Date, t: any, locale: string): string {
  const diff = nowDate.getTime() - targetDate.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  const isSameDay = targetDate.toDateString() === nowDate.toDateString();

  const isSameWeek = isSameCalenderWeek(targetDate, nowDate);

  const isSameYear = targetDate.getFullYear() === nowDate.getFullYear();

  // 1. 一小时以内
  if (hours < 1) {
    if (minutes < 5) {
      return t('timeAgo.justNow');
    }
    return t('timeAgo.minutes', { count: minutes });
  }

  // 2. 一小时到一天以内（同一天）
  else if (isSameDay) {
    return formatTimeOny(targetDate);
  }

  // 3. 一天以上 一周以内（同周）

  else if (!isSameDay && isSameWeek) {
    return `${getWeekDay(targetDate, t)} ${formatTimeOny(targetDate)}`
  }

  // 4. 一周以上 一年以内（同年）

  else if (!isSameDay && !isSameWeek && isSameYear) {
    return `${formatMonthDay(targetDate, locale)} ${formatTimeOny(targetDate)}`
  }

  // 5. 一年以上
  else {
    return formatFullDateTime(targetDate, locale);
  }
}

export function useBatchTimeAgo() {
  const { t, locale } = useI18n();
  const now = ref(new Date());
  const timer = ref<number | null>(null);
  const updateInterval = 1000 * 60; // 每分钟更新一次

  const setupTimer = () => {
    if (!timer.value) {
      timer.value = window.setInterval(() => {
        now.value = new Date();
      }, updateInterval)
    }
  }

  const clearTimer = () => {
    if (timer.value) {
      window.clearInterval(timer.value);
      timer.value = null;
    }
  }

  const formatTimeAgo = (timestamp: number | Date): string => {
    const targetDate = timestamp instanceof Date ? timestamp : new Date(timestamp);

    return formatTimeAgoCore(targetDate, now.value, t, locale.value);
  }

  setupTimer();

  onUnmounted(() => {
    clearTimer();
  })


  return {
    formatTimeAgo,
    clearTimer
  }
}
