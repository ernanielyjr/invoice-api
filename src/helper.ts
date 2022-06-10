import Locale from "./models/locale.model";

export class Helper {
  static dateToString(date: Date) {
    return this.getFormattedDate(
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear()
    );
  }

  static getFormattedDate(day: number, month: number, year: number): string {
    const dayStr = String(`00${day}`).slice(-2);
    const monthStr = String(`00${month}`).slice(-2);
    const yearStr = String(`0000${year}`).slice(-4);
    return `${dayStr}/${monthStr}/${yearStr}`;
  }

  static getMonthYear(month: number, year: number) {
    return `${Locale.monthNames[month]}/${year}`;
  }

  static sumPostingsAmount(invoice) {
    return (
      Math.round(
        invoice.postings.reduce((sum, posting) => sum + posting.amount, 0) * 100
      ) / 100
    );
  }

  static normalizeString(str: string) {
    return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";
  }
}
