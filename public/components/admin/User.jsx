import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/admin';
import TextField from 'material-ui/lib/text-field';

class User extends Component {
  constructor(props) {
    super(props);
    this.state = { email: props.user.email, password: '' };
    this.updateUser = this.updateUser.bind(this);
  }

  onChange(field) {
    return e => {
      this.setState({ [field]: e.target.value });
    };
  }

  deleteUser(email) {
    return e => {
      e.preventDefault();

      if (!confirm('Are you sure you want to delete this user?')) {
        return;
      }

      if (this.props.currentUser) {
        if (!confirm('Deleting the currently logged in user will sign you ' +
          'out and potentially prevent you from signing in again. Are you ' +
          'sure you want to do this?')) {
          return;
        }
      }

      this.props.dispatch(actions.deleteUser(email)).then(() => {
        if (this.props.currentUser) {
          window.location.reload();
        }
      });
    };
  }

  updateUser(e) {
    e.preventDefault();

    const originalEmail = this.props.user.email;

    if (this.props.currentUser) {
      if (!confirm('Modifying the currently logged in user will sign you ' +
        'out. Are you sure you want to do this?')) {
        return;
      }
    }

    const updates = { email: this.state.email };
    if (this.state.password) {
      updates.password = this.state.password;
    }

    this.props.dispatch(actions.updateUser(updates, originalEmail)).then(() => {
      if (this.props.currentUser) {
        window.location.reload();
      }

      // If we're only updating the password, we won't be re-rendering since
      // the server doesn't send password info, so let's clear out the form.
      if (updates.password && updates.email === originalEmail) {
        this.setState({ password: '' });
        this.refs.email.blur();
        this.refs.password.blur();
      }
    });
  }

  render() {
    return (
      <li className="user">
        <a
          className="material-icons delete"
          onClick={this.deleteUser(this.props.user.email)}
        >
          
        </a>
        <form className="form" onSubmit={this.updateUser} autoComplete="off">
          <input
            type="text"
            style={{ position: 'absolute', top: -9999, left: -9999 }}
            name="disable_autocomplete_user"
            autoComplete="off"
          />
          <input
            type="password"
            style={{ position: 'absolute', top: -9999, left: -9999 }}
            name="disable_autocomplete_password"
            autoComplete="off"
          />
          <TextField
            value={this.state.email}
            ref="email"
            hintText="Email"
            fullWidth
            autoComplete="off"
            onChange={this.onChange('email')}
          />
          <TextField
            value={this.state.password}
            type="password"
            ref="password"
            hintText="Change password"
            fullWidth
            autoComplete="off"
            onChange={this.onChange('password')}
          />
          <input style={{ display: 'none' }} type="submit" />
        </form>
      </li>
    );
  }
}

User.propTypes = {
  currentUser: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    email: PropTypes.string.isRequired,
  }).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(User);
