import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Login({ onGuest }) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email })

    if (error) {
      alert(error.error_description || error.message)
    } else {
      alert('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <h1>Zenntrainer Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button disabled={loading} style={{ padding: '10px', cursor: 'pointer' }}>
          {loading ? 'Sending magic link...' : 'Send Magic Link'}
        </button>
        <button type="button" onClick={onGuest} style={{ padding: '10px', cursor: 'pointer', background: 'transparent', border: '1px solid #ccc', color: 'inherit' }}>
          Continue as Guest
        </button>
      </form>
    </div>
  )
}