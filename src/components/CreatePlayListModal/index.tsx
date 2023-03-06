import React from 'react';
import {
  Modal, Form, Input, Switch,
} from 'antd';
import { useRequest } from 'ahooks';
import { postPlaylistCreate } from '@/service';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  refreshMenu: () => void;
}

/**
 * 创建歌单
 */
const CreatePlayListModal: React.FC<Props> = ({
  open,
  onClose,
  refreshMenu,
}) => {
  const [form] = Form.useForm();

  const { loading, runAsync } = useRequest(postPlaylistCreate, {
    manual: true,
    onSuccess: ({ code, id }) => {
      if (code === 200 && id) {
        toast.success('创建成功');
        form.resetFields();
        onClose();
        refreshMenu();
      }
    },
  });

  return (
    <Modal
      title="新建歌单"
      open={open}
      onCancel={onClose}
      okButtonProps={{
        loading,
      }}
      okText="创建"
      cancelButtonProps={{
        style: {
          display: 'none',
        },
      }}
      onOk={() => {
        form.validateFields().then(({ name, type }) => {
          runAsync({
            name,
            type,
          });
        });
      }}
    >
      <Form form={form}>
        <Form.Item name="name" label="歌单名" rules={[{ required: true }]}>
          <Input placeholder="歌单名称" />
        </Form.Item>
        <Form.Item name="type" label="隐私歌单" valuePropName="checked">
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CreatePlayListModal;
