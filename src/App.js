import React from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
  Container,
  Menu,
} from 'semantic-ui-react';

function Index() {
  return <h2>Home</h2>;
}

function About() {
  return <h2>About</h2>;
}

function Users() {
  return <h2>Users</h2>;
}

function AppRouter() {
  return (
    <Router>
      <div>
        <Menu fixed='top' inverted>
          <Container>
            <Menu.Item as={Link} to='/'>Home</Menu.Item>
            <Menu.Item as={Link} to='/about/'>About</Menu.Item>
            <Menu.Item as={Link} to='/users/'>Users</Menu.Item>
          </Container>
        </Menu>

        <Container style={{ marginTop: '5em' }}>
          <Route path="/" exact component={Index} />
          <Route path="/about/" component={About} />
          <Route path="/users/" component={Users} />
        </Container>
      </div>
    </Router>
  );
}

export default AppRouter;