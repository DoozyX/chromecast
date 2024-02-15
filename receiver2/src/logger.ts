export class Logger {
  private static logger: debug.CastDebugLogger;
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  static init(logger: debug.CastDebugLogger) {
    Logger.logger = logger;

    /*
     * Set verbosity level for Core events.
     */
    // Logger.logger.loggerLevelByEvents = {
    //   "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
    //   "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
    // };
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
