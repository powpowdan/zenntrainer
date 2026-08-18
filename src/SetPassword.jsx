import { useState } from "react";
import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { supabase } from "./supabaseClient";

export default function SetPassword({ onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (authError) {
      setError(authError.error_description || authError.message);
    } else {
      setNotice("Password updated. You are signed in.");
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--app)",
        color: "var(--text-primary)",
        px: 2,
      }}
    >
      <Typography
        variant="h4"
        sx={{ fontWeight: 700, letterSpacing: "-0.03em", mb: 3 }}
      >
        Cadence<Box component="span" sx={{ color: "var(--accent)" }}>.</Box>
      </Typography>
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          width: "100%",
          maxWidth: 360,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          p: 3,
          border: "1px solid var(--border-subtle)",
          borderRadius: "var(--radius-md)",
          background: "var(--surface)",
        }}
      >
        <Typography variant="body1" sx={{ color: "var(--text-secondary)" }}>
          Choose a new password for your account.
        </Typography>
        <TextField
          type="password"
          label="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
        />
        <TextField
          type="password"
          label="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          fullWidth
          required
          autoComplete="new-password"
        />
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success">{notice}</Alert>}
        {notice ? (
          <Button
            type="button"
            variant="contained"
            onClick={onDone}
            fullWidth
            sx={{
              backgroundColor: "var(--text-primary)",
              color: "var(--app)",
              "&:hover": {
                backgroundColor: "var(--text-primary)",
                opacity: 0.88,
              },
            }}
          >
            Continue to Cadence
          </Button>
        ) : (
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            fullWidth
            sx={{
              backgroundColor: "var(--text-primary)",
              color: "var(--app)",
              "&:hover": {
                backgroundColor: "var(--text-primary)",
                opacity: 0.88,
              },
            }}
          >
            {loading ? "Please wait…" : "Update password"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
