import {Response} from 'express';
import {RowDataPacket} from 'mysql2';
import {conn, pool} from '../database';
import {CompanyTable} from '../database/tablesInterface';
import {DepartmentTable} from '../database/tablesInterface';

interface ICompanyService {
    getCompanyList(str: string, res: Response): void;
    getOrganizationTree(id: number, res: Response): void;
}

interface Node extends DepartmentTable {
    CHILDREN: Node[];
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
    getOrganizationTree(id, res) {
        (async () => {
            const connection = await pool.getConnection();
            try {
                let depth = 0;
                const sql = `select
                    *
                from 
                    DEPARTMENT_TABLE
                where
                    COMPANY_PK = ?
                and
                    DEPTH = ?`;
                const sql2 = `select
                    *   
                from 
                    DEPARTMENT_TABLE
                where
                    COMPANY_PK = ?
                and
                    DEPTH = ?
                and 
                    PARENT_PK = ?`;
                const [rows] = await connection.query(sql, [id, depth]);
                const depthZero = JSON.parse(JSON.stringify(rows)) as Node[];
                console.log('🚀 ~ file: companyService.ts ~ line 59 ~ depthZero', depthZero);
                depth += 1;
                await bootStrapNode(depthZero, depth, sql2, id);

                res.send(depthZero);
            } catch (e) {
                console.log(e);
            } finally {
                connection.release();
            }
        })();
    },
};

async function bootStrapNode(arr: Node[], depth: number, sql: string, companyId: number) {
    if (arr === undefined || arr.length === 0) return;

    const connection = await pool.getConnection();
    console.log('얼마나 실행되는지 볼까?');
    console.log('🚀 ~ file: companyService.ts ~ line 74 ~ bootStrapNode ~ arr', arr);

    try {
        const childrenArr = await Promise.all(
            arr.map(async curr => {
                const [rows] = await connection.query(sql, [companyId, depth, curr.DEPARTMENT_PK]);
                const depthNext = JSON.parse(JSON.stringify(rows)) as Node[];
                curr.CHILDREN = depthNext;

                return curr.CHILDREN;
            }),
        );

        console.log('🚀 ~ file: companyService.ts ~ line 92 ~ bootStrapNode ~ childrenArr', childrenArr);
        const nextDepth = depth + 1;

        if (childrenArr !== null && childrenArr.length > 0) {
            await Promise.all(
                childrenArr.map(async curr => {
                    await bootStrapNode(curr, nextDepth, sql, companyId);
                }),
            );
        }
    } catch (e) {
        console.log(e);
    } finally {
        connection.release();
    }
}

export default companyService;
