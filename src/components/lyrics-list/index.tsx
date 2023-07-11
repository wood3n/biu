import React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import {
  OverlayScrollbarsComponent,
} from 'overlayscrollbars-react';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface Props {
  lyrics?: string;
}

const LyricsList = React.memo(({
  lyrics,
}: Props) => (
  <List
    sx={{
      height: 450,
      overflow: 'auto',
    }}
  >
    <OverlayScrollbarsComponent style={{ height: '100%' }}>
      {lyrics?.split('\n')?.map((line, i) => (
        <ListItem key={String(i)} component="div" disablePadding>
          <ListItemButton>
            <ListItemText primary={line} />
          </ListItemButton>
        </ListItem>
      ))}
    </OverlayScrollbarsComponent>
  </List>
));

export default LyricsList;
