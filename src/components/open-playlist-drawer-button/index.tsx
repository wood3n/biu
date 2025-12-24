import { Button } from "@heroui/react";
import { RiPlayListLine } from "@remixicon/react";

import { useModalStore } from "@/store/modal";

const OpenPlaylistDrawerButton = () => {
  const setOpen = useModalStore(s => s.setPlayListDrawerOpen);

  return (
    <Button isIconOnly size="sm" variant="light" className="hover:text-primary" onPress={() => setOpen(true)}>
      <RiPlayListLine size={18} />
    </Button>
  );
};

export default OpenPlaylistDrawerButton;
