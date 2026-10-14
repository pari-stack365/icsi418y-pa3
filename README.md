# Programming Assignment 3

This app continues PA2 with projects and project memberships.

## Running the app

Use Node.js 22.12 or newer and a running MongoDB server, or a MongoDB Atlas connection string.

In the server folder, run:

```bash
npm install
```

Create a file named `.env` inside the `server` folder. Add your MongoDB connection string in this format:

```env
MONGO_URI=your_connection_string
```

The app uses the `pa2` database so existing accounts are reused.

Start the backend:

```bash
npm start
```

In another terminal, in the client folder, run:

```bash
npm install
npm run dev
```

Open the localhost URL printed by Vite. The backend runs on port 9000.

## Using the app

Sign up and log in using the existing forms. Create a project by entering a name, description, status, and selecting a registered user as lead. Projects are displayed below the form.

Select a project under Project Members to see its members. Select a user and click Add Member. Click Remove beside a non-lead member to remove that user. The lead is added when the project is created and cannot be removed. Adding the same user twice shows an error.

On startup, the existing PA2 users collection is renamed to Users if Users does not already exist. This keeps the existing accounts and their IDs.

Users stores registered users. Projects stores name, description, status, and project_lead_id. ProjectMemberships stores project_id and user_id as ObjectId references. A unique index on the two membership fields prevents duplicate memberships while allowing a user to join different projects.

## Before submitting

Test Signup and Login, empty project fields, project creation, lead membership, adding a user to two projects, duplicate membership feedback, and removing a non-lead member. Check the Projects and ProjectMemberships collections in MongoDB.

Record a 3–5 minute Zoom demonstration with at least three registered users and two projects. Demonstrate the required operations and briefly explain Projects.jsx, Memberships.jsx, and the routes in server.js.

Commit and push the changes to your PA3 GitHub repository, verify the files on GitHub, and submit the repository URL and Zoom video through Brightspace. Do not commit .env or node_modules.