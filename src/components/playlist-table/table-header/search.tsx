import React, { useState } from 'react';
import {
  Input, Collapse, Box, IconButton, useTheme, InputAdornment,
} from '@mui/material';
import { MdSearch, MdClose } from 'react-icons/md';
import { useDebounceFn } from 'ahooks';

interface Props {
  onChange: (value: string | undefined) => void;
}

const TableSearch = React.memo(({ onChange }: Props) => {
  const theme = useTheme();
  const [input, setInput] = useState<string>();
  const [active, setActive] = useState(false);

  const { run } = useDebounceFn(onChange, {
    wait: 500,
  });

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        marginLeft: '12px',
        minWidth: 'min-content',
      }}
    >
      <IconButton
        size="small"
        onClick={() => {
          setActive(true);
        }}
        sx={{
          width: '24px',
          height: '24px',
        }}
      >
        <MdSearch size={14} color={theme.palette.text.secondary} />
      </IconButton>
      <Collapse orientation="horizontal" in={active || Boolean(input?.trim())}>
        <Input
          inputRef={(input) => input && input.focus()}
          value={input || ''}
          onChange={(e) => {
            setInput(e.target.value);
            run(e.target.value);
          }}
          endAdornment={(
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => {
                  setInput(undefined);
                  run(undefined);
                }}
              >
                <MdClose size={14} color={theme.palette.text.secondary} />
              </IconButton>
            </InputAdornment>
          )}
          onBlur={() => setActive(false)}
        />
      </Collapse>
    </Box>
  );
});

export default TableSearch;
