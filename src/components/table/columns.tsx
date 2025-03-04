import { RiPulseFill } from "@remixicon/react";

export const indexColumn = {
  title: "#",
  key: "index",
  align: "center",
  className: "text-zinc-400 text-sm",
  render: ({ index, isSelected }) => (isSelected ? <RiPulseFill className="text-green-500" /> : index + 1),
};
