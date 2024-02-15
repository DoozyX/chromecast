class LoggerWriter {
  public debug(...args: any[]) {
    console.debug(...args);
  }

  public error(...args: any[]) {
    console.error(...args);
  }

  public info(...args: any[]) {
    console.info(...args);
  }

  public warn(...args: any[]) {
    console.warn(...args);
  }
}

export class Logger {
  private static logger: LoggerWriter;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  static init() {
    Logger.logger = new LoggerWriter();
  }

  public debug(...args: any[]) {
    console.log(this.name, ...args);
    Logger.logger.debug(this.name, ...args);
  }

  public error(...args: any[]) {
    Logger.logger.error(this.name, ...args);
  }

  public info(...args: any[]) {
    Logger.logger.info(this.name, ...args);
  }

  public warn(...args: any[]) {
    Logger.logger.warn(this.name, ...args);
  }
}
