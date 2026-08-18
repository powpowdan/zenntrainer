import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import IosShareIcon from "@mui/icons-material/IosShare";

const copyToClipboard = async (text) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
};

const primaryButtonSx = {
  backgroundColor: "var(--text-primary)",
  color: "var(--app)",
  whiteSpace: "nowrap",
  "&:hover": { backgroundColor: "var(--text-primary)", opacity: 0.88 },
  "&:disabled": { backgroundColor: "var(--text-primary)", opacity: 0.5, color: "var(--app)" },
};

export default function ShareDialog({ state, onClose, onRetry }) {
  const [copied, setCopied] = useState(false);
  const autoShareAttempted = useRef(false);

  const canNativeShare = typeof navigator !== "undefined" && !!navigator.share;

  useEffect(() => {
    setCopied(false);
    if (state?.status === "ready") autoShareAttempted.current = false;
  }, [state]);

  useEffect(() => {
    if (state?.status !== "ready" || !canNativeShare) return;
    if (autoShareAttempted.current) return;
    autoShareAttempted.current = true;
    navigator.share({ title: state.className, url: state.link }).catch(() => {});
  }, [state, canNativeShare]);

  if (!state) return null;

  const handleCopy = async () => {
    try {
      await copyToClipboard(state.link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Dialog
      open
      onClose={state.status === "working" ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="share-dialog-title"
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
      <DialogTitle id="share-dialog-title" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Share class</span>
        {state.status !== "working" && (
          <IconButton aria-label="Close share dialog" onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {state.status === "working" && (
          <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={28} sx={{ color: "var(--accent)" }} />
            <Typography sx={{ color: "var(--text-secondary)" }}>
              Creating a share link for “{state.className}”…
            </Typography>
          </Stack>
        )}

        {state.status === "ready" && (
          <Stack spacing={2}>
            <Typography sx={{ color: "var(--text-secondary)", fontSize: 14 }}>
              Anyone with this link can add “{state.className}” to their classes as
              their own copy. The link works for 30 days.
            </Typography>
            <Box
              sx={{
                p: 1,
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-subtle)",
                backgroundColor: "var(--elevated)",
                wordBreak: "break-all",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              {state.link}
            </Box>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                onClick={handleCopy}
                startIcon={<ContentCopyIcon />}
                sx={{ color: "var(--text-secondary)", whiteSpace: "nowrap" }}
              >
                {copied ? "Copied" : "Copy link"}
              </Button>
              {canNativeShare && (
                <Button
                  variant="contained"
                  onClick={() =>
                    navigator
                      .share({ title: state.className, url: state.link })
                      .catch(() => {})
                  }
                  startIcon={<IosShareIcon />}
                  sx={primaryButtonSx}
                >
                  Share
                </Button>
              )}
            </Stack>
          </Stack>
        )}

        {state.status === "error" && (
          <Stack spacing={2}>
            <Typography sx={{ color: "var(--text-primary)", fontSize: 15 }}>
              {state.message}
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={onClose} sx={{ color: "var(--text-secondary)" }}>
                Close
              </Button>
              {state.classId && (
                <Button variant="contained" onClick={() => onRetry(state.classId)} sx={primaryButtonSx}>
                  Try again
                </Button>
              )}
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
