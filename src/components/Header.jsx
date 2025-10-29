import React, { useState } from "react";
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
export default function Header({ onStart, onPause, onReset, onSave, onLoad, onClear, isRunning,
  setIsRunning, }) {
 
    const [open, setOpen] = React.useState(false);

  const handleToggle = () => {
    if (isRunning) {
      onPause();
    } else {
      onStart();
    }
    setIsRunning(!isRunning);
  };

   const actions = [
    { icon: <SaveIcon />, name: "Save", onClick: onSave },
    { icon: <FolderOpenIcon />, name: "Load", onClick: onLoad },
    { icon: <DeleteIcon />, name: "Clear", onClick: onClear },
  ];

  return (
    <AppBar position="static" sx={{ backgroundColor: "#2b2a33", paddingY: 1 }}>
      <Toolbar sx={{ flexDirection: "column", alignItems: "center" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Zenn Class Tracker
        </Typography>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            variant="contained"
            color={isRunning ? "warning" : "success"}
            onClick={handleToggle}
          >
            {isRunning ? "Pause" : "Start"}
          </Button>

          <Button variant="outlined" color="info" onClick={onReset}>
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
                bgcolor: "#1976d2",
                "&:hover": { bgcolor: "#1565c0" },
                boxShadow: "none",
                ml: 1,
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