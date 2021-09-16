import {Response} from 'express';
import {RowDataPacket} from 'mysql2';
import {conn, pool} from '../database';
import {CompanyTable} from '../database/tablesInterface';

interface ICompanyService {
    getCompanyList(str: string, res: Response): void;
}

const companyService: ICompanyService = {
    getCompanyList(str, res) {
        const sql = `select 
            *
        from
            COMPANY_TABLE
        where
            COMPANY_NAME LIKE ?`;

        conn.query(sql, [str + '%'], (err, result, field) => {
            if (err) throw err;

            const rows = JSON.parse(JSON.stringify(result)) as CompanyTable[];
            console.log('🚀 ~ file: companyService.ts ~ line 24 ~ conn.query ~ rows', rows);

            res.send(rows);
        });
    },
};

export default companyService;
