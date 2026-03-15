export type DayCell = {
  date: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  dayOfWeek: number; // 0=Sun, 6=Sat
};

export type WeekRow = DayCell[];

export type MonthGridData = {
  year: number;
  month: number; // 1-12
  monthName: string;
  dayHeaders: string[];
  weeks: WeekRow[];
  weekNumbers?: number[];
};

const DAY_NAMES_NARROW = ["M", "T", "W", "T", "F", "S", "S"];
const DAY_NAMES_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_NAMES_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function generateMonthGrid(
  year: number,
  month: number,
  options: {
    firstDayOfWeek?: number; // 0=Sun, 1=Mon (default)
    dayHeaderFormat?: "narrow" | "short" | "long";
    showWeekNumbers?: boolean;
    locale?: string;
  } = {}
): MonthGridData {
  const {
    firstDayOfWeek = 1,
    dayHeaderFormat = "short",
    showWeekNumbers = false,
  } = options;

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDay = new Date(year, month - 1, 1).getDay(); // 0=Sun

  // Adjust first day based on firstDayOfWeek
  let startOffset = firstDay - firstDayOfWeek;
  if (startOffset < 0) startOffset += 7;

  const dayHeadersMap = {
    narrow: DAY_NAMES_NARROW,
    short: DAY_NAMES_SHORT,
    long: DAY_NAMES_LONG,
  };

  let dayHeaders = dayHeadersMap[dayHeaderFormat];
  if (firstDayOfWeek === 0) {
    // Rotate for Sunday start
    dayHeaders = [dayHeaders[6], ...dayHeaders.slice(0, 6)];
  }

  const weeks: WeekRow[] = [];
  const weekNumbers: number[] = [];
  let currentDay = 1 - startOffset;

  while (currentDay <= daysInMonth) {
    const week: WeekRow = [];
    for (let i = 0; i < 7; i++) {
      const isCurrentMonth = currentDay >= 1 && currentDay <= daysInMonth;
      const actualDay = isCurrentMonth ? currentDay : 0;
      const date = new Date(year, month - 1, currentDay);
      const dayOfWeek = date.getDay();

      week.push({
        date: actualDay,
        isCurrentMonth,
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        dayOfWeek,
      });
      currentDay++;
    }
    weeks.push(week);

    if (showWeekNumbers) {
      const thursdayInWeek = new Date(
        year,
        month - 1,
        currentDay - 4
      );
      const startOfYear = new Date(thursdayInWeek.getFullYear(), 0, 1);
      const dayOfYear =
        Math.floor(
          (thursdayInWeek.getTime() - startOfYear.getTime()) / 86400000
        ) + 1;
      weekNumbers.push(Math.ceil(dayOfYear / 7));
    }
  }

  return {
    year,
    month,
    monthName: MONTH_NAMES[month - 1],
    dayHeaders,
    weeks,
    ...(showWeekNumbers ? { weekNumbers } : {}),
  };
}

export function generateYearGrids(
  year: number,
  startMonth: number = 1,
  options: Parameters<typeof generateMonthGrid>[2] = {}
): MonthGridData[] {
  const grids: MonthGridData[] = [];
  for (let i = 0; i < 12; i++) {
    const month = ((startMonth - 1 + i) % 12) + 1;
    const actualYear = startMonth + i > 12 ? year + 1 : year;
    grids.push(generateMonthGrid(actualYear, month, options));
  }
  return grids;
}
