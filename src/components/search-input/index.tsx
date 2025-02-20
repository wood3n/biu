import React from "react";
import { MdSearch } from "react-icons/md";

import type { InputBaseProps } from "@mui/material";
import { IconButton, InputAdornment, OutlinedInput } from "@mui/material";

const SearchInput = React.memo((props: InputBaseProps) => (
  <OutlinedInput
    size="small"
    {...props}
    endAdornment={
      <InputAdornment position="end">
        <IconButton aria-label="toggle password visibility" edge="end" size="small">
          <MdSearch />
        </IconButton>
      </InputAdornment>
    }
    sx={{
      borderRadius: theme => theme.shape.borderRadius,
      "& .MuiInputBase-input": {
        padding: "6px 14px",
      },
      "&:hover": {
        borderColor: theme => theme.palette.primary.main,
      },
      "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: theme => theme.palette.primary.main,
      },
      "&:focus": {
        borderColor: theme => theme.palette.primary.main,
      },
      "&:focus .MuiOutlinedInput-notchedOutline": {
        borderColor: theme => theme.palette.primary.main,
      },
    }}
  />
));

export default SearchInput;
