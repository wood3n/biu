import log from "electron-log/renderer";
import moment from "moment";

import { postClickInterfaceClickWebH5 } from "@/service/click-interface-click-web-h5";
import { postClickInterfaceWebHeartbeat } from "@/service/click-interface-web-heartbeat";
import { useSettings } from "@/store/settings";
import { useUser } from "@/store/user";

const HEARTBEAT_INTERVAL_SECONDS = 30;

interface ReportablePlayItem {
  id?: string;
  type?: "mv" | "audio";
  aid?: number | string;
  bvid?: string;
  cid?: number | string;
  duration?: number;
  pageIndex?: number;
}

interface PlayReportSession {
  session: string;
  startTs: number; // seconds
  aid: number;
  bvid?: string;
  cid?: number;
  maxPlayedTime: number; // seconds
  lastReportAt: number; // seconds
  playId?: string;
}

let currentSession: PlayReportSession | null = null;

const normalizeNumber = (value?: number | string): number | undefined => {
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const isSameVideo = (item?: ReportablePlayItem) => {
  if (!currentSession || !item) return false;
  const aid = normalizeNumber(item.aid);
  const cid = normalizeNumber(item.cid);
  return (
    item.type === "mv" &&
    aid === currentSession.aid &&
    (cid === undefined || cid === currentSession.cid) &&
    (!item.bvid || item.bvid === currentSession.bvid)
  );
};

const generateSessionId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }
  return "";
};

const checkReportingEnabled = () => {
  const { reportPlayHistory } = useSettings.getState();
  if (!reportPlayHistory) {
    currentSession = null;
    return false;
  }
  return true;
};

/**
 * 开始上报：调用 click/web/h5 接口，建立心跳会话。
 */
export async function beginPlayReport(item?: ReportablePlayItem) {
  if (!checkReportingEnabled()) {
    return;
  }

  const aid = normalizeNumber(item?.aid);
  const cid = normalizeNumber(item?.cid);

  if (!item || item.type !== "mv" || aid === undefined) {
    currentSession = null;
    return;
  }

  const session = generateSessionId();
  const startTs = moment().unix();

  currentSession = {
    session,
    startTs,
    aid,
    bvid: item.bvid,
    cid,
    maxPlayedTime: 0,
    lastReportAt: 0,
    playId: item.id,
  };

  try {
    await postClickInterfaceClickWebH5(
      {
        mid: useUser.getState().user?.mid,
        lv: useUser.getState().user?.level_info?.current_level,
        aid,
        cid,
        type: 3,
        sub_type: 0,
        part: item.pageIndex,
        ftime: startTs,
        stime: startTs,
        session,
        referer_url: `https://www.bilibili.com/video/${item.bvid}`,
        outer: 0,
        platform: "web",
      },
      {
        w_aid: aid,
        w_part: item.pageIndex,
        w_type: 3,
        w_ftime: startTs,
        w_stime: startTs,
        web_location: 1315873,
      },
    );
  } catch (error) {
    log.warn("[play-report] start report failed", error);
  }
}

/**
 * 周期性心跳上报。
 * playType：0 播放中 / 1 开始播放 / 2 暂停 / 3 继续播放 / 4 结束播放
 */
export async function reportHeartbeat(
  item?: ReportablePlayItem,
  playedTime?: number,
  duration?: number,
  playType: number = 0,
) {
  if (!checkReportingEnabled()) {
    return;
  }

  if (!currentSession && item && item.type === "mv") {
    await beginPlayReport(item);
  }

  if (!currentSession || !isSameVideo(item)) return;

  const played = Math.max(0, Math.floor(playedTime ?? 0));
  currentSession.maxPlayedTime = Math.max(currentSession.maxPlayedTime, played);
  const normalizedDuration = Number.isFinite(duration) ? Math.floor(duration as number) : undefined;

  const now = moment().unix();
  const shouldForceSend = playType !== 0;
  if (!shouldForceSend && now - currentSession.lastReportAt < HEARTBEAT_INTERVAL_SECONDS) {
    return;
  }

  currentSession.lastReportAt = now;

  try {
    await postClickInterfaceWebHeartbeat(
      {
        aid: currentSession.aid,
        bvid: currentSession.bvid,
        cid: currentSession.cid,
        played_time: played,
        realtime: played,
        real_played_time: played,
        video_duration: normalizedDuration,
        last_play_progress_time: currentSession.maxPlayedTime,
        max_play_progress_time: currentSession.maxPlayedTime,
        start_ts: currentSession.startTs,
        dt: 2,
        outer: 0,
        play_type: playType,
        session: currentSession.session,
      },
      {
        w_start_ts: currentSession.startTs,
        w_mid: useUser.getState().user?.mid,
        w_aid: currentSession.aid,
        w_dt: 2,
        w_realtime: played,
        w_playedtime: played,
        w_real_played_time: played,
        w_video_duration: normalizedDuration,
        w_last_play_progress_time: currentSession.maxPlayedTime,
        web_location: 1315873,
      },
    );
  } catch (error) {
    log.warn("[play-report] heartbeat failed", error);
  }
}

export function endPlayReport() {
  currentSession = null;
}
