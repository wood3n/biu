import clx from "classnames";

import { getMusicListItemGrid } from "./styles";

interface Props {
  isCompact?: boolean;
  className?: string;
  hidePubTime?: boolean;
}

const MusicListHeader = ({ isCompact, className, hidePubTime }: Props) => {
  const gridCols = getMusicListItemGrid(isCompact, hidePubTime);

  return (
    <div
      className={clx(
        "text-default-500 border-default-100 grid w-full items-center gap-4 border-b text-sm",
        isCompact ? "h-8" : "h-10 px-2",
        gridCols,
        className,
      )}
    >
      <div className="min-w-8 text-center">#</div>
      <div className="text-left">标题</div>
      {isCompact && <div className="text-left">UP</div>}
      <div className="text-right">播放量</div>
      {!hidePubTime && <div className="text-right">投稿时间</div>}
      <div className="text-right">时长</div>
      <div className="w-8" />
    </div>
  );
};

export default MusicListHeader;
