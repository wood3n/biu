import React, { useEffect, useRef, useState } from 'react';
import { Row, Col, Form, Input, Button, Space, message } from 'antd';
import WindowAction from '@/components/WindowAction';
import { useRequest } from 'ahooks';
import { sendCaptcha, login } from '@/service/api';
import { checkPhone, validatePhone, validateCaptcha } from '@/common/utils';
import { ReactComponent as Phone } from '@/assets/images/phone.svg';
import { ReactComponent as Captcha } from '@/assets/images/captcha.svg';
import { ReactComponent as Music } from '@/assets/images/Music.svg';
import styles from './index.module.less';

const Login: React.FC = () => {
  const [form] = Form.useForm<API.PhoneLoginData>();
  const timer = useRef<number>();
  const [count, setCount] = useState(0);

  const reqSendCaptcha = useRequest(sendCaptcha, { manual: true });

  const reqLogin = useRequest(login, { manual: true });

  const updateCount = () => setCount(count => count - 1);

  const handleSendCaptcha = async () => {
    const { phone } = form.getFieldsValue();
    if (!checkPhone(phone)) {
      message.error('请输入正确的手机号');
      return;
    }
    const { data } = await reqSendCaptcha.runAsync(phone);
    if (data) {
      setCount(59);
      timer.current = window.setInterval(() => {
        updateCount();
      }, 1000);
    } else {
      message.error('发送验证码失败');
    }
  };

  useEffect(() => {
    if (count <= 0) {
      window.clearInterval(timer.current);
    }
    return () => window.clearInterval(timer.current);
  }, [count]);

  const handleSubmit = () => {
    form.validateFields().then(async ({ phone, captcha }) => {
      const res = await reqLogin.runAsync({
        phone,
        captcha
      });

      console.log(res);
    });
  };

  return (
    <Row className={styles.login}>
      <Col span={16} className={styles.loginSider} />
      <Col span={8}>
        <div className={styles.winAction}>
          <WindowAction />
        </div>
        <div className={styles.loginForm}>
          <Form form={form}>
            <div className={styles.logo}>
              <span><Music width={48} height={48} /></span>
            </div>
            <Form.Item name='phone' rules={[{ validator: validatePhone }]}>
              <Input size='large' placeholder='手机号码' prefix={<Phone width={16} height={16} />}/>
            </Form.Item>
            <Form.Item
              name='captcha'
              rules={[
                {
                  validator: validateCaptcha,
                }
              ]}
            >
              <Space>
                <Input
                  size='large'
                  placeholder='验证码'
                  prefix={<Captcha width={16} height={16} />}
                />
                <Button
                  size='large'
                  onClick={handleSendCaptcha}
                  disabled={count > 0}
                  loading={reqSendCaptcha.loading}
                >
                  {
                    count > 0 ? count : '发送验证码'
                  }
                </Button>
              </Space>
            </Form.Item>
            <Form.Item>
              <Button
                size='large'
                type='primary'
                style={{ width: '100%' }}
                onClick={handleSubmit}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Col>
    </Row>
  );
};

export default Login;
