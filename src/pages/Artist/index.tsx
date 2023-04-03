import { useRequest } from 'ahooks';
import { getArtistDetail } from '@/service';
import { useParams } from 'react-router-dom';
import PageContainer from '@/components/PageContainer';
import { Card } from 'antd';

const Artist = () => {
  const { id } = useParams();

  useRequest(() => getArtistDetail({
    id,
  }), {
    refreshDeps: [id],
  });

  return (
    <PageContainer>
      <Card bordered={false}>
        geshou
      </Card>
    </PageContainer>
  );
};

export default Artist;
