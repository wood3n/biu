import React, { useState } from "react";

import { Table, TableBody, TableContainer } from "@mui/material";

import Empty from "../empty";
import TableHead from "./table-header";
import TableRow from "./table-row";
import TableSkeleton from "./table-skeleton";

interface Props {
  loading: boolean;
  data?: Song[];
}

const PlaylistTable: React.FC<Props> = ({ loading, data }) => {
  const [searchName, setSearchName] = useState<string>();

  if (loading) {
    return (
      <TableContainer>
        <Table>
          <TableSkeleton />
        </Table>
      </TableContainer>
    );
  }

  if (!data?.length) {
    return <Empty description="暂无歌曲" />;
  }

  return (
    <TableContainer>
      <Table>
        <TableHead showSearch onSearch={v => setSearchName(v)} />
        <TableBody>
          {data
            ?.filter(item => (searchName?.trim() ? item.name.includes(searchName?.trim()) : true))
            ?.map((rowData, index) => <TableRow key={rowData.id} index={index} data={rowData} />)}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PlaylistTable;
