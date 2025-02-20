import React from "react";
import { MdAccessTime } from "react-icons/md";

import { TableHead, TableRow } from "@mui/material";

import TableCell from "../table-cell";
import Search from "./search";

interface Props {
  showSearch?: boolean;
  onSearch?: (value: string | undefined) => void;
}

const TableHeader = React.memo(({ showSearch, onSearch }: Props) => (
  <TableHead sx={{ marginBottom: "8px" }}>
    <TableRow>
      <TableCell sx={{ width: "48px", color: theme => theme.palette.text.secondary }} align="center">
        #
      </TableCell>
      <TableCell
        sx={{
          display: "flex",
          alignItems: "center",
          color: theme => theme.palette.text.secondary,
        }}
      >
        歌曲
        {showSearch && <Search onChange={onSearch!} />}
      </TableCell>
      <TableCell sx={{ color: theme => theme.palette.text.secondary }}>专辑</TableCell>
      <TableCell sx={{ color: theme => theme.palette.text.secondary }} align="center">
        <MdAccessTime size={18} />
      </TableCell>
    </TableRow>
  </TableHead>
));

export default TableHeader;
