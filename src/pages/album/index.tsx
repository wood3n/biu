import { useNavigate, useParams } from "react-router-dom";

import { useRequest } from "ahooks";
import { Image, User } from "@heroui/react";
import { RiPlayCircleLine, RiStarFill, RiStarLine } from "@remixicon/react";

import AsyncButton from "@/components/async-button";
import Table from "@/components/table";
import { getAlbum, getAlbumSub } from "@/service";
import { usePlayingQueue } from "@/store/playing-queue";
import { useFavoriteAlbums } from "@/store/user-favorite-album";

import { columns } from "./columns";

function Album() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentSong, playList, play } = usePlayingQueue();
  const userSubscribeAlbums = useFavoriteAlbums(store => store.albums);

  const { data: response, loading } = useRequest(() => getAlbum({ id: String(id) }), {
    refreshDeps: [id],
  });

  const isSubed = userSubscribeAlbums?.find(album => album?.id === response?.album?.id);

  const subscribe = async () => {
    await getAlbumSub({
      id,
      t: isSubed ? 2 : 1,
    });
  };

  return (
    <div className="p-4">
      <div className="mb-6 flex space-x-6">
        <div className="flex-none">
          <Image src={response?.album?.picUrl} width={232} height={232} radius="sm" />
        </div>
        <div className="flex flex-grow flex-col justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{response?.album?.name}</span>
            <span className="text-base text-zinc-500">{response?.album?.size} 首歌曲</span>
            <User
              avatarProps={{
                size: "sm",
                src: response?.album?.artist?.picUrl,
              }}
              name={response?.album?.artist?.name}
              className={"cursor-pointer hover:text-green-500"}
              onPointerDown={() => navigate(`/artist/${response?.album?.artist?.id}`)}
            />
          </div>
          {Boolean(response?.songs?.length) && (
            <div className="flex items-center space-x-4">
              <AsyncButton color="success" startContent={<RiPlayCircleLine size={16} />} onPress={() => playList(response!.songs!)}>
                播放
              </AsyncButton>
              <AsyncButton onPress={subscribe} color="default" startContent={isSubed ? <RiStarFill size={16} /> : <RiStarLine size={16} />}>
                {isSubed ? "取消收藏" : "收藏"}
              </AsyncButton>
            </div>
          )}
        </div>
      </div>
      <Table
        rowKey="id"
        selectedRowKeys={currentSong ? [currentSong?.id] : undefined}
        loading={loading}
        data={response?.songs}
        columns={columns}
        onDoubleClick={song => play(song, response?.songs)}
      />
    </div>
  );
}

export default Album;
