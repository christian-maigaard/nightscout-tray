import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Settings from './Components/Settings';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Settings} />
      </Switch>
    </Router>
  );
}
