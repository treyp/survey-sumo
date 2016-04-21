import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/admin';
import TextField from 'material-ui/lib/text-field';
import RaisedButton from 'material-ui/lib/raised-button';

class AddUser extends Component {
  constructor(props) {
    super(props);
    this.state = { email: '', password: '' };
    this.createUser = this.createUser.bind(this);
  }

  onChange(field) {
    return e => {
      this.setState({ [field]: e.target.value });
    };
  }

  onKeyDown(submit) {
    return e => {
      if (e.keyCode === 13) {
        e.preventDefault();
        if (submit) {
          this.createUser();
        } else {
          this.refs.password.focus();
        }
        return false;
      }

      return true;
    };
  }

  createUser(e) {
    if (e) {
      e.preventDefault();
    }
    const email = this.state.email;
    const password = this.state.password;
    if (this.props.users.some(u => u.email === email)) {
      alert('That email is already in use');
      return;
    }

    if (!password) {
      alert('Please enter a password for the new user');
      return;
    }

    this.props.dispatch(actions.createUser({ email, password })).then(() => {
      this.setState({ email: '', password: '' });
      this.refs.email.focus();
    });
  }

  render() {
    return (
      <li className="user">
        Create a new admin
        <form className="form" onSubmit={this.createUser} autoComplete="off">
          <RaisedButton
            label="Add"
            primary
            onClick={this.createUser}
            style={{ float: 'right' }}
          />
            <input
              type="text"
              name="disable_autocomplete_email"
              style={{ position: 'absolute', top: -9999, left: -9999 }}
            />
            <input
              type="password"
              name="disable_autocomplete_password"
              style={{ position: 'absolute', top: -9999, left: -9999 }}
            />
          <div className="halves">
            <div className="half first-half">
              <div className="padding">
                <TextField
                  value={this.state.email}
                  ref="email"
                  hintText="Email"
                  onKeyDown={this.onKeyDown(false)}
                  onChange={this.onChange('email')}
                  fullWidth
                  autoComplete="off"
                />
              </div>
            </div>
            <div className="half last-half">
              <div className="padding">
                <TextField
                  value={this.state.password}
                  type="password"
                  ref="password"
                  hintText="Password"
                  onKeyDown={this.onKeyDown(true)}
                  onChange={this.onChange('password')}
                  fullWidth
                  autoComplete="off"
                />
              </div>
            </div>
          </div>
        </form>
      </li>
    );
  }
}

AddUser.propTypes = {
  users: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string.isRequired,
  })).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(AddUser);
