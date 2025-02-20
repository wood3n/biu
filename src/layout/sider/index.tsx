import { useEffect, useState } from "react";
import { MdLibraryMusic, MdStarBorder } from "react-icons/md";
import { useLocation } from "react-router-dom";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Zoom from "@mui/material/Zoom";

import PlaylistMenu from "./playlist-menu";
import UserCard from "./user-card";
import UserCollection from "./user-collection";

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(() => ({
  borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
  "& .MuiToggleButtonGroup-grouped.Mui-selected": {
    backgroundColor: "transparent",
  },
}));

function Sider() {
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [tab, setTab] = useState("1");

  useEffect(() => {
    if (location.pathname) {
      setSelectedKeys([location.pathname]);
    }
  }, [location]);

  return (
    <Stack spacing={1} sx={{ height: "100%" }}>
      <Card>
        <UserCard />
      </Card>
      <Card
        sx={{
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <StyledToggleButtonGroup
          color="primary"
          size="small"
          value={tab}
          exclusive
          onChange={(_, key) => {
            if (key !== null) {
              setTab(key);
            }
          }}
          sx={{
            borderRadius: 0,
          }}
        >
          <ToggleButton value="1" sx={{ flex: 1, border: "none", borderRadius: 0 }}>
            <Stack direction="row" columnGap={1} alignItems="center">
              <MdLibraryMusic size={18} />
              歌单
            </Stack>
          </ToggleButton>
          <ToggleButton value="2" sx={{ flex: 1, border: "none", borderRadius: 0 }}>
            <Stack direction="row" columnGap={1} alignItems="center">
              <MdStarBorder size={18} />
              收藏
            </Stack>
          </ToggleButton>
        </StyledToggleButtonGroup>
        <Zoom in={tab === "1"}>
          <Box
            sx={{
              flex: "1 0 0",
              overflowY: "auto",
              display: tab === "1" ? "block" : "none",
            }}
          >
            <PlaylistMenu selectedKeys={selectedKeys} />
          </Box>
        </Zoom>
        <Zoom in={tab === "2"}>
          <Box
            sx={{
              flex: "1 0 0",
              overflowY: "auto",
              display: tab === "2" ? "block" : "none",
            }}
          >
            <UserCollection />
          </Box>
        </Zoom>
      </Card>
    </Stack>
  );
}

export default Sider;
