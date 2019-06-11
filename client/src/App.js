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
import VoteTallyingOrganizer from './VoteTallyingOrganizer';
import RegistrationVoter from './RegistrationVoter';
import VotePreparationVoter from './VotePreparationVoter';
import VoteCastingVoter from './VoteCastingVoter';
import RSAGenerator from './RSAGenerator';
import Test from './Test';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOrganizer: false,
      loading: true,
      drizzleState: null
    }
  }

  componentDidMount() {
    const {drizzle} = this.props;
    
    // Subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {
      // Every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // Check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({
          loading: false,
          drizzleState
        });
      }
    })
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  render() {
    if (this.state.loading) {
      return "Loading drizzle...";
    }

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
                <Menu.Item as={Link} to='/organizer/vote_tallying/'>Vote Tallying</Menu.Item>
                <Menu.Menu position='right'>
                  <Menu.Item as={Link} to='/rsa_generator/'>RSA Generator</Menu.Item>
                  <Menu.Item>Organizer</Menu.Item>
                </Menu.Menu>
              </Container>
            </Menu>
    
            <Container style={{ marginTop: '5em' }}>
              <Route path="/" exact
                render={(routeProps) => (
                  <Home
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/organizer/preparation/" exact
                render={(routeProps) => (
                  <PreparationOrganizer
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/organizer/registration/" exact
                render={(routeProps) => (
                  <RegistrationOrganizer
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/organizer/vote_preparation/" exact
                render={(routeProps) => (
                  <VotePreparationOrganizer
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/organizer/vote_tallying/" exact
                render={(routeProps) => (
                  <VoteTallyingOrganizer
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/rsa_generator" exact component={RSAGenerator} />
              <Route path="/test" exact component={Test} />
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
                <Menu.Item as={Link} to='/voter/registration/'>Registration</Menu.Item>
                <Menu.Item as={Link} to='/voter/vote_preparation/'>Vote Preparation</Menu.Item>
                <Menu.Item as={Link} to='/voter/vote_casting/'>Vote Casting</Menu.Item>
                <Menu.Menu position='right'>
                  <Menu.Item as={Link} to='/rsa_generator/'>RSA Generator</Menu.Item>
                  <Menu.Item>Voter</Menu.Item>
                </Menu.Menu>
              </Container>
            </Menu>
    
            <Container style={{ marginTop: '5em' }}>
            <Route path="/" exact
                render={(routeProps) => (
                  <Home
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/voter/registration/" exact
                render={(routeProps) => (
                  <RegistrationVoter
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/voter/vote_preparation/" exact
                render={(routeProps) => (
                  <VotePreparationVoter
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/voter/vote_casting/" exact
                render={(routeProps) => (
                  <VoteCastingVoter
                    {...routeProps}
                    drizzle={this.props.drizzle}
                    drizzleState={this.state.drizzleState}
                  />
                )}
              />
              <Route path="/rsa_generator" exact component={RSAGenerator} />
              <Route path="/test" exact component={Test} />
            </Container>
          </div>
        </Router>
      );
    }
  }
}

export default App;