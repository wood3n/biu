import { useState } from "react";
import { MdHistory, MdModeEdit, MdOutlineWbCloudy, MdRadio, MdRecommend } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";

import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

import TooltipButton from "@/components/tooltip-button";
import useUser from "@/store/user-atom";

import "./index.less";

function UserCard() {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [user] = useUser();
  const [hoverd, setHovered] = useState(false);

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${user?.userInfo?.profile?.backgroundUrl})`,
          height: "140px",
          width: "100%",
          display: "block",
          backgroundPosition: "center top",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
        }}
      />
      <div className="user-card-content">
        <div className="user-avatar" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <Badge
            color="primary"
            invisible={!hoverd}
            overlap="circular"
            badgeContent={
              <TooltipButton title="修改资料" placement="top" arrow>
                <MdModeEdit size={16} />
              </TooltipButton>
            }
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
          >
            <Avatar
              src={user?.userInfo?.profile?.avatarUrl}
              sx={{
                width: 100,
                height: 100,
              }}
            />
          </Badge>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography>{user?.userInfo?.profile?.nickname}</Typography>
            {user?.userInfo?.level && <Chip size="small" label={`Lv${user?.userInfo?.level}`} />}
          </Stack>
          {Boolean(user?.userInfo?.profile?.vipType) && <Chip size="small" label="vip" />}
        </div>
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          divider={
            <Divider
              variant="inset"
              orientation="vertical"
              flexItem
              sx={{
                alignSelf: "center",
                height: "18px",
              }}
            />
          }
        >
          {[
            {
              label: "每日推荐",
              icon: (color?: string) => <MdRecommend size={22} color={color} />,
              key: "/",
            },
            {
              label: "私人FM",
              icon: (color?: string) => <MdRadio size={22} color={color} />,
              key: "/fm",
            },
            {
              label: "云盘",
              icon: (color?: string) => <MdOutlineWbCloudy size={22} color={color} />,
              key: "/drive",
            },
            {
              label: "播放历史",
              icon: (color?: string) => <MdHistory size={22} color={color} />,
              key: "/history",
            },
          ].map(({ label, icon, key }) => (
            <TooltipButton key={key} title={label} placement="top" onClick={() => navigate(key)}>
              {icon(location.pathname === key ? theme.palette.primary.main : undefined)}
            </TooltipButton>
          ))}
        </Stack>
      </div>
    </>
  );
}

export default UserCard;
