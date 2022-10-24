import React from 'react';
import { Input } from 'antd';
import styles from './index.module.less';

interface Props {
}

/**
 * 全局顶部搜索
 */
const Search: React.FC<Props> = (props) => {
  return <Input className={styles.search} placeholder='everything'/>;
};

export default Search;
