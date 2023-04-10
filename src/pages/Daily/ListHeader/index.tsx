import { Row, Col } from 'antd';
import { MdAccessTime } from 'react-icons/md';
import styles from './index.module.less';

const ListHeader = () => (
  <Row className={styles.listHeader}>
    <Col span={1} className={styles.index}>
      #
    </Col>
    <Col span={13}>
      歌曲
    </Col>
    <Col span={7}>
      专辑
    </Col>
    <Col span={1} className={styles.duration}>
      <MdAccessTime size={18} />
    </Col>
  </Row>
);

export default ListHeader;
