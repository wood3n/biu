import React from 'react';
import { useParams } from 'react-router-dom';

const PlayList: React.FC = () => {
  const { id } = useParams();

  console.log(id);

  return <div>歌单</div>;
};

export default PlayList;
