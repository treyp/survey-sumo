import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/admin';
import TextField from 'material-ui/lib/text-field';

class AddAnswer extends Component {
  constructor(props) {
    super(props);
    this.state = { answer: '' };
    this.createAnswer = this.createAnswer.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ answer: e.target.value });
  }

  createAnswer(e) {
    e.preventDefault();
    const answer = e.target.value;
    if (!answer) {
      return;
    }

    if (this.props.answers.some(a => a.answer === answer)) {
      alert('That answer already exists for this question.');
      return;
    }

    this.props.dispatch(actions.createAnswer({
      answer,
      QuestionId: this.props.question.id,
    })).then(() => {
      this.setState({ answer: '' });
    });
  }

  render() {
    return (
      <li key="add" className="answer">
        <div className="input-container">
          <div className="padding">
            <TextField
              multiLine
              rows={1}
              hintText="Add a answer"
              value={this.state.answer}
              onEnterKeyDown={this.createAnswer}
              onChange={this.onChange}
              ref="answer"
              className="survey-input"
              fullWidth
            />
          </div>
        </div>
      </li>
    );
  }
}

AddAnswer.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  answers: PropTypes.arrayOf(PropTypes.shape({
    answer: PropTypes.string.isRequired,
  })).isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(AddAnswer);
