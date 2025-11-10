import React from "react";

import { Alert, Button, Pagination, Spinner } from "@heroui/react";
import { usePagination } from "ahooks";

import ScrollContainer from "@/components/scroll-container";
import { getRelationFollowings, type RelationListItem } from "@/service/relation-followings";
import { useUser } from "@/store/user";

import UserCard from "./user-card";

const PAGE_SIZE = 20;

const FollowList = () => {
  const { user } = useUser();

  const {
    data,
    loading,
    error,
    pagination,
    runAsync: getPage,
    refreshAsync,
  } = usePagination(
    async ({ current = 1, pageSize = PAGE_SIZE }) => {
      const res = await getRelationFollowings({ vmid: user?.mid as number, pn: current, ps: pageSize });
      if (res.code !== 0) {
        throw new Error(res.message || `加载失败: ${res.code}`);
      }
      return {
        total: res?.data?.total ?? 0,
        list: (res?.data?.list ?? []) as RelationListItem[],
      };
    },
    {
      ready: Boolean(user?.mid),
      defaultPageSize: PAGE_SIZE,
    },
  );

  const totalPage = pagination?.totalPage ?? 1;
  const current = pagination?.current ?? 1;

  return (
    <ScrollContainer className="h-full w-full">
      <div className="w-full p-4">
        <h1 className="mb-4">我的关注</h1>

        {loading && !data?.list && (
          <div className="flex h-[40vh] items-center justify-center">
            <Spinner label="加载中" />
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center space-y-3 py-10">
            <Alert color="danger" title="加载失败">
              出错了：{String(error.message)}
            </Alert>
            <Button color="primary" onPress={refreshAsync} isLoading={loading}>
              重试
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {data?.list?.map(u => (
              <UserCard key={u.mid} u={u} refresh={refreshAsync} />
            ))}
          </div>
        )}

        {!error && totalPage > 1 && (
          <div className="flex w-full items-center justify-center py-6">
            <Pagination
              initialPage={1}
              total={totalPage}
              page={current}
              onChange={next => getPage({ current: next, pageSize: PAGE_SIZE })}
            />
          </div>
        )}
      </div>
    </ScrollContainer>
  );
};

export default FollowList;
