// * backend
import { Response } from 'express';
// * Database
import { RowDataPacket } from 'mysql2';
import { conn, pool } from '../database';
import { CompanyTable, DepartmentTable, UserTable } from '../database/tablesInterface';
import { ICompanyService, Node } from './_types/businessTypes';

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
    getOrganizationTree(id, userInfo, res) {
        (async () => {
            const connection = await pool.getConnection();
            try {
                if (id !== userInfo.COMPANY_PK) {
                    // 데이터 위변조.
                    res.send([]);
                }

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
                await this.bootStrapNode(depthZero, depth, sql2, id);

                res.send(depthZero);
            } catch (e) {
                console.log(e);
                res.send([]);
            } finally {
                connection.release();
            }
        })();
    },
    getDepartmentMembers(deptId, userInfo, res) {
        const { COMPANY_PK } = userInfo;

        (async () => {
            const connection = await pool.getConnection();

            try {
                const sqlOne = `
                with recursive DEPARTMENT_TREE as (
                    select
                        *
                    from DEPARTMENT_TABLE
                    where DEPARTMENT_PK = ? AND COMPANY_PK = ?
                    union all
                    select
                        D1.*
                    from
                        DEPARTMENT_TABLE AS D1, DEPARTMENT_TREE AS D2
                    where
                        D1.PARENT_PK = D2.DEPARTMENT_PK
                )
                select * from DEPARTMENT_TREE`;
                const sqlTwo = `select 
                    U.USER_PK,
                    U.FIRST_NAME,
                    U.LAST_NAME,
                    U.EMAIL,
                    U.TEL,
                    U.DEPARTMENT_PK,
                    D.DEPARTMENT_NAME
                from USER_TABLE U, DEPARTMENT_TABLE D 
                where 
                    U.DEPARTMENT_PK = D.DEPARTMENT_PK
                    AND
                    D.DEPARTMENT_PK = ?`;

                const [rows] = JSON.parse(
                    JSON.stringify(await connection.query(sqlOne, [deptId, COMPANY_PK])),
                ) as DepartmentTable[][];
                const temp2DRows = await Promise.all(
                    rows.map(async (curr) => {
                        return JSON.parse(
                            JSON.stringify(await connection.query(sqlTwo, [curr.DEPARTMENT_PK])),
                        )[0] as UserTable[];
                    }),
                );
                let memRows: UserTable[] = [];
                temp2DRows.forEach((curr) => {
                    memRows = memRows.concat(curr);
                });
                console.log('🚀 ~ file: companyService.ts ~ line 112 ~ memRows', memRows);

                res.send(memRows);
            } catch (e) {
                throw e;
            } finally {
                connection.release();
            }
        })();
    },
    bootStrapNode: async function (arr, depth, sql, companyId) {
        if (arr === undefined || arr.length === 0) return;

        const connection = await pool.getConnection();
        console.log('얼마나 실행되는지 볼까?');
        console.log('🚀 ~ file: companyService.ts ~ line 74 ~ bootStrapNode ~ arr', arr);

        try {
            const childrenArr = await Promise.all(
                arr.map(async (curr) => {
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
                    childrenArr.map(async (curr) => {
                        await this.bootStrapNode(curr, nextDepth, sql, companyId);
                    }),
                );
            }
        } catch (e) {
            console.log(e);
        } finally {
            connection.release();
        }
    },
};

// async function bootStrapNode(arr: Node[], depth: number, sql: string, companyId: number) {
//     if (arr === undefined || arr.length === 0) return;

//     const connection = await pool.getConnection();
//     console.log('얼마나 실행되는지 볼까?');
//     console.log('🚀 ~ file: companyService.ts ~ line 74 ~ bootStrapNode ~ arr', arr);

//     try {
//         const childrenArr = await Promise.all(
//             arr.map(async (curr) => {
//                 const [rows] = await connection.query(sql, [companyId, depth, curr.DEPARTMENT_PK]);
//                 const depthNext = JSON.parse(JSON.stringify(rows)) as Node[];
//                 curr.CHILDREN = depthNext;

//                 return curr.CHILDREN;
//             }),
//         );

//         console.log('🚀 ~ file: companyService.ts ~ line 92 ~ bootStrapNode ~ childrenArr', childrenArr);
//         const nextDepth = depth + 1;

//         if (childrenArr !== null && childrenArr.length > 0) {
//             await Promise.all(
//                 childrenArr.map(async (curr) => {
//                     await bootStrapNode(curr, nextDepth, sql, companyId);
//                 }),
//             );
//         }
//     } catch (e) {
//         console.log(e);
//     } finally {
//         connection.release();
//     }
// }

export default companyService;