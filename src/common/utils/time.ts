import moment from 'moment';

export const formatDuration = (s: number, format = 'mm:ss') => moment.utc(moment.duration(s).as('milliseconds')).format(format);

export const formatMillisecond = (s?: number) => (s ? moment(s).format('YYYY-MM-DD') : '');
