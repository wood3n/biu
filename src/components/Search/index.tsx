import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import {
  MdSearch,
  MdDeleteForever,
  MdOutlineClose,
} from 'react-icons/md';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import { getSearchSuggest } from '@/service';
import { SEARCH_KEY_MAP } from './constants';
import styles from './index.module.less';

const StyleSearch = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      width: '12ch',
      '&:focus': {
        width: '20ch',
      },
    },
  },
}));

/**
 * 全局搜索
 */
const Search: React.FC = () => {
  const navigate = useNavigate();

  // 获取搜索建议
  const { loading: loadSearchSuggestion, data: searchSuggestion, run: search } = useRequest(getSearchSuggest, {
    debounceWait: 500,
    manual: true,
  });

  // 搜索获取搜索建议
  const handleSearch: React.ChangeEventHandler<HTMLInputElement> | undefined = (e) => {
    const content = e.target.value?.trim();
    if (content) {
      search(content);
    }
  };

  // 回车跳转搜索页
  // 如果没有输入则戴上默认搜索关键词
  const handlePressEnter: React.KeyboardEventHandler<HTMLDivElement> | undefined = (e) => {
    if (e.key === 'Enter') {
      navigate('/search');
    }
  };

  const menuItems = searchSuggestion?.result?.order?.map((key) => {
    const { icon, text: submenuTitle } = SEARCH_KEY_MAP[key];
    let children;

    switch (key) {
      case 'songs': {
        children = searchSuggestion?.result?.songs?.map(({ id, name, artists }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'albums': {
        children = searchSuggestion?.result?.albums?.map(({ id, name, artists }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'artists': {
        children = searchSuggestion?.result?.artists?.map(({ id, name }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      case 'playlists': {
        children = searchSuggestion?.result?.playlists?.map(({ id, name }) => ({
          key: id,
          label: name,
        }));
        break;
      }
      default:
        children = null;
    }

    return {
      label: (
        <span className={styles.searchMenuSubtitle}>
          {icon}
          {submenuTitle}
        </span>
      ),
      key,
      type: 'group',
      children,
    };
  });

  return (
    <StyleSearch>
      <SearchIconWrapper>
        <MdSearch />
      </SearchIconWrapper>
      <StyledInputBase
        placeholder="Search…"
        inputProps={{ 'aria-label': 'search' }}
      />
    </StyleSearch>
  );
};

export default Search;
