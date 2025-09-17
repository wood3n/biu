import { usePlayingQueue } from "@/store/playing-queue";

import Center from "./center";
import Left from "./left";
import Right from "./right";

/**
 * 播放任务栏
 */
function PlayBar() {
  const { current } = usePlayingQueue();

  return (
    <div className="grid h-full grid-cols-[minmax(0,1fr)_minmax(0,3fr)_minmax(0,1fr)] space-x-6 px-6">
      <div className="h-full">{Boolean(current?.title) && <Left />}</div>
      <Center />
      <Right />
    </div>
  );
}

export default PlayBar;
