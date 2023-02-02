import React from 'react';
import { useRequest } from 'ahooks';
import { Tabs } from 'antd';
import { getSearchDefaultKeys, getSearchContent } from '@/service';

const Search: React.FC = () => {
  // 获取默认搜索关键词
  const { data: searchDefault } = useRequest(getSearchDefaultKeys);

  const { data, loading } = useRequest(getSearchContent);

  return (
    <div></div>
  );
};

export default Search;
