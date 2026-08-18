import { useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { supabase } from "./supabaseClient";

const MODES = { SIGN_IN: "signin", SIGN_UP: "signup", FORGOT: "forgot" };

export default function Login({ onGuest }) {
  const [mode, setMode] = useState(MODES.SIGN_IN);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setLoading(true);

    if (mode === MODES.SIGN_IN) {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (authError) setError(authError.error_description || authError.message);
      // On success the auth listener in App.jsx picks up the session.
    } else if (mode === MODES.SIGN_UP) {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: username ? { username } : undefined },
      });
      if (authError) {
        setError(authError.error_description || authError.message);
      } else if (!data.session) {
        setNotice("Check your email to confirm your account before signing in.");
      }
      // With email confirmation disabled, data.session is set immediately
      // and the auth listener in App.jsx takes over.
    } else {
      const { error: authError } = await supabase.auth.resetPasswordForEmail(
        email,
        { redirectTo: window.location.origin }
      );
      if (authError) {
        setError(authError.error_description || authError.message);
      } else {
        setNotice("If an account exists for that email, a reset link has been sent.");
      }
    }

    setLoading(false);
  };

  const isSignIn = mode === MODES.SIGN_IN;
  const isSignUp = mode === MODES.SIGN_UP;
  const isForgot = mode === MODES.FORGOT;

  const submitLabel = isSignIn
    ? "Sign in"
    : isSignUp
      ? "Create account"
      : "Send reset link";

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
        <TextField
          type="email"
          label="Your email"
          placeholder="coach@gym.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          required
        />
        {isSignUp && (
          <TextField
            type="text"
            label="Username (optional)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
        )}
        {!isForgot && (
          <TextField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {notice && <Alert severity="success">{notice}</Alert>}
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
          {loading ? "Please wait…" : submitLabel}
        </Button>
        <Stack spacing={0.5} alignItems="center">
          {isSignIn && (
            <>
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={() => switchMode(MODES.SIGN_UP)}
                sx={{ color: "var(--text-secondary)" }}
              >
                New here? Create an account
              </Button>
              <Button
                type="button"
                variant="text"
                size="small"
                onClick={() => switchMode(MODES.FORGOT)}
                sx={{ color: "var(--text-secondary)" }}
              >
                Forgot password?
              </Button>
            </>
          )}
          {isSignUp && (
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={() => switchMode(MODES.SIGN_IN)}
              sx={{ color: "var(--text-secondary)" }}
            >
              Already have an account? Sign in
            </Button>
          )}
          {isForgot && (
            <Button
              type="button"
              variant="text"
              size="small"
              onClick={() => switchMode(MODES.SIGN_IN)}
              sx={{ color: "var(--text-secondary)" }}
            >
              Back to sign in
            </Button>
          )}
        </Stack>
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
