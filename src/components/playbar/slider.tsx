import { useState } from "react";

import { Slider as HeroSlider, SliderProps } from "@heroui/react";

const Slider = (props: SliderProps) => {
  const [hovered, setHovered] = useState(false);

  return (
    <HeroSlider
      {...props}
      size="sm"
      hideThumb={false}
      disableAnimation
      disableThumbScale
      color={hovered ? "success" : "foreground"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      renderThumb={props =>
        hovered && (
          <div
            {...props}
            className="group top-1/2 cursor-grab rounded-full bg-background shadow-medium data-[dragging=true]:cursor-grabbing"
          >
            <span className="block h-4 w-4 rounded-full bg-white shadow-small" />
          </div>
        )
      }
      classNames={{
        track: "h-1.5",
      }}
    />
  );
};

export default Slider;
