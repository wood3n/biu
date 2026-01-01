import React, { useEffect, useRef, useState } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@heroui/react";

import { postVuWebCoverUp } from "@/service/vu-web-cover-up";

import "./index.css";

interface Props {
  src: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (url: string) => void;
}

const CropModal = ({ src, isOpen, onClose, onUploaded }: Props) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isOpen || !src) return;
    setError(null);
    setCrop({
      unit: "%",
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });
    setCompletedCrop(null);
  }, [isOpen, src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    imageRef.current = e.currentTarget;
  };

  const getCroppedDataUrl = async (image: HTMLImageElement, cropRect: PixelCrop) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = cropRect.width * scaleX * pixelRatio;
    canvas.height = cropRect.height * scaleY * pixelRatio;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("无法获取画布上下文");
    }

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      cropRect.x * scaleX,
      cropRect.y * scaleY,
      cropRect.width * scaleX,
      cropRect.height * scaleY,
      0,
      0,
      cropRect.width * scaleX,
      cropRect.height * scaleY,
    );

    return canvas.toDataURL("image/jpeg", 0.9);
  };

  const handleUpload = async () => {
    if (!src || !imageRef.current || !completedCrop || completedCrop.width === 0 || completedCrop.height === 0) {
      return;
    }

    try {
      setIsUploading(true);
      setError(null);

      const dataUrl = await getCroppedDataUrl(imageRef.current, completedCrop);
      const ts = Date.now();
      const res = await postVuWebCoverUp({ cover: dataUrl, ts });

      if (res.code !== 0 || !res.data?.url) {
        setError(res.message || "上传失败");
        return;
      }

      onUploaded(res.data.url);
    } catch {
      setError("上传失败，请稍后重试");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      radius="md"
      size="md"
      scrollBehavior="inside"
      isOpen={isOpen && Boolean(src)}
      onOpenChange={open => {
        if (!open && !isUploading) {
          onClose();
        }
      }}
      isDismissable={!isUploading}
      disableAnimation
    >
      <ModalContent>
        <ModalHeader className="py-3">裁剪封面</ModalHeader>
        <ModalBody className="gap-4">
          {src && (
            <div className="flex items-center justify-center" style={{ width: 322, height: 202 }}>
              <ReactCrop
                crop={crop}
                aspect={1}
                onChange={(_, percentCrop) => {
                  setCrop(percentCrop);
                }}
                onComplete={pixelCrop => {
                  setCompletedCrop(pixelCrop);
                }}
                className="h-full w-full"
              >
                <img src={src} alt="裁剪" onLoad={handleImageLoad} className="h-full w-full object-contain" />
              </ReactCrop>
            </div>
          )}
          {error && <span className="text-tiny text-danger">{error}</span>}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose} isDisabled={isUploading}>
            取消
          </Button>
          <Button isLoading={isUploading} color="primary" onPress={handleUpload}>
            上传
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CropModal;
