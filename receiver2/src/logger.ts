export class Logger {
  private logger: debug.CastDebugLogger;
  private name: string;

  constructor(name: string, logger: debug.CastDebugLogger) {
    this.name = name;

    this.logger = logger;

    this.logger.setEnabled(true);
    this.logger.loggerLevelByEvents = {
      "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
      "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
    };
    if (!this.logger.loggerLevelByTags) {
      this.logger.loggerLevelByTags = {};
    }
    this.logger.loggerLevelByTags[this.name] = cast.framework.LoggerLevel.DEBUG;
    // Set to true to show debug overlay.
    // this.logger.showDebugLogs(true);
  }

  public debug(...args: any[]) {
    // console.log(`[${this.name}]`, ...args);
    this.logger.info(this.name, ...args);
  }

  public error(...args: any[]) {
    this.logger.error(this.name, ...args);
  }

  public info(...args: any[]) {
    this.logger.info(this.name, ...args);
  }

  public warn(...args: any[]) {
    this.logger.warn(this.name, ...args);
  }
}
