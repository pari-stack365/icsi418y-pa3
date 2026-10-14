import { useState } from 'react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:9000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();
      setMessage(data.message);
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  return (
    <section>
      <h2>Log In</h2>
      <form onSubmit={handleSubmit}>
        <label>Username <input value={username} onChange={event => setUsername(event.target.value)} /></label>
        <label>Password <input type="password" value={password} onChange={event => setPassword(event.target.value)} /></label>
        <button type="submit">Log In</button>
      </form>
      <p role="status">{message}</p>
    </section>
  );
}

export default Login;
