// * Mapping interfaces
import {
    CompanyTable,
    CountryTable,
    DepartmentTable,
    LoginAuthTable,
    ResetPwTable,
    SocketTable,
    UserTable,
    ChatFileTable,
} from './DBTables';
export {
    CompanyTable,
    CountryTable,
    DepartmentTable,
    LoginAuthTable,
    ResetPwTable,
    SocketTable,
    ChatFileTable,
    UserTable,
};

// * MVC interfaces
import {
    BasePacket,
    CompanySelectData,
    DepartmentSelectData,
    IAccountController,
    IAccountService,
    IResetPw,
    ISignup,
    LoginSelectData,
    SuccessPacket,
    UserInfo,
} from './accountMVC';
export {
    BasePacket,
    CompanySelectData,
    DepartmentSelectData,
    IAccountController,
    IAccountService,
    IResetPw,
    ISignup,
    LoginSelectData,
    SuccessPacket,
    UserInfo,
};

//* file api interfaces
import { IFileController, IFileService } from './fileMVC';
export { IFileController, IFileService };

//* socket interface
import { ISocketService, IOneToOnePacket } from './socketMVC';
export { ISocketService, IOneToOnePacket };

// response types
import { IHttpError, IResponseData } from './responseInterfaces';
export { IHttpError, IResponseData };

// helpers
import { IGetResPacket } from './helper';
export { IGetResPacket };

// other types
import { RDBMSConfig, IWebSocketConfig, IMailBotConfig, IMailConfig } from './configInterfaces';
export { RDBMSConfig, IWebSocketConfig, IMailBotConfig, IMailConfig };
