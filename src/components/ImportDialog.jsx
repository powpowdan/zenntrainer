import {
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";

const primaryButtonSx = {
  backgroundColor: "var(--text-primary)",
  color: "var(--app)",
  whiteSpace: "nowrap",
  "&:hover": { backgroundColor: "var(--text-primary)", opacity: 0.88 },
  "&:disabled": {
    backgroundColor: "var(--text-primary)",
    opacity: 0.5,
    color: "var(--app)",
  },
};

export default function ImportDialog({ state, onImport, onRetry, onClose }) {
  if (!state) return null;

  const isReady = state.status === "ready" || state.status === "importing";
  const snapshot = state.snapshot || { name: "", blocks: [] };
  const totalMinutes = snapshot.blocks.reduce(
    (sum, block) => sum + (Number(block.duration) || 0),
    0
  );

  return (
    <Dialog
      open
      onClose={state.status === "importing" ? undefined : onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="import-dialog-title"
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
      <DialogTitle id="import-dialog-title">Shared class</DialogTitle>
      <DialogContent dividers>
        {state.status === "loading" && (
          <Stack spacing={2} alignItems="center" sx={{ py: 3 }}>
            <CircularProgress size={28} sx={{ color: "var(--accent)" }} />
            <Typography sx={{ color: "var(--text-secondary)" }}>
              Loading the shared class…
            </Typography>
          </Stack>
        )}

        {isReady && (
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 18, fontWeight: 600, color: "var(--text-primary)" }}>
              {snapshot.name}
            </Typography>
            <Typography
              sx={{ fontSize: 13, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" }}
            >
              {snapshot.blocks.length} {snapshot.blocks.length === 1 ? "block" : "blocks"} ·{" "}
              {totalMinutes} min
            </Typography>
            <Typography sx={{ fontSize: 13, color: "var(--text-muted)" }}>
              Adding it creates your own copy — the sender’s class stays separate.
            </Typography>
            {state.importFailed && (
              <Typography sx={{ fontSize: 13, color: "var(--accent)" }}>
                Couldn’t add the class. Check your connection and try again.
              </Typography>
            )}
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                onClick={onClose}
                disabled={state.status === "importing"}
                sx={{ color: "var(--text-secondary)" }}
              >
                Not now
              </Button>
              <Button
                variant="contained"
                onClick={onImport}
                disabled={state.status === "importing"}
                startIcon={
                  state.status === "importing" ? (
                    <CircularProgress size={16} sx={{ color: "var(--app)" }} />
                  ) : undefined
                }
                sx={primaryButtonSx}
              >
                {state.status === "importing" ? "Adding…" : "Add to my classes"}
              </Button>
            </Stack>
          </Stack>
        )}

        {state.status === "unavailable" && (
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 15, color: "var(--text-primary)" }}>
              This share is no longer available.
            </Typography>
            <Typography sx={{ fontSize: 13, color: "var(--text-secondary)" }}>
              The link may have expired — shares last 30 days. Ask the sender to
              share the class again.
            </Typography>
            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={onClose} sx={primaryButtonSx}>
                Continue
              </Button>
            </Stack>
          </Stack>
        )}

        {state.status === "error" && (
          <Stack spacing={2}>
            <Typography sx={{ fontSize: 15, color: "var(--text-primary)" }}>
              Couldn’t load the shared class.
            </Typography>
            <Typography sx={{ fontSize: 13, color: "var(--text-secondary)" }}>
              Check your connection and try again.
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button onClick={onClose} sx={{ color: "var(--text-secondary)" }}>
                Continue
              </Button>
              <Button variant="contained" onClick={onRetry} sx={primaryButtonSx}>
                Try again
              </Button>
            </Stack>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
