import React from 'react';
import {
  Spin, Card, Typography, Button, Input, Dropdown,
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { STORAGE_ITEM, remove } from '@/common/localforage';
import {
  MdSearch,
  MdDeleteForever,
  MdOutlineClose,
} from 'react-icons/md';
import { getSearchSuggest } from '@/service';
import { SEARCH_KEY_MAP } from './constants';
import styles from './index.module.less';

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
    <div onKeyDown={handlePressEnter}>
      <Dropdown
        menu={{
          items: menuItems,
          defaultOpenKeys: searchSuggestion?.result ? Object.keys(searchSuggestion.result) : [],
        }}
        trigger={['click']}
        getPopupContainer={(node) => node.parentElement!}
        dropdownRender={(menus) => (
          <Spin spinning={loadSearchSuggestion}>
            <Card
              bordered={false}
              bodyStyle={{
                padding: 12,
                width: 400,
              }}
              className={styles.searchDropdown}
            >
              <div className={styles.searchHistory}>
                <Typography.Title level={5} className={styles.title}>
                  搜索历史
                  <a onClick={() => remove(STORAGE_ITEM.SEARCH_KEY)} className={styles.delBtn}><MdDeleteForever size={16} /></a>
                </Typography.Title>
                <div className={styles.searchKeys}>
                  <Button size="small">
                    <span className={styles.tagContent}>
                      测试
                      <MdOutlineClose />
                    </span>
                  </Button>
                </div>
              </div>
              {searchSuggestion && (
                <div className={styles.searchAdvice}>
                  {menus}
                </div>
              )}
            </Card>
          </Spin>
        )}
      >
        <Input
          allowClear
          prefix={<MdSearch />}
          placeholder="everything"
          style={{ width: 240, borderRadius: 16 }}
          onChange={handleSearch}
        />
      </Dropdown>
    </div>
  );
};

export default Search;
