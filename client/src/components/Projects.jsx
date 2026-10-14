import { useEffect, useState } from 'react';
import Memberships from './Memberships.jsx';

function Projects() {
  const [users, setUsers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Planning');
  const [leadId, setLeadId] = useState('');
  const [message, setMessage] = useState('');

  async function loadUsers() {
    try {
      const response = await fetch('http://localhost:9000/users');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setUsers(data);
    } catch (error) {
      setMessage(error.message || 'Could not load users.');
    }
  }

  async function loadProjects() {
    try {
      const response = await fetch('http://localhost:9000/projects');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setProjects(data);
    } catch (error) {
      setMessage(error.message || 'Could not load projects.');
    }
  }

  useEffect(() => {
    async function loadData() {
      await loadUsers();
      await loadProjects();
    }
    loadData();
    window.addEventListener('usersChanged', loadUsers);
    return () => window.removeEventListener('usersChanged', loadUsers);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:9000/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, status, project_lead_id: leadId })
      });
      const data = await response.json();
      setMessage(data.message);
      if (response.ok) {
        setName('');
        setDescription('');
        setStatus('Planning');
        setLeadId('');
        await loadProjects();
      }
    } catch {
      setMessage('Could not connect to the server.');
    }
  }

  return (
    <>
      <section>
        <h2>Create Project</h2>
        <form onSubmit={handleSubmit}>
          <label>Name <input value={name} onChange={event => setName(event.target.value)} /></label>
          <label>Description <textarea value={description} onChange={event => setDescription(event.target.value)} /></label>
          <label>Status
            <select value={status} onChange={event => setStatus(event.target.value)}>
              <option>Planning</option><option>Active</option><option>Completed</option>
            </select>
          </label>
          <label>Project Lead
            <select value={leadId} onChange={event => setLeadId(event.target.value)}>
              <option value="">Select a user</option>
              {users.map(user => <option key={user._id} value={user._id}>{user.username}</option>)}
            </select>
          </label>
          <button type="submit">Create Project</button>
        </form>
        <p role="status">{message}</p>
      </section>
      <section>
        <h2>Projects</h2>
        {projects.length === 0 && <p>No projects yet.</p>}
        {projects.map(project => (
          <div key={project._id}>
            <h3>{project.name}</h3>
            <p>{project.description}</p>
            <p>Status: {project.status}</p>
            <p>Project Lead: {project.project_lead}</p>
          </div>
        ))}
      </section>
      <Memberships projects={projects} users={users} />
    </>
  );
}

export default Projects;
