import { Layout } from 'antd';
import WindowAction from '../WindowAction';
import './index.css';

/**
 * 系统顶栏
 * 1. 最小化，全屏缩放，关闭
 * 2. 拖拽区域
 */
const SysHeader = () => {
  return (
    <Layout.Header className='system-header'>
      <div className='win-action'>
        <WindowAction />
      </div>
    </Layout.Header>
  );
};

export default SysHeader;