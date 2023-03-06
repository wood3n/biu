import React, { useEffect, useState } from 'react';
import { Image, message, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { getLoginQrKey, getLoginQrCreate, getLoginQrCheck } from '@/service';
import { IMAGE_ERR } from '@/common/constants';
import { checkError } from '@/common/utils';
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
        run(key);
      }
    } catch (err) {
      checkError(err);
    }
  }

  const { run, cancel } = useRequest(getLoginQrCheck, {
    manual: true,
    pollingInterval: 3000,
    onSuccess: ({ code }) => {
      if (code === QRLoginCode.Success) {
        cancel();
        message.success('登录成功');
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

  useEffect(() => () => cancel(), [cancel]);

  return (
    <div className={styles.container}>
      {
        loading
          ? <Spin tip="生成二维码" />
          : (
            <Image
              preview={false}
              width="100%"
              height="100%"
              src={src}
            />
          )
      }
    </div>
  );
};

export default LoginByQr;
