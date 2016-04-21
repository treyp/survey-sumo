import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/admin';
import TextField from 'material-ui/lib/text-field';

class AddQuestion extends Component {
  constructor(props) {
    super(props);
    this.state = { question: '' };
    this.createQuestion = this.createQuestion.bind(this);
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ question: e.target.value });
  }

  createQuestion(e) {
    e.preventDefault();
    const question = e.target.value;
    if (!question) {
      return;
    }

    if (this.props.questions.some(q => q.question === question)) {
      if (!confirm('You already have a question with that text. Are you sure ' +
        'you want to create another one?')) {
        return;
      }
    }

    this.props.dispatch(actions.createQuestion({ question })).then(() => {
      this.setState({ question: '' });
      this.props.focusPreviousInput(this.refs.question._getInputNode());
    });
  }

  render() {
    return (
      <li key="add" className="question">
        <div className="input-container">
          <TextField
            multiLine
            rows={1}
            hintText="Add a question"
            value={this.state.question}
            onEnterKeyDown={this.createQuestion}
            onChange={this.onChange}
            ref="question"
            className="survey-input"
            fullWidth
            style={{
              fontSize: 24,
              lineHeight: '36px',
            }}
          />
        </div>
      </li>
    );
  }
}

AddQuestion.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
  })).isRequired,
  focusPreviousInput: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(AddQuestion);
