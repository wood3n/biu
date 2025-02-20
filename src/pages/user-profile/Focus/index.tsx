import React, { useEffect, useState } from "react";
import { AiOutlineUser } from "react-icons/ai";

import { useRequest } from "ahooks";
import { Avatar, Card, Col, Pagination, Row, Spin, Typography } from "antd";

import { getUserFollows } from "@/service";
// import { useUser } from '@/common/hooks';
import useUser from "@/store/user-atom";

import styles from "./index.module.less";

/**
 * 我的关注
 */
const MyFocus: React.FC = () => {
  const [user] = useUser();
  const [page, setPage] = useState(1);

  const { data, loading, runAsync } = useRequest(getUserFollows, { manual: true });

  useEffect(() => {
    if (user?.userInfo?.profile?.userId) {
      runAsync({
        uid: user.userInfo.profile.userId,
        limit: 12,
        offset: (page - 1) * 12,
      });
    }
  }, [user?.userInfo?.profile?.userId, page]);

  return (
    <>
      <Typography.Title level={2}>我的关注</Typography.Title>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {data?.follow?.map(({ avatarUrl, nickname, userId }) => (
            <Col key={userId} md={{ span: 6 }} lg={{ span: 6 }} xl={{ span: 4 }} xxl={{ span: 4 }}>
              <Card bordered={false} hoverable className={styles.userCard}>
                <Avatar size={120} src={avatarUrl} icon={<AiOutlineUser />} />
                <Typography.Title level={5} ellipsis={{ tooltip: nickname }}>
                  {nickname}
                </Typography.Title>
              </Card>
            </Col>
          ))}
        </Row>
        <Pagination className={styles.pagination} current={page} pageSize={12} total={user?.userInfo?.profile?.follows} onChange={v => setPage(v)} />
      </Spin>
    </>
  );
};

export default MyFocus;
