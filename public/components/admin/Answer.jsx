import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/admin';
import TextField from 'material-ui/lib/text-field';

class Answer extends Component {
  deleteAnswer(id) {
    return e => {
      e.preventDefault();

      let prompt = 'Are you sure you want to delete this answer?';
      if (this.props.questionResponses) {
        prompt = `${prompt} All of the responses to it will be deleted as \
well. This will skew the current results.`;
      }
      if (!confirm(prompt)) {
        return;
      }

      this.props.dispatch(actions.deleteAnswer(id));
    };
  }

  updateAnswer(focusNext = true) {
    return e => {
      if (focusNext) {
        e.preventDefault();
      }

      if (e.target.value === this.props.answer.answer) {
        if (focusNext) {
          this.props.focusNextInput(this.refs.answer._getInputNode());
        }
        return;
      }

      this.props.dispatch(actions.updateAnswer({
        answer: e.target.value,
      }, this.props.answer.id)).then(() => {
        if (focusNext) {
          this.props.focusNextInput(this.refs.answer._getInputNode());
        }
      });
    };
  }

  render() {
    const { questionResponses, answer, answerResponses, color } = this.props;
    let viz = <div className="viz no-responses">No responses</div>;
    if (questionResponses) {
      const percentage = questionResponses ?
        (answerResponses / questionResponses) * 100 : 0;
      viz = (
        <div className="viz">
          <div className="bar" style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
          ></div>
          <span className="label">
            <span className="responses">
              {answerResponses}
            </span> <span className="percentage">
              ({percentage.toFixed(1)}%)
            </span>
          </span>
        </div>
      );
    }

    return (
      <li className="answer">
        <a
          className="material-icons delete"
          onClick={this.deleteAnswer(answer.id)}
        >
          
        </a>
        <div className="input-container">
          <div className="padding">
            <TextField
              multiLine
              rows={1}
              hintText="Answer"
              defaultValue={answer.answer}
              onEnterKeyDown={this.updateAnswer(true)}
              onBlur={this.updateAnswer(false)}
              ref="answer"
              className="survey-input"
              fullWidth
            />
          </div>
        </div>
        {viz}
      </li>
    );
  }
}

Answer.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
  }).isRequired,
  questionResponses: PropTypes.number.isRequired,
  answer: PropTypes.shape({
    id: PropTypes.number.isRequired,
    answer: PropTypes.string.isRequired,
  }).isRequired,
  answerResponses: PropTypes.number.isRequired,
  focusNextInput: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Answer);
