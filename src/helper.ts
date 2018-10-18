import Locale from './models/locale.model';

export class Helper {
  static getFormattedDate(day: number, month: number, year: number): string {
    const dayStr = String(`00${day}`).slice(-2);
    const monthStr = String(`00${month}`).slice(-2);
    const yearStr = String(`0000${year}`).slice(-4);
    return `${dayStr}/${monthStr}/${yearStr}`;
  }

  static getMonthYear(month: number, year: number) {
    return `${Locale.monthNames[month]}/${year}`;
  }
}
