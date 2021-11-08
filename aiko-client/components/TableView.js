import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

export default function TableView(props) {
    const { columns, data, view, value, onClick } = props;

    return (
        <Table>
            <TableHead>
                <TableRow>
                    {columns.map((column) => {
                        return <TableCell key={column[value]}>{column[view]}</TableCell>;
                    })}
                </TableRow>
            </TableHead>
            <TableBody>
                {data.map((row, index) => {
                    return (
                        <TableRow
                            key={index}
                            onClick={row.rowClick ? row.rowClick : null}
                            style={{ cursor: row.rowClick ? 'pointer' : 'default' }}
                        >
                            {row.data.map((item) => (
                                <TableCell key={item[value]}>{item[view]}</TableCell>
                            ))}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}
