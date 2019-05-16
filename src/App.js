import React, { Component } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import {
  Container,
  Menu,
} from 'semantic-ui-react';

import Home from './Home';
import PreparationOrganizer from './PreparationOrganizer';
import RegistrationOrganizer from './RegistrationOrganizer';
import VotePreparationOrganizer from './VotePreparationOrganizer';
import VoteCountingOrganizer from './VoteCountingOrganizer';
import PreparationVoter from './PreparationVoter';
import RegistrationVoter from './RegistrationVoter';
import VotePreparationVoter from './VotePreparationVoter';
import VoteCastingVoter from './VoteCastingVoter';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOrganizer: true
    }
  }

  render() {
    if (this.state.isOrganizer) {
      return (
        <Router>
          <div>
            <Menu fixed='top' inverted>
              <Container>
                <Menu.Item as={Link} to='/'>Home</Menu.Item>
                <Menu.Item as={Link} to='/organizer/preparation/'>Preparation</Menu.Item>
                <Menu.Item as={Link} to='/organizer/registration/'>Registration</Menu.Item>
                <Menu.Item as={Link} to='/organizer/vote_preparation/'>Vote Preparation</Menu.Item>
                <Menu.Item as={Link} to='/organizer/vote_counting/'>Vote Counting</Menu.Item>
                <Menu.Menu position='right'>
                  <Menu.Item>Organizer</Menu.Item>
                </Menu.Menu>
              </Container>
            </Menu>
    
            <Container style={{ marginTop: '5em' }}>
              <Route path="/" exact component={Home} />
              <Route path="/organizer/preparation/" exact component={PreparationOrganizer} />
              <Route path="/organizer/registration/" exact component={RegistrationOrganizer} />
              <Route path="/organizer/vote_preparation/" exact component={VotePreparationOrganizer} />
              <Route path="/organizer/vote_counting/" exact component={VoteCountingOrganizer} />
            </Container>
          </div>
        </Router>
      );
    }
    else {
      return (
        <Router>
          <div>
            <Menu fixed='top' inverted>
              <Container>
                <Menu.Item as={Link} to='/'>Home</Menu.Item>
                <Menu.Item as={Link} to='/voter/preparation/'>Preparation</Menu.Item>
                <Menu.Item as={Link} to='/voter/registration/'>Registration</Menu.Item>
                <Menu.Item as={Link} to='/voter/vote_preparation/'>Vote Preparation</Menu.Item>
                <Menu.Item as={Link} to='/voter/vote_casting/'>Vote Casting</Menu.Item>
                <Menu.Menu position='right'>
                  <Menu.Item>Voter</Menu.Item>
                </Menu.Menu>
              </Container>
            </Menu>
    
            <Container style={{ marginTop: '5em' }}>
              <Route path="/" exact component={Home} />
              <Route path="/voter/preparation/" exact component={PreparationVoter} />
              <Route path="/voter/registration/" exact component={RegistrationVoter} />
              <Route path="/voter/vote_preparation/" exact component={VotePreparationVoter} />
              <Route path="/voter/vote_casting/" exact component={VoteCastingVoter} />
            </Container>
          </div>
        </Router>
      );
    }
  }
}

export default App;