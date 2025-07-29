class Logger {
  private log(level: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${level}: ${message}`, data ? JSON.stringify(data) : '');
  }

  info(message: string, data?: any) {
    this.log('ИНФО', message, data);
  }

  error(message: string, data?: any) {
    this.log('ОШИБКА', message, data);
  }

  warn(message: string, data?: any) {
    this.log('ПРЕДУПРЕЖДЕНИЕ', message, data);
  }

  debug(message: string, data?: any) {
    this.log('ДЕБАГ', message, data);
  }
}

export const logger = new Logger();
