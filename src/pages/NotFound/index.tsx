import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterval } from 'ahooks';

/**
 * 路由不匹配处理
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(3);

  useInterval(() => setCount(count - 1), 1000);

  useEffect(() => {
    if (count === 0) {
      navigate('/');
    }
  }, [count]);

  return (
    <div>
      <h1>404</h1>
      <span>{count} 秒后回到主页...</span>
    </div>
  );
};

export default NotFound;
