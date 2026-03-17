import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class HolidaysService {
  private cache: Map<number, string[]> = new Map();
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('openai.apiKey');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
    }
  }

  async getHolidaysForYear(year: number): Promise<string[]> {
    if (this.cache.has(year)) {
      return this.cache.get(year)!;
    }

    const holidays = await this.fetchHolidaysFromOpenAI(year);
    this.cache.set(year, holidays);
    return holidays;
  }

  private getBasicHolidaysForYear(year: number): string[] {
    const holidays: string[] = [
      `${year}-01-01`,
      `${year}-05-01`,
      `${year}-09-15`,
      `${year}-11-02`,
      `${year}-12-24`,
      `${year}-12-25`,
    ];

    const easter = this.calculateEaster(year);
    if (easter) {
      const holyThursday = new Date(easter);
      holyThursday.setDate(easter.getDate() - 3);
      const goodFriday = new Date(easter);
      goodFriday.setDate(easter.getDate() - 2);

      holidays.push(
        `${holyThursday.getFullYear()}-${String(holyThursday.getMonth() + 1).padStart(2, '0')}-${String(holyThursday.getDate()).padStart(2, '0')}`,
      );
      holidays.push(
        `${goodFriday.getFullYear()}-${String(goodFriday.getMonth() + 1).padStart(2, '0')}-${String(goodFriday.getDate()).padStart(2, '0')}`,
      );
    }

    holidays.push(`${year}-10-12`);
    holidays.push(`${year}-11-05`);

    return holidays;
  }

  private calculateEaster(year: number): Date | null {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;

    if (month && day) {
      return new Date(year, month - 1, day);
    }
    return null;
  }

  private async fetchHolidaysFromOpenAI(year: number): Promise<string[]> {
    const basicHolidays = this.getBasicHolidaysForYear(year);

    if (!this.openai) {
      return basicHolidays;
    }

    const prompt = `Lista TODOS los días festivos y días no laborables de El Salvador para el año ${year}.
    
Responde SOLO con un JSON array de strings, donde cada string es una fecha en formato YYYY-MM-DD.
No incluyas explicaciones, solo el array JSON.

Ejemplo de formato esperado:
["${year}-01-01", "${year}-04-18", "${year}-05-01", ...]

IMPORTANTE: Debes incluir TODOS los días festivos oficiales y no oficiales de El Salvador:

DÍAS FESTIVOS OFICIALES:
- Año Nuevo: ${year}-01-01
- Día del Trabajador: ${year}-05-01
- Día de la Independencia: ${year}-09-15
- Día de los Difuntos: ${year}-11-02
- Navidad: ${year}-12-25

DÍAS NO LABORABLES (también incluirlos):
- Nochebuena: ${year}-12-24
- Año Nuevo (día anterior si aplica)

DÍAS FESTIVOS RELIGIOSOS Y CÍVICOS:
- Semana Santa (incluye Jueves Santo, Viernes Santo - fechas variables según el año)
- Día de la Raza o Día de la Hispanidad (12 de octubre)
- Primer Grito de Independencia (5 de noviembre)
- Fiesta de la Paz (21 de septiembre) si aplica

CALCULA las fechas exactas para el año ${year} considerando que:
- Semana Santa varía cada año (busca las fechas exactas para ${year})
- Todos los demás son fechas fijas

IMPORTANTE: El 24 de diciembre (Nochebuena) es día no laborable y DEBE estar incluido.`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Eres un experto en calendarios y días festivos de El Salvador. Responde solo con arrays JSON válidos de fechas en formato YYYY-MM-DD.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        return [];
      }

      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const holidays = JSON.parse(jsonMatch[0]) as string[];
        const validHolidays = holidays.filter((date) => {
          const parsedDate = new Date(date);
          return !isNaN(parsedDate.getTime());
        });
        if (validHolidays.length > 0) {
          return validHolidays;
        }
      }

      return basicHolidays;
    } catch (error) {
      console.error('Error fetching holidays from OpenAI:', error);
      return basicHolidays;
    }
  }

  async isHoliday(date: string): Promise<boolean> {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const holidays = await this.getHolidaysForYear(year);
    const dateStr = date.split('T')[0];
    return holidays.includes(dateStr);
  }
}
