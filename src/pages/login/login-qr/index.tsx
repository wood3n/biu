import React, { useEffect, useState } from 'react';
import Image from '@components/image';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { getLoginQrKey, getLoginQrCreate, getLoginQrCheck } from '@/service';
import { IMAGE_ERR } from '@/common/constants';
import { useRequest } from 'ahooks';
import { QRLoginCode } from '../constants';
import styles from './index.module.less';

const LoginByQr: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [src, setSrc] = useState<string>();

  const createQr = async () => {
    setLoading(true);
    try {
      const { data } = await getLoginQrKey();
      const { data: qrData } = await getLoginQrCreate({
        key: data.unikey,
        qrimg: true,
      });
      setSrc(qrData.qrimg);
      return data.unikey;
    } catch (err) {
      setSrc(IMAGE_ERR);
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  async function checkLogin() {
    try {
      const key = await createQr();
      if (key) {
        runAsync({ key });
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else if (typeof err === 'string') {
        toast.error(err);
      }
    }
  }

  const { runAsync, cancel } = useRequest(getLoginQrCheck, {
    manual: true,
    pollingInterval: 3000,
    onSuccess: ({ code }) => {
      if (code === QRLoginCode.Success) {
        cancel();
        toast.success('登录成功');
        navigate('/', { replace: true });
      }

      if (code === QRLoginCode.Timeout) {
        cancel();
        checkLogin();
      }
    },
  });

  useEffect(() => {
    checkLogin();
  }, []);

  useEffect(() => cancel, [cancel]);

  return (
    <div className={styles.container}>
      <Image
        width={120}
        height={120}
        src={src}
      />
    </div>
  );
};

export default LoginByQr;
