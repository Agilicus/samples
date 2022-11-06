import React, {Component} from 'react';
import Authenticate from 'react-openidconnect';

import logo from './logo.svg';
import './App.css';

var OidcSettings = {
  authority: 'https://auth.cloud.egov.city/',
  client_id: 'sample-react-auth',
  redirect_uri: 'http://localhost:3000/',
  response_type: 'id_token token code',
  scope: 'openid profile email',
  post_logout_redirect_uri: 'https://localhost:3000/',
};

class App extends Component {
  constructor(props) {
    super(props);
    this.user = 'unknown';
    this.userLoaded = this.userLoaded.bind(this);
    this.userUnLoaded = this.userUnLoaded.bind(this);

    this.state = {user: undefined};
  }

  userLoaded(user) {
    if (user) {
      this.user = user;
      console.log(user);
      this.setState({user: user});
    }
  }

  userUnLoaded() {
    this.user = 'unknown';
    this.setState({user: undefined});
  }

  NotAuthenticated() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p> Click to authenticate </p>
        </header>
      </div>
    );
  }

  render() {
    return (
      <Authenticate
        OidcSettings={OidcSettings}
        userLoaded={this.userLoaded}
        userunLoaded={this.userUnLoaded}
        renderNotAuthenticated={this.NotAuthenticated}
      >
      `<div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p> Welcome User! {this.user} </p>
        </header>
      </div>`
      </Authenticate>
    );
  }
}

export default App;
