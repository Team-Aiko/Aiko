// * Mapping interfaces
import {
    CompanyTable,
    CountryTable,
    DepartmentTable,
    LoginAuthTable,
    ResetPwTable,
    SocketTable,
    UserInfo,
    UserTable,
} from './DBTables';

export { CompanyTable, CountryTable, DepartmentTable, LoginAuthTable, ResetPwTable, SocketTable, UserInfo, UserTable };

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
};
