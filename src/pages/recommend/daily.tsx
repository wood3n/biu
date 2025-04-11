import React from "react";
import { useNavigate } from "react-router-dom";

import moment from "moment";
import { Card, CardBody, CardHeader, Image as Img } from "@heroui/react";
import { RiCalendarEventLine } from "@remixicon/react";

interface Props {
  songs?: Song[];
  className?: string;
}

const Daily = ({ songs, className }: Props) => {
  const firstSong = songs?.[0];
  const navigate = useNavigate();

  return (
    <Card className={className}>
      <CardHeader className="items-center space-x-4">
        <RiCalendarEventLine />
        <h1 className="cursor-pointer hover:underline" onPointerDown={() => navigate("/daily")}>
          {moment().format("MM-DD")} 推荐
        </h1>
      </CardHeader>
      <CardBody className="flex space-x-6">
        <Card isHoverable isPressable shadow="none">
          <Img isZoomed src={firstSong?.al?.picUrl} width={240} height={240} />
        </Card>
      </CardBody>
    </Card>
  );
};

export default Daily;
