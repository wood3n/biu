import React from "react";

import { useRequest } from "ahooks";

import { getRecommendSongs } from "@/service";

import { columns } from "./columns";

const Daily = () => {
  const { data, loading } = useRequest(getRecommendSongs);

  return (
    <div>
      <div className="grid grid-cols-12 gap-x-1">
        {columns.map(column => (
          <div key={column.key} className={`col-span-${column.colSpan}`}>
            {column.title}
          </div>
        ))}
      </div>
      {data?.data?.dailySongs?.map((rowData, rowIndex) => (
        <div key={rowData.id} className="grid grid-cols-12 gap-x-1">
          {columns.map(column => (
            <div key={column.key} className={`col-span-${column.colSpan}`}>
              {column.render ? column.render(rowData[column.key], rowData, rowIndex) : rowData[column.key]}
            </div>
          ))}
        </div>
      ))}
      {/* <Table layout="fixed" isHeaderSticky selectionMode="single" color="success" removeWrapper>
        <TableHeader columns={columns}>
          {column => (
            <TableColumn key={column.key} align={column.align} width={column.width}>
              {column.title}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody isLoading={loading}>
          {data?.data?.dailySongs?.map((rowData, index) => (
            <TableRow key={rowData.id}>{columnKey => <TableCell>{renderCell(rowData, columnKey as string, index)}</TableCell>}</TableRow>
          )) ?? <>{null}</>}
        </TableBody>
      </Table> */}
    </div>
  );
};

export default Daily;
