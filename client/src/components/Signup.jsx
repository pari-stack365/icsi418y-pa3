import { useState } from 'react';

function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:9000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ f_name: firstName, l_name: lastName, username, password })
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setFirstName('');
        setLastName('');
        setUsername('');
        setPassword('');
        window.dispatchEvent(new Event('usersChanged'));
      }
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  return (
    <section>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <label>First Name <input value={firstName} onChange={event => setFirstName(event.target.value)} /></label>
        <label>Last Name <input value={lastName} onChange={event => setLastName(event.target.value)} /></label>
        <label>Username <input value={username} onChange={event => setUsername(event.target.value)} /></label>
        <label>Password <input type="password" value={password} onChange={event => setPassword(event.target.value)} /></label>
        <button type="submit">Sign Up</button>
      </form>
      <p role="status">{message}</p>
    </section>
  );
}

export default Signup;
