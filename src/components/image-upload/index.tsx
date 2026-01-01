import React, { useEffect, useRef, useState } from "react";

import { Image as HeroImage } from "@heroui/react";
import { RiEdit2Line } from "@remixicon/react";
import { twMerge } from "tailwind-merge";

import CropModal from "./crop-modal";

export interface ImageUploadProps {
  value?: string;
  onChange?: (value?: string) => void;
  disabled?: boolean;
  accept?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled,
  accept = "image/*",
  width = 128,
  height = 128,
  className,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(value);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!value) {
      setPreviewUrl(undefined);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      return;
    }

    if (!value.startsWith("blob:")) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    }

    setPreviewUrl(value);
  }, [value]);

  useEffect(
    () => () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    },
    [],
  );

  const handleSelectClick = () => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = event => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError(null);

    if (!file.type.startsWith("image/") || !["image/jpeg", "image/png"].includes(file.type)) {
      setError("仅支持 jpeg 或 png 格式的图片");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("图片大小需小于等于 5MB");
      event.target.value = "";
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;

    setCropImageSrc(objectUrl);
    setIsModalOpen(true);

    event.target.value = "";
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setCropImageSrc(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const handleUploaded = (url: string) => {
    setPreviewUrl(url);
    onChange?.(url);
    setIsModalOpen(false);
    setCropImageSrc(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  return (
    <div className={twMerge("flex flex-col items-start gap-3", className)}>
      <div className="flex flex-col gap-2">
        <div
          className={twMerge(
            "border-default-300 rounded-medium bg-default-100 group relative flex items-center justify-center border border-dashed",
            previewUrl ? "" : "text-default-400",
          )}
          style={{ width, height }}
          onClick={disabled ? undefined : handleSelectClick}
        >
          {previewUrl ? (
            <HeroImage
              src={previewUrl}
              width={width}
              height={height}
              className="h-full w-full rounded-md object-cover"
            />
          ) : (
            <span className="text-sm">点击上传图片</span>
          )}
          {previewUrl && !disabled && (
            <div className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-md bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex flex-col items-center gap-2">
                <RiEdit2Line size={28} />
                <span className="text-sm">选择照片</span>
              </div>
            </div>
          )}
        </div>
        <span className="text-tiny text-default-400">建议上传高清封面≥960×600，jpeg或png格式，图片≤5MB</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={false}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />

      <CropModal src={cropImageSrc} isOpen={isModalOpen} onClose={handleModalClose} onUploaded={handleUploaded} />

      {error && <span className="text-tiny text-danger">{error}</span>}
    </div>
  );
};

export default ImageUpload;
