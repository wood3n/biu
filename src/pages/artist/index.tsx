import { useRequest } from 'ahooks';
import { getArtistDetail } from '@/service';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';

const Artist = () => {
  const { id } = useParams();

  useRequest(() => getArtistDetail({
    id,
  }), {
    refreshDeps: [id],
  });

  return (
    <PageContainer>
      geshou
    </PageContainer>
  );
};

export default Artist;
