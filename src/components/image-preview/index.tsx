import { Modal, ModalContent } from "@heroui/react";

import { useModalStore } from "@/store/modal";

/**
 * 全局图片预览弹层：黑色遮罩 + 居中原图，点击任意位置或按 Esc 关闭
 */
const ImagePreview = () => {
  const imagePreviewData = useModalStore(s => s.imagePreviewData);
  const close = useModalStore(s => s.onCloseImagePreview);

  return (
    <Modal
      isOpen={Boolean(imagePreviewData)}
      onOpenChange={open => {
        if (!open) close();
      }}
      size="full"
      hideCloseButton
      classNames={{
        base: "bg-transparent shadow-none",
        backdrop: "bg-black/80",
      }}
      style={{ zIndex: 1200 }}
    >
      <ModalContent onClick={close}>
        <img
          src={imagePreviewData?.url}
          alt={imagePreviewData?.alt || "图片预览"}
          className="absolute top-1/2 left-1/2 max-h-[90vh] max-w-[95vw] -translate-x-1/2 -translate-y-1/2 object-contain"
        />
      </ModalContent>
    </Modal>
  );
};

export default ImagePreview;
