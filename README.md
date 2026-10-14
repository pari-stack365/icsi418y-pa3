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