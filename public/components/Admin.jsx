import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../actions/admin';
import Paper from 'material-ui/lib/paper';
import CircularProgress from 'material-ui/lib/circular-progress';

import Question from './admin/Question';
import AddQuestion from './admin/AddQuestion';
import User from './admin/User';
import AddUser from './admin/AddUser';

class Admin extends Component {
  constructor(props) {
    super(props);
    this.focusNextInput = this.focusNextInput.bind(this);
    this.focusPreviousInput = this.focusPreviousInput.bind(this);
  }

  componentDidMount() {
    this.answersByQuestionId = {};
    Promise.all([
      this.props.dispatch(actions.fetchUsers()),
      this.props.dispatch(actions.fetchSurvey()),
    ]).then(() => {
      this.props.dispatch(actions.pageLoaded());
      setInterval(() => this.props.dispatch(actions.fetchResponses()), 30e3);
    });
  }

  // All <textarea> and <TextField> used for input are expected to have a class
  // of 'survey-input'. Here, we find the next one available in the DOM.
  // Because this is direct DOM access, it's only to be used for .focus().
  findInput(currentInput, callback) {
    let inputs = document.getElementsByClassName('survey-input');
    inputs = Array.prototype.map.call(inputs, el => {
      if (el.nodeName !== 'TEXTAREA') {
        const textareas = el.querySelectorAll('textarea');
        if (!textareas.length) {
          return false;
        }
        return textareas[textareas.length - 1];
      }
      return el;
    }).filter(el => el);
    if (!inputs.length) {
      return false;
    }

    const index = inputs.findIndex(input => input === currentInput);
    if (index === -1) {
      return false;
    }

    return callback(inputs, index);
  }

  focusNextInput(currentInput) {
    this.findInput(currentInput, (inputs, index) => {
      if ((index + 1) < inputs.length) {
        inputs[index + 1].focus();
      }
    });
  }

  focusPreviousInput(currentInput) {
    this.findInput(currentInput, (inputs, index) => {
      if ((index - 1) > 0) {
        inputs[index - 1].focus();
      }
    });
  }

  render() {
    const { props } = this;
    const paperStyle = { padding: 12, margin: '12px 0' };

    if (props.pageLoading) {
      return (
        <div>
          <nav className="main-nav"><span>Survey Sumo: Admin</span></nav>
          <div className="admin-content">
            <Paper zDepth={2} style={paperStyle}>
              <p className="loading">Loading…</p>
              <div className="loading"><CircularProgress size={2} /></div>
            </Paper>
          </div>
        </div>
      );
    }

    const answersByQuestionId = {};
    const responseCounts = {};
    this.props.questions.forEach(question => {
      answersByQuestionId[question.id] = [];
      responseCounts[question.id] = { question: 0 };
    });
    this.props.answers.forEach(answer => {
      responseCounts[answer.QuestionId][answer.id] = 0;
      answersByQuestionId[answer.QuestionId].push(answer);
    });
    this.props.responses.forEach(response => {
      responseCounts[response.QuestionId].question++;
      responseCounts[response.QuestionId][response.AnswerId]++;
    });

    return (
      <div>
        <nav className="main-nav">
          <a href="/admin/logout" className="sign-in">Sign out</a>
          <span className="current-user">{props.currentUser}</span>
          <div className="title">Survey Sumo: Admin</div>
        </nav>
        <div className="admin-content">
          <Paper zDepth={2} style={paperStyle}>
            <h1>Survey</h1>
            <ul className="questions">
              {props.questions.map(question => (
                <Question
                  key={question.id}
                  question={question}
                  answers={answersByQuestionId[question.id]}
                  responseCounts={responseCounts[question.id]}
                  focusNextInput={this.focusNextInput}
                />
              ))}
              <AddQuestion
                questions={props.questions}
                focusPreviousInput={this.focusPreviousInput}
              />
            </ul>
          </Paper>
          <Paper zDepth={2} style={paperStyle}>
            <h1>Admins</h1>
            <ul className="users">
              {props.users.map(user => (
                <User
                  key={user.email}
                  user={user}
                  currentUser={user.email === props.currentUser}
                />
              ))}
              <AddUser users={props.users} />
            </ul>
          </Paper>
        </div>
      </div>
    );
  }
}

Admin.propTypes = {
  pageLoading: PropTypes.bool.isRequired,
  currentUser: PropTypes.string.isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({
    email: PropTypes.string.isRequired,
  })).isRequired,
  questions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
  })).isRequired,
  answers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    QuestionId: PropTypes.number.isRequired,
    answer: PropTypes.string.isRequired,
  })).isRequired,
  responses: PropTypes.arrayOf(PropTypes.shape({
    QuestionId: PropTypes.number.isRequired,
    AnswerId: PropTypes.number.isRequired,
  })).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect(
  state => state
)(Admin);
