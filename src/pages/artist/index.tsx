import { useParams } from "react-router-dom";

import { useRequest } from "ahooks";

import PageContainer from "@/components/PageContainer";
import { getArtistDetail } from "@/service";

function Artist() {
  const { id } = useParams();

  useRequest(
    () =>
      getArtistDetail({
        id,
      }),
    {
      refreshDeps: [id],
    },
  );

  return <PageContainer>geshou</PageContainer>;
}

export default Artist;
