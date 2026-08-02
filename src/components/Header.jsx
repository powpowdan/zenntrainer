import React from "react";
import {
  Button,
  Stack,
  Typography,
  AppBar,
  Toolbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

export default function Header({
  onStart,
  onPause,
  onReset,
  onSave,
  onLoad,
  onClear,
  isRunning,
}) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
  };

  const actions = [
    { icon: <SaveIcon />, name: "Save", onClick: onSave },
    { icon: <FolderOpenIcon />, name: "Load", onClick: onLoad },
    { icon: <DeleteIcon />, name: "Clear", onClick: onClear },
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        backgroundColor: "rgba(5, 6, 10, 0.95)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Toolbar
        sx={{
          width: "100%",
          maxWidth: 960,
          mx: "auto",
          py: 1,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <div>
          <Typography
            variant="h6"
            sx={{
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: 0.4,
            }}
          >
            Zenn Class Tracker
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "var(--text-muted)", fontSize: 12 }}
          >
            Plan and run Muay Thai sessions
          </Typography>
        </div>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            onClick={handleToggle}
            sx={{
              borderRadius: 999,
              px: 2.5,
              py: 0.75,
              fontWeight: 600,
              textTransform: "none",
              fontSize: 14,
              backgroundColor: isRunning
                ? "#f97316"
                : "var(--accent-success)",
              "&:hover": {
                backgroundColor: isRunning ? "#ea580c" : "#16a34a",
              },
            }}
          >
            {isRunning ? "Pause" : "Start"}
          </Button>

          <Button
            variant="outlined"
            onClick={onReset}
            sx={{
              borderRadius: 999,
              textTransform: "none",
              fontSize: 13,
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
              "&:hover": {
                borderColor: "var(--accent-primary)",
                backgroundColor: "rgba(15,23,42,0.6)",
              },
            }}
          >
            Reset
          </Button>

          <SpeedDial
            ariaLabel="Save actions"
            icon={
              <SpeedDialIcon
                icon={<MenuIcon />}
                openIcon={<CloseIcon />}
              />
            }
            direction="left"
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            FabProps={{
              size: "small",
              sx: {
                bgcolor: "#111827",
                color: "var(--text-secondary)",
                "&:hover": { bgcolor: "#020617" },
                boxShadow: "none",
                ml: 0.5,
              },
            }}
          >
            {actions.map((action) => (
              <SpeedDialAction
                key={action.name}
                icon={action.icon}
                tooltipTitle={action.name}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
              />
            ))}
          </SpeedDial>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
