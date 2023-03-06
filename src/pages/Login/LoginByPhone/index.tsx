import React, { useState, useRef, useEffect } from 'react';
import {
  Form, Input, Button, Space, message,
} from 'antd';
import { useRequest } from 'ahooks';
import { getCaptchaSent } from '@/service';
import { checkPhone, validatePhone, validateCaptcha } from '@/common/utils';
import { ReactComponent as Phone } from '@/assets/images/phone.svg';
import { ReactComponent as Captcha } from '@/assets/images/captcha.svg';

const LoginByPhone: React.FC = () => {
  const [form] = Form.useForm();
  const [count, setCount] = useState(0);
  const timer = useRef<number>();

  const reqSendCaptcha = useRequest(getCaptchaSent, { manual: true });

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
        setCount((oldCount) => oldCount - 1);
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
    form.validateFields().then(async () => {
      // loginByPhone({
      //   phone,
      //   captcha
      // });
    });
  };

  return (
    <Form form={form}>
      <Form.Item name="phone" rules={[{ validator: validatePhone }]}>
        <Input size="large" placeholder="手机号码" prefix={<Phone width={16} height={16} />} />
      </Form.Item>
      <Form.Item
        name="captcha"
        rules={[
          {
            validator: validateCaptcha,
          },
        ]}
      >
        <Space>
          <Input
            size="large"
            placeholder="验证码"
            prefix={<Captcha width={16} height={16} />}
          />
          <Button
            size="large"
            onClick={handleSendCaptcha}
            disabled={count > 0}
            loading={reqSendCaptcha.loading}
          >
            {count > 0 ? count : '发送验证码'}
          </Button>
        </Space>
      </Form.Item>
      <Form.Item>
        <Button
          size="large"
          type="primary"
          style={{ width: '100%' }}
          onClick={handleSubmit}
        >
          登录
        </Button>
      </Form.Item>
      {form && <div />}
    </Form>
  );
};

export default LoginByPhone;
