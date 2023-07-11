import React, { useState } from 'react';
import {
  MdSearch,
} from 'react-icons/md';
import {
  useTheme, Autocomplete, InputAdornment, IconButton, TextField, Typography,
} from '@mui/material';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

interface Props {
  placeholder: string;
  options: string[];
  onChange: (value: string | null) => void;
}

const ListboxComponent = React.forwardRef<
HTMLDivElement,
React.HTMLAttributes<HTMLElement>
>((props, ref) => (
  <OverlayScrollbarsComponent style={{ height: '100%' }}>
    <ul {...props} />
  </OverlayScrollbarsComponent>
));

const SearchAutoComplete = React.memo(({
  placeholder,
  options,
  onChange,
}: Props) => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <Autocomplete
      id="search-autocomplete"
      freeSolo
      autoSelect
      open={open}
      size="small"
      options={options}
      noOptionsText="找不到歌曲"
      onInputChange={(_, newInputValue) => {
        if (newInputValue?.trim()) {
          setOpen(true);
        } else {
          setOpen(false);
        }
      }}
      onChange={(_, value) => {
        console.log(value);
        setOpen(false);
        onChange(value as string);
      }}
      sx={{
        width: 240,
        '& .MuiFormControl-root .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary': {
          padding: '4px',
        },
      }}
      componentsProps={{
        paper: {
          sx: {
            height: 280,
          },
        },
      }}
      ListboxProps={{
        sx: {
          height: 'auto',
          overflow: 'initial',
        },
      }}
      ListboxComponent={ListboxComponent}
      renderInput={(params) => (
        <TextField
          {...params}
          variant="outlined"
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="search"
                  edge="end"
                  size="small"
                >
                  <MdSearch size={14} color={theme.palette.text.secondary} />
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
