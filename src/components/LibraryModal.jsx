import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";

const formatDate = (isoString) => {
  try {
    return new Date(isoString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
};

const cardSx = {
  width: "100%",
  textAlign: "left",
  p: 1.5,
  border: "1px solid var(--border-subtle)",
  borderRadius: "var(--radius-sm)",
  backgroundColor: "var(--surface)",
  "&:hover": { backgroundColor: "var(--elevated)" },
};

const actionSx = {
  color: "var(--text-secondary)",
  "&:hover": { color: "var(--text-primary)" },
};

export default function LibraryModal({
  open,
  onClose,
  required = false,
  classes,
  currentClassId,
  runsByClass,
  taskSummaries,
  onOpenClass,
  onCreateClass,
  onRenameClass,
  onDuplicateClass,
  onDeleteClass,
}) {
  const [newClassName, setNewClassName] = useState("");

  const handleClose = () => {
    if (required) return;
    onClose();
  };

  const handleCreate = () => {
    const name = newClassName.trim() || "New class";
    onCreateClass(name);
    setNewClassName("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="library-title"
      slotProps={{
        paper: {
          sx: {
            backgroundColor: "var(--surface)",
            backgroundImage: "none",
            border: "1px solid var(--border-subtle)",
          },
        },
      }}
    >
      <DialogTitle id="library-title" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>My classes</span>
        {!required && (
          <IconButton aria-label="Close class library" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {classes.length === 0 ? (
          <Typography sx={{ color: "var(--text-secondary)", py: 3, textAlign: "center" }}>
            No classes yet. Create your first class below to start planning.
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ mb: 2 }}>
            {classes.map((cls) => {
              const summary = taskSummaries[cls.id] || { blockCount: 0, totalMinutes: 0 };
              const history = runsByClass[cls.id];
              const isCurrent = cls.id === currentClassId;
              return (
                <Stack
                  key={cls.id}
                  direction="row"
                  spacing={1}
                  alignItems="stretch"
                  sx={{
                    borderRadius: "var(--radius-sm)",
                    border: isCurrent
                      ? "1px solid var(--accent)"
                      : "1px solid transparent",
                  }}
                >
                  <Button sx={cardSx} onClick={() => onOpenClass(cls.id)} aria-label={`Open class ${cls.name}`}>
                    <Box sx={{ width: "100%" }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>
                        {cls.name}
                        {isCurrent && (
                          <Typography component="span" sx={{ fontSize: 12, color: "var(--accent)", ml: 1 }}>
                            Current
                          </Typography>
                        )}
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                        {summary.blockCount} {summary.blockCount === 1 ? "block" : "blocks"} · {summary.totalMinutes} min
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {history
                          ? `Last taught ${formatDate(history.lastFinishedAt)} · ${history.count}×`
                          : "Never taught"}
                      </Typography>
                    </Box>
                  </Button>
                  <Stack spacing={0.5} justifyContent="center">
                    <IconButton
                      aria-label={`Duplicate class ${cls.name}`}
                      size="small"
                      sx={actionSx}
                      onClick={() => onDuplicateClass(cls.id)}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label={`Rename class ${cls.name}`}
                      size="small"
                      sx={actionSx}
                      onClick={() => onRenameClass(cls.id)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label={`Delete class ${cls.name}`}
                      size="small"
                      sx={{ ...actionSx, "&:hover": { color: "var(--accent)" } }}
                      onClick={() => onDeleteClass(cls.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                </Stack>
              );
            })}
          </Stack>
        )}

        <Stack
          component="form"
          direction="row"
          spacing={1}
          onSubmit={(event) => {
            event.preventDefault();
            handleCreate();
          }}
        >
          <TextField
            size="small"
            placeholder="New class name"
            value={newClassName}
            onChange={(event) => setNewClassName(event.target.value)}
            fullWidth
          />
          <Button
            type="submit"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              backgroundColor: "var(--text-primary)",
              color: "var(--app)",
              whiteSpace: "nowrap",
              "&:hover": { backgroundColor: "var(--text-primary)", opacity: 0.88 },
            }}
          >
            New class
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
