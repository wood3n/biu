import { useState } from "react";

import { Button as HeroButton, type ButtonProps, type PressEvent } from "@heroui/react";

interface Props extends ButtonProps {
  onPress?: (e: PressEvent) => void | Promise<void>;
}

const Button = ({ ref, onPress, ...props }: Props & { ref?: React.RefObject<HTMLButtonElement | null> }) => {
  const [loading, setLoading] = useState(false);

  const handlePress = (e: PressEvent) => {
    const result = onPress?.(e);
    if (result instanceof Promise) {
      setLoading(true);
      result.finally(() => {
        setLoading(false);
      });
    }
  };

  return <HeroButton isLoading={loading} ref={ref} onPress={handlePress} {...props} />;
};

export default Button;
