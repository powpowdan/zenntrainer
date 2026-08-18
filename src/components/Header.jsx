import {
  Box,
  Button,
  Stack,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

export default function Header({
  onStart,
  onPause,
  onResume,
  onReset,
  onExit,
  onRetry,
  onOpenLibrary,
  className,
  isRunning,
  isLiveMode,
  taskCount,
  totalDuration,
  canStart,
  persistenceStatus,
  persistenceError,
}) {
  const handleToggle = () => {
    if (isRunning) {
      onPause();
    } else if (isLiveMode) {
      onResume();
    } else {
      onStart();
    }
  };

  const totalMinutes = Math.round((totalDuration || 0) / 60);
  const statusLabel = {
    saved: "Saved",
    saving: "Saving...",
    unsaved: "Unsaved changes",
    error: "Save failed",
  }[persistenceStatus] || "Saved";

  return (
    <AppBar position="static" elevation={0}>
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
        <div style={{ minWidth: 0, width: "100%" }}>
          <Typography variant="h6" sx={{ fontSize: 18, fontWeight: 600, letterSpacing: 0.4 }}>
            Cadence<Box component="span" sx={{ color: "var(--accent)" }}>.</Box>
          </Typography>
          <Button
            onClick={onOpenLibrary}
            aria-label={`Open class library. Current class: ${className || "none"}`}
            endIcon={<ArrowDropDownIcon />}
            sx={{
              mt: 0.5,
              maxWidth: "100%",
              justifyContent: "space-between",
              px: 1.5,
              py: 0.25,
              minHeight: 30,
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontSize: 14,
              fontWeight: 600,
              backgroundColor: "var(--surface)",
              "& .MuiButton-endIcon": { ml: 0.5, mr: -0.5 },
              "&:hover": {
                backgroundColor: "var(--elevated)",
                borderColor: "var(--border-strong)",
              },
            }}
          >
            <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {className || "Choose a class"}
            </Box>
          </Button>
          <Typography
            variant="body2"
            sx={{
              color: "var(--text-secondary)",
              fontSize: 12,
              mt: 0.5,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {taskCount} {taskCount === 1 ? "block" : "blocks"} · {totalMinutes} min planned
          </Typography>
          <Typography
            variant="body2"
            role="status"
            sx={{
              color: persistenceStatus === "error"
                ? "var(--accent)"
                : persistenceStatus === "unsaved"
                  ? "var(--text-primary)"
                  : "var(--text-muted)",
              fontSize: 12,
              mt: 0.5,
            }}
          >
            {statusLabel}
            {persistenceError ? `: ${persistenceError}` : ""}
            {persistenceStatus === "error" ? (
              <Button
                onClick={onRetry}
                size="small"
                sx={{
                  minWidth: 0,
                  ml: 1,
                  p: 0,
                  color: "var(--accent)",
                  textTransform: "none",
                  textDecoration: "underline",
                }}
              >
                Retry
              </Button>
            ) : null}
          </Typography>
        </div>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap"
          width="100%"
          justifyContent={{ xs: "flex-start", sm: "flex-end" }}
        >
          <Button
            variant="contained"
            onClick={handleToggle}
            disabled={!isRunning && !canStart}
            sx={{
              borderRadius: "var(--radius-pill)",
              px: 2.5,
              py: 0.75,
              fontSize: 14,
              ...(isRunning
                ? {
                    backgroundColor: "var(--accent)",
                    color: "var(--on-accent)",
                    "&:hover": { backgroundColor: "var(--accent-hover)" },
                  }
                : {
                    backgroundColor: "var(--text-primary)",
                    color: "var(--app)",
                    "&:hover": {
                      backgroundColor: "var(--text-primary)",
                      opacity: 0.88,
                    },
                  }),
            }}
          >
            {isRunning ? "Pause" : isLiveMode ? "Resume" : "Start"}
          </Button>

          <Button
            variant="outlined"
            onClick={onReset}
            sx={{
              borderRadius: "var(--radius-pill)",
              fontSize: 13,
              borderColor: "var(--border-subtle)",
              color: "var(--text-secondary)",
              "&:hover": {
                borderColor: "var(--accent)",
                backgroundColor: "var(--surface)",
              },
            }}
          >
            Reset
          </Button>

          <IconButton
            aria-label="Exit session"
            onClick={() => {
              if (!window.confirm("Exit the current planner session?")) return;
              onExit();
            }}
            size="small"
            sx={{
              ml: 0.5,
              border: "1px solid var(--border-subtle)",
              color: "var(--accent)",
              "&:hover": {
                borderColor: "var(--accent)",
                backgroundColor: "var(--surface)",
              },
            }}
          >
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
