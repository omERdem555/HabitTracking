import { useState } from 'react';
import {
  loginEmail,
  registerEmail,
  loginWithGoogle,
} from '../lib/firebase';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    await loginEmail(email, password);
  };

  const handleRegister = async () => {
    await registerEmail(email, password);
  };

  const handleGoogle = async () => {
    await loginWithGoogle();
  };

  return (
    <div style={{ padding: 24, maxWidth: 360, margin: '0 auto' }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
      <button onClick={handleRegister}>Register</button>

      <hr />

      <button onClick={handleGoogle}>
        Continue with Google
      </button>
    </div>
  );
};