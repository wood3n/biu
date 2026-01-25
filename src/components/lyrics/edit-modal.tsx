import { useState, useEffect, useCallback } from "react";

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, Tabs, Tab } from "@heroui/react";

interface LyricsEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  lyrics: string;
  translatedLyrics?: string;
  onSave: (lyrics: string, translatedLyrics?: string) => void;
}

const LyricsEditModal = ({ isOpen, onOpenChange, lyrics, translatedLyrics, onSave }: LyricsEditModalProps) => {
  const [originalLyrics, setOriginalLyrics] = useState("");
  const [translationLyrics, setTranslationLyrics] = useState("");
  const [activeTab, setActiveTab] = useState<"original" | "translation">("original");

  useEffect(() => {
    setOriginalLyrics(lyrics || "");
    setTranslationLyrics(translatedLyrics || "");
  }, [lyrics, translatedLyrics]);

  const handleSave = useCallback(() => {
    onSave(originalLyrics, translationLyrics);
    onOpenChange(false);
  }, [originalLyrics, translationLyrics, onSave, onOpenChange]);

  const handleCancel = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      scrollBehavior="inside"
      size="2xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">编辑歌词</ModalHeader>
            <ModalBody>
              <Tabs
                aria-label="歌词类型"
                selectedKey={activeTab}
                onSelectionChange={(key) => setActiveTab(key as "original" | "translation")}
              >
                <Tab key="original" title="原歌词">
                  <Textarea
                    label="原歌词"
                    labelPlacement="outside"
                    placeholder="请输入歌词，格式如：[00:12.34]这里是歌词内容"
                    value={originalLyrics}
                    onChange={(e) => setOriginalLyrics(e.target.value)}
                    minRows={10}
                    maxRows={20}
                    className="w-full"
                  />
                </Tab>
                <Tab key="translation" title="翻译歌词">
                  <Textarea
                    label="翻译歌词"
                    labelPlacement="outside"
                    placeholder="请输入翻译歌词，格式如：[00:12.34]这里是翻译内容"
                    value={translationLyrics}
                    onChange={(e) => setTranslationLyrics(e.target.value)}
                    minRows={10}
                    maxRows={20}
                    className="w-full"
                  />
                </Tab>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="light" onPress={handleCancel}>
                取消
              </Button>
              <Button color="primary" onPress={handleSave}>
                保存
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default LyricsEditModal;