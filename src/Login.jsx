import { useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { supabase } from "./supabaseClient";

export default function Login({ onGuest }) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert(error.error_description || error.message);
    } else {
      alert("Check your email for the login link!");
    }
    setLoading(false);
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
        onSubmit={handleLogin}
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
        <TextField
          type="email"
          label="Your email"
          placeholder="coach@gym.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />
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
          {loading ? "Sending magic link…" : "Send magic link"}
        </Button>
        <Button
          type="button"
          variant="text"
          onClick={onGuest}
          disabled={loading}
          sx={{ color: "var(--text-secondary)" }}
        >
          Continue as guest
        </Button>
      </Box>
    </Box>
  );
}
