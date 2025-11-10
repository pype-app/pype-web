/**
 * Utilitário para converter expressões cron para linguagem humana usando cronstrue
 */
import cronstrue from 'cronstrue';

/**
 * Converte uma expressão cron para linguagem humana em inglês
 * @param cronExpression - Expressão cron no formato "minuto hora dia mês dia-da-semana"
 * @returns Descrição em inglês ou "Manual" se não há expressão
 */
export function cronToHuman(cronExpression: string): string {
  if (!cronExpression || cronExpression.trim() === '') {
    return 'Manual';
  }

  try {
    return cronstrue.toString(cronExpression, {
      verbose: false,
      dayOfWeekStartIndexZero: true,
      use24HourTimeFormat: true,
      locale: 'en'
    });
  } catch (error) {
    console.warn('Error converting cron expression to human readable:', error);
    return cronExpression; // Retorna original se não conseguir converter
  }
}

/**
 * Exemplos de conversões usando cronstrue
 */
export const cronExamples = {
  '0 0 * * *': 'At 12:00 AM',
  '0 12 * * *': 'At 12:00 PM',
  '30 14 * * *': 'At 02:30 PM',
  '0 0 * * 1': 'At 12:00 AM, only on Monday',
  '0 9 * * 5': 'At 09:00 AM, only on Friday',
  '0 0 1 * *': 'At 12:00 AM, on day 1 of the month',
  '0 6 15 * *': 'At 06:00 AM, on day 15 of the month',
  '0 0 1 1 *': 'At 12:00 AM, on day 1 of the month, only in January',
  '0 10 25 12 *': 'At 10:00 AM, on day 25 of the month, only in December',
  '*/5 * * * *': 'Every 5 minutes',
  '0 */2 * * *': 'Every 2 hours',
  '*/15 * * * *': 'Every 15 minutes',
};