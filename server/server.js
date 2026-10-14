require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

const app = express();
const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('pa2');
const users = db.collection('Users');
const projects = db.collection('Projects');
const memberships = db.collection('ProjectMemberships');

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

app.post('/signup', async (req, res) => {
  const { f_name, l_name, username, password } = req.body;

  if (![f_name, l_name, username, password].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Please fill in all fields.' });
  }

  try {
    const name = username.trim();
    const existingUser = await users.findOne({ username: name });

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.insertOne({
      f_name: f_name.trim(),
      l_name: l_name.trim(),
      username: name,
      password: hashedPassword
    });

    return res.status(201).json({ message: 'Account created successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Username already exists.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (![username, password].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Enter a username and password.' });
  }

  try {
    const user = await users.findOne({ username: username.trim() });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    return res.status(200).json({ message: 'Login successful.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
});


app.get('/users', async (req, res) => {
  try {
    const result = await users.find({}, { projection: { password: 0 } }).toArray();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load users.' });
  }
});

app.post('/projects', async (req, res) => {
  const { name, description, status, project_lead_id } = req.body;
  if (![name, description, status, project_lead_id].every(value => typeof value === 'string' && value.trim())) {
    return res.status(400).json({ message: 'Please fill in all project fields.' });
  }
  if (!['Planning', 'Active', 'Completed'].includes(status)) {
    return res.status(400).json({ message: 'Invalid project status.' });
  }
  if (!ObjectId.isValid(project_lead_id)) {
    return res.status(400).json({ message: 'Invalid Project Lead.' });
  }
  try {
    const leadId = new ObjectId(project_lead_id);
    const lead = await users.findOne({ _id: leadId });
    if (!lead) return res.status(404).json({ message: 'Project Lead does not exist.' });

    const project = { name: name.trim(), description: description.trim(), status, project_lead_id: leadId };
    const result = await projects.insertOne(project);
    try {
      await memberships.insertOne({ project_id: result.insertedId, user_id: leadId });
    } catch (error) {
      // Remove the project if its lead membership could not be saved.
      await projects.deleteOne({ _id: result.insertedId });
      throw error;
    }
    res.status(201).json({ message: 'Project created successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not create project.' });
  }
});

app.get('/projects', async (req, res) => {
  try {
    const result = await projects.find().toArray();
    for (const project of result) {
      const lead = await users.findOne({ _id: project.project_lead_id });
      project.project_lead = lead ? lead.username : 'User not found';
    }
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load projects.' });
  }
});

app.get('/projects/:projectId/members', async (req, res) => {
  if (!ObjectId.isValid(req.params.projectId)) {
    return res.status(400).json({ message: 'Invalid project ID.' });
  }
  try {
    const projectId = new ObjectId(req.params.projectId);
    const project = await projects.findOne({ _id: projectId });
    if (!project) return res.status(404).json({ message: 'Project does not exist.' });

    const rows = await memberships.find({ project_id: projectId }).toArray();
    const memberIds = rows.map(row => row.user_id);
    const result = await users.find({ _id: { $in: memberIds } }, { projection: { password: 0 } }).toArray();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load members.' });
  }
});

app.post('/projects/:projectId/members', async (req, res) => {
  const { user_id } = req.body;
  if (typeof user_id !== 'string' || !ObjectId.isValid(user_id) || !ObjectId.isValid(req.params.projectId)) {
    return res.status(400).json({ message: 'Select a valid project and user.' });
  }
  try {
    const projectId = new ObjectId(req.params.projectId);
    const userId = new ObjectId(user_id);
    if (!(await projects.findOne({ _id: projectId }))) {
      return res.status(404).json({ message: 'Project does not exist.' });
    }
    if (!(await users.findOne({ _id: userId }))) {
      return res.status(404).json({ message: 'User does not exist.' });
    }
    const existingMembership = await memberships.findOne({ project_id: projectId, user_id: userId });
    if (existingMembership) {
      return res.status(409).json({ message: 'User is already a member of this project.' });
    }
    await memberships.insertOne({ project_id: projectId, user_id: userId });
    res.status(201).json({ message: 'Member added successfully.' });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'User is already a member of this project.' });
    }
    console.error(error);
    res.status(500).json({ message: 'Could not add member.' });
  }
});

app.delete('/projects/:projectId/members/:userId', async (req, res) => {
  if (!ObjectId.isValid(req.params.projectId) || !ObjectId.isValid(req.params.userId)) {
    return res.status(400).json({ message: 'Invalid project or user ID.' });
  }
  try {
    const projectId = new ObjectId(req.params.projectId);
    const userId = new ObjectId(req.params.userId);
    const project = await projects.findOne({ _id: projectId });
    if (!project) return res.status(404).json({ message: 'Project does not exist.' });
    if (!(await users.findOne({ _id: userId }))) {
      return res.status(404).json({ message: 'User does not exist.' });
    }
    if (project.project_lead_id.equals(userId)) {
      return res.status(400).json({ message: 'The Project Lead cannot be removed.' });
    }
    const result = await memberships.deleteOne({ project_id: projectId, user_id: userId });
    if (!result.deletedCount) return res.status(404).json({ message: 'User is not a member of this project.' });
    res.json({ message: 'Member removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not remove member.' });
  }
});

async function connectDatabase() {
  try {
    await client.connect();
    const oldUsers = await db.listCollections({ name: 'users' }).toArray();
    const currentUsers = await db.listCollections({ name: 'Users' }).toArray();
    if (oldUsers.length && !currentUsers.length) {
      await db.collection('users').rename('Users');
    }
    await users.createIndex({ username: 1 }, { unique: true });
    await projects.createIndex({ project_lead_id: 1 });
    await memberships.createIndex({ project_id: 1, user_id: 1 }, { unique: true });
    console.log('Connected to MongoDB');
    app.listen(9000, () => console.log('Server running on port 9000'));
  } catch (error) {
    console.error('Could not connect to MongoDB');
    console.error(error);
  }
}

connectDatabase();
