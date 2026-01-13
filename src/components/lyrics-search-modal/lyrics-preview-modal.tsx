import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Tab, Tabs } from "@heroui/react";

import ScrollContainer from "../scroll-container";

interface LyricsPreviewModalProps {
  isOpen: boolean;
  onOpenChange: Dispatch<SetStateAction<boolean>>;
  title?: string;
  lyrics?: string;
  tlyrics?: string;
  onAdopt: (lyricsText: string, tLyricsText?: string) => void;
  loading?: boolean;
}

const LyricsPreviewModal = ({
  isOpen,
  onOpenChange,
  title,
  lyrics,
  tlyrics,
  onAdopt,
  loading,
}: LyricsPreviewModalProps) => {
  const [activeTab, setActiveTab] = useState<"original" | "translation">("original");
  const hasLyrics = Boolean(lyrics?.trim() || tlyrics?.trim());
  const primaryLyrics = lyrics?.trim() || tlyrics?.trim() || "";

  useEffect(() => {
    setActiveTab("original");
  }, [isOpen, tlyrics]);

  const handleAdopt = () => {
    if (!hasLyrics) return;
    onAdopt(primaryLyrics, tlyrics);
  };

  return (
    <Modal disableAnimation isOpen={isOpen} onOpenChange={onOpenChange} placement="center" size="xl">
      <ModalContent>
        <ModalHeader>{title || "歌词预览"}</ModalHeader>
        <ModalBody className="px-0">
          {Boolean(tlyrics) && (
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={key => setActiveTab(key as "original" | "translation")}
              className="px-4"
            >
              <Tab key="original" title="原文歌词" />
              <Tab key="translation" title="翻译歌词" />
            </Tabs>
          )}
          <ScrollContainer className="px-4">
            <pre className="text-foreground/90 max-h-[420px] text-sm leading-relaxed break-words whitespace-pre-wrap">
              {activeTab === "original" ? lyrics || "暂无歌词" : tlyrics || "暂无歌词"}
            </pre>
          </ScrollContainer>
        </ModalBody>
        <ModalFooter className="justify-end gap-2">
          <Button variant="light" onPress={() => onOpenChange(false)}>
            关闭
          </Button>
          <Button color="primary" onPress={handleAdopt} isDisabled={loading || !hasLyrics}>
            采用歌词
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LyricsPreviewModal;
