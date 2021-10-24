// response types
import { IHttpError, IResponseData } from './responseInterfaces';
export { IHttpError, IResponseData };

// helpers
import { IGetResPacket } from './helper';
export { IGetResPacket };

// DBTables
import {
    ChatFileTable,
    CompanyTable,
    CountryTable,
    DepartmentTable,
    LoginAuthTable,
    OneToOneChatRoomTable,
    ResetPwTable,
    SocketTable,
    UserTable,
} from './DBTables';
export {
    ChatFileTable,
    CompanyTable,
    CountryTable,
    DepartmentTable,
    LoginAuthTable,
    OneToOneChatRoomTable,
    ResetPwTable,
    SocketTable,
    UserTable,
};

// other types
import { RDBMSConfig, IWebSocketConfig, IMailBotConfig, IMailConfig } from './configInterfaces';
export { RDBMSConfig, IWebSocketConfig, IMailBotConfig, IMailConfig };
