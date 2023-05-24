import React from 'react';
import { useRequest } from 'ahooks';
import { getSearchDefault, getCloudsearch } from '@/service';

const Search: React.FC = () => {
  // 获取默认搜索关键词
  const { data: searchDefault } = useRequest(getSearchDefault);

  const { data, loading } = useRequest(getCloudsearch);

  return <div>搜索</div>;
};

export default Search;
