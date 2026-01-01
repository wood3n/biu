import clx from "classnames";

interface Props {
  className?: string;
  isCompact?: boolean;
}

const HistoryListHeader = ({ className, isCompact }: Props) => {
  const gridCols = isCompact ? "grid-cols-[40px_1fr_150px_150px_150px_40px]" : "grid-cols-[40px_1fr_150px_150px_40px]";

  return (
    <div
      className={clx(
        "text-default-500 border-default-100 grid w-full items-center gap-4 border-b text-sm",
        isCompact ? "h-8" : "h-10 px-2",
        gridCols,
        className,
      )}
    >
      <div className="text-center">#</div>
      <div className="text-left">标题</div>
      {isCompact && <div className="text-left">UP</div>}
      <div className="text-right">播放进度</div>
      <div className="text-right">观看时间</div>
      <div className="w-8" />
    </div>
  );
};

export default HistoryListHeader;
