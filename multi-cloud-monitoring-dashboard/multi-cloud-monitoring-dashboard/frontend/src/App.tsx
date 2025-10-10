import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/" exact component={Dashboard} />
          <Route path="/settings" component={Settings} />
        </Switch>
      </div>
    </Router>
  );
};

export default App;