import React, { useState } from 'react';
import {
  MdSearch,
} from 'react-icons/md';
import {
  Autocomplete, InputAdornment, IconButton, TextField, Typography,
} from '@mui/material';
import SimpleBar from 'simplebar-react';

interface Option {
  label: string;
}

interface Props {
  placeholder: string;
  options: Option[];
}

const SearchAutoComplete = React.memo(({
  options,
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Autocomplete
      id="search-autocomplete"
      freeSolo
      open
      options={options}
      noOptionsText="找不到歌曲"
      onInputChange={(_, newInputValue) => {
        if (newInputValue?.trim()) {
          setOpen(true);
        } else {
          setOpen(false);
        }
      }}
      sx={{
        minWidth: 320,
        '& .MuiOutlinedInput-root': {
          padding: '0 8px',
        },
        '& .MuiFormControl-root .MuiOutlinedInput-root': {
          paddingRight: '8px',
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder="搜索..."
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  edge="end"
                  size="small"
                >
                  <MdSearch />
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              fontSize: (theme) => theme.typography.body2.fontSize,
              borderRadius: (theme) => theme.shape.borderRadius,
              '& .MuiInputBase-input': {
                padding: '6px 14px',
              },
              '&:hover': {
                borderColor: (theme) => theme.palette.primary.main,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.primary.main,
              },
              '&:focus': {
                borderColor: (theme) => theme.palette.primary.main,
              },
              '&:focus .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.primary.main,
              },
            },
          }}
        />
      )}
      ListboxProps={{
        sx: {
          height: 300,
        },
      }}
      renderOption={(props, option) => (
        <li {...props}>
          <Typography variant="body2" noWrap color="text.secondary">
            {option}
          </Typography>
        </li>
      )}
    />
  );
});

export default SearchAutoComplete;
