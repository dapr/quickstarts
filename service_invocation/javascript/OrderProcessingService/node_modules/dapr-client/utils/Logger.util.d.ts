export declare enum LoggerLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    HTTP = 3,
    TRACE = 4,
    VERBOSE = 5,
    DEBUG = 6,
    SILLY = 7
}
export declare class Logger {
    static print(level: LoggerLevel, message: string, category?: string): void;
    static error(message: string, category?: string): void;
    static warn(message: string, category?: string): void;
    static info(message: string, category?: string): void;
    static http(message: string, category?: string): void;
    static log(message: string, category?: string): void;
    static debug(message: string, category?: string): void;
    static os(category?: string, msgPrefix?: string): void;
    static traceStart(): [number, number];
}
