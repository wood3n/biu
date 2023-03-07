import React, { useEffect, useState } from 'react';
import PageContainer from '@/components/PageContainer';
import { Spin } from 'antd';
import SongCard from '@/components/SongCard';
import { useRequest } from 'ahooks';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { getPersonalFM } from '@/service';
import type { Artist } from '@/service/personal-fm';
import './index.css';

interface Song {
  id?: number;
  name?: string;
  pic?: string;
  artists?: Artist[];
}

/**
 * 私人 FM
 */
const FM: React.FC = () => {
  const [fms, setfms] = useState<Song[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const { runAsync } = useRequest(getPersonalFM, {
    onSuccess: ({ data }) => {
      const existSongIds = fms.map((item) => item.id);
      setfms([...fms, ...data?.filter(({ id }) => !existSongIds.includes(id))?.map(({
        name, id, album, artists,
      }) => ({
        id,
        name,
        pic: album?.picUrl,
        artists,
      })) ?? []]);
    },
  });

  useEffect(() => {
    // 倒数第二个
    if (activeIndex >= fms.length - 2) {
      runAsync();
    }
  }, [activeIndex, fms.length]);

  return (
    <PageContainer>
      <Swiper
        effect="coverflow"
        grabCursor
        centeredSlides
        slidesPerView="auto"
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
        pagination={false}
        modules={[EffectCoverflow]}
        onActiveIndexChange={(swiper) => setActiveIndex(swiper.activeIndex)}
      >
        {fms.map(({
          id, name, pic, artists,
        }) => (
          <SwiperSlide key={`${id as number}_${name as string}`}>
            <SongCard
              id={id}
              name={name}
              pic={pic}
              imgWidth={250}
              imgHeight={250}
              arts={artists}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </PageContainer>
  );
};

export default FM;
