import { useState } from "react";

import clx from "classnames";
import { Slider as HeroSlider, SliderProps } from "@heroui/react";

const Slider = ({ isDisabled, className, ...props }: SliderProps) => {
  const [hovered, setHovered] = useState(false);

  const showThumb = hovered && !isDisabled;

  return (
    <HeroSlider
      {...props}
      isDisabled={isDisabled}
      size="sm"
      disableAnimation
      disableThumbScale
      color={showThumb ? "success" : "foreground"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      renderThumb={thumbProps =>
        showThumb && (
          <div
            {...thumbProps}
            className="group top-1/2 cursor-grab rounded-full bg-background shadow-medium data-[dragging=true]:cursor-grabbing"
          >
            <span className="block h-4 w-4 rounded-full bg-white shadow-small" />
          </div>
        )
      }
      className={clx(
        {
          "cursor-pointer": !isDisabled,
          "cursor-default": isDisabled,
        },
        className,
      )}
      classNames={{
        track: "h-[4px]",
      }}
    />
  );
};

export default Slider;
