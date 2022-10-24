import { MenuItem } from '@/components/Menu';
import { ReactComponent as Daily } from '@/assets/icons/daily.svg';
import { ReactComponent as FM } from '@/assets/icons/fm.svg';
import { ReactComponent as Aim } from '@/assets/icons/aiming.svg';
import { ReactComponent as Like } from '@/assets/icons/like.svg';
import { ReactComponent as History } from '@/assets/icons/history.svg';

export default [
  {
    title: '每日推荐',
    icon: <Daily />,
    path: '/daily'
  },
  {
    title: '私人 FM',
    icon: <FM />,
    path: '/fm'
  },
  {
    title: '专属定制',
    icon: <Aim />,
    path: '/personal'
  },
  {
    title: '收藏',
    key: '/collection',
    children: [
      {
        title: '我喜欢的',
        icon: <Like />,
        path: '/mylove'
      },
      {
        title : '最近播放',
        icon: <History />,
        path: '/recent'
      }
    ]
  }
] as MenuItem[];