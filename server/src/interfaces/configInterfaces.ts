import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export type RDBMSConfig = Pick<
    MysqlConnectionOptions,
    'type' | 'host' | 'port' | 'username' | 'password' | 'database' | 'synchronize'
>;

export interface IWebSocketConfig {
    readonly port: number;
    readonly socketPort: number;
    readonly socketPingInterval: number;
    readonly socketPinkTimeout: number;
    readonly socketIoPath: string;
    readonly bodyLimit: string;
    readonly bodyParameterLimit: number;
}

export interface IMailConfig {
    service: string;
    host: string;
    auth: { user: string; pass: string };
    maxConnections: number;
    maxMessage: number;
}

export interface IMailBotConfig {
    botEmailAddress: string;
}
