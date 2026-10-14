import Signup from './components/Signup.jsx';
import Login from './components/Login.jsx';
import Projects from './components/Projects.jsx';
import './App.css';

function App() {
  return (
    <main>
      <h1>Project Management</h1>
      <Signup />
      <Login />
      <Projects />
    </main>
  );
}

export default App;
