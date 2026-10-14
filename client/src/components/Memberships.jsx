import { useState } from 'react';

function Memberships({ projects, users }) {
  const [projectId, setProjectId] = useState('');
  const [userId, setUserId] = useState('');
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const project = projects.find(item => item._id === projectId);

  async function loadMembers(id) {
    const response = await fetch(`http://localhost:9000/projects/${id}/members`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message);
    setMembers(data);
  }

  async function selectProject(event) {
    const id = event.target.value;
    setProjectId(id);
    setMembers([]);
    setMessage('');
    setUserId('');
    if (!id) return;
    setBusy(true);
    try {
      await loadMembers(id);
    } catch (error) {
      setMessage(error.message || 'Could not load members.');
    } finally {
      setBusy(false);
    }
  }

  async function addMember(event) {
    event.preventDefault();
    if (!projectId || !userId) {
      setMessage('Select a project and user.');
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`http://localhost:9000/projects/${projectId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) await loadMembers(projectId);
    } catch {
      setMessage('Could not update members. Check the server and reload the project.');
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(id) {
    setBusy(true);
    try {
      const response = await fetch(`http://localhost:9000/projects/${projectId}/members/${id}`, { method: 'DELETE' });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) await loadMembers(projectId);
    } catch {
      setMessage('Could not update members. Check the server and reload the project.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <h2>Project Members</h2>
      <label>Project
        <select value={projectId} onChange={selectProject} disabled={busy}>
          <option value="">Select a project</option>
          {projects.map(item => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
      </label>
      {projectId && (
        <>
          <ul>
            {members.map(member => (
              <li key={member._id}>
                {member.username}{member._id === project?.project_lead_id ? ' (Project Lead)' : ' '}
                {member._id !== project?.project_lead_id && <button disabled={busy} onClick={() => removeMember(member._id)}>Remove</button>}
              </li>
            ))}
          </ul>
          <form onSubmit={addMember}>
            <label>User
              <select value={userId} onChange={event => setUserId(event.target.value)} disabled={busy}>
                <option value="">Select a user</option>
                {users.map(user => <option key={user._id} value={user._id}>{user.username}</option>)}
              </select>
            </label>
            <button type="submit" disabled={busy}>Add Member</button>
          </form>
        </>
      )}
      <p role="status">{message}</p>
    </section>
  );
}

export default Memberships;
