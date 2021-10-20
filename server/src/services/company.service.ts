import { Res } from '@nestjs/common';
export default class CompanyService {
    list(str: string, @Res() res) {
        res.send(str);
    }
}
