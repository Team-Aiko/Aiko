import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';

export default function TableView(props) {
    const { columns, data, view, value, onClick } = props;

    return (
        <Table>
            <TableHead>
                <TableRow>
                    {console.log(columns)}
                    {columns.map((column) => {
                        console.log(column);
                        return <TableCell key={column[value]}>{column[view]}</TableCell>;
                    })}
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow>
                    {data.map((item) => (
                        <TableCell
                            key={item[value]}
                            onClick={item.onClick ? onClick : null}
                            style={{ cursor: item.onClick ? 'pointer' : 'default' }}
                        >
                            {item[view]}
                        </TableCell>
                    ))}
                </TableRow>
            </TableBody>
        </Table>
    );
}
