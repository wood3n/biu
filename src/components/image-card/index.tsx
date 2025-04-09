import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import clx from "classnames";
import ColorThief from "colorthief";
import { Image as Img, User } from "@heroui/react";

import Ellipsis from "../ellipsis";
import If from "../if";

interface UserInfo {
  userId?: number;
  name?: string;
  avatarUrl?: string;
  link?: string;
}

interface Props {
  coverImageUrl?: string;
  title?: string;
  count?: number;
  description?: React.ReactNode;
  user?: UserInfo;
  onLoadColor?: (color: [number, number, number]) => void;
  className?: string;
}

const ImageCard = ({ coverImageUrl, title, count, description, user, onLoadColor, className }: Props) => {
  const colorThief = useRef(new ColorThief());
  const [palette, setPalette] = useState<[number, number, number] | null>(null);
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(${palette?.join(",")},20%) 0 10%, #18181b 40% 100%)`,
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className={clx("flex space-x-6 p-6", className)}>
        <div className="h-60 w-60 flex-none">
          <Img
            src={`${coverImageUrl}?param=960y960`}
            crossOrigin="anonymous"
            width="100%"
            height="100%"
            onLoad={e => {
              if (e.currentTarget.complete) {
                const color = colorThief.current.getColor(e.currentTarget);
                if (color) {
                  setPalette(color);
                  onLoadColor?.(color);
                }
              }
            }}
          />
        </div>
        <div className="flex flex-grow flex-col justify-between">
          <div className="flex flex-col items-start space-y-4">
            <span className="text-4xl font-bold">{title}</span>
            <If condition={Boolean(count)}>
              <span className="text-base opacity-60 mix-blend-darken">{count} 首歌曲</span>
            </If>
            <If condition={Boolean(user)}>
              <User
                avatarProps={{
                  src: `${user?.avatarUrl}?param=90y90`,
                }}
                name={user?.name}
                className="cursor-pointer hover:text-green-500"
                onPointerDown={() => user?.link && navigate(user?.link)}
              />
            </If>
            <Ellipsis>{description}</Ellipsis>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
