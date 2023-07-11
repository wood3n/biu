import moment from 'moment';
import momentDurationFormatSetup from 'moment-duration-format';

// @ts-ignore
momentDurationFormatSetup(moment);

export const formatDuration = (s: number, milliseconds = true, format = 'mm:ss') => moment.duration(s, milliseconds ? 'milliseconds' : 'seconds').format(format, { trim: false });

export const formatMillisecond = (s?: number) => (s ? moment(s).format('YYYY-MM-DD') : '');
