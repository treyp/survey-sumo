import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import * as actions from '../../actions/admin';
import Checkbox from 'material-ui/lib/checkbox';
import TextField from 'material-ui/lib/text-field';

import Answer from './Answer';
import AddAnswer from './AddAnswer';

const colors = ['#FFCDD2', '#BBDEFB', '#C8E6C9', '#E1BEE7', '#B2DFDB',
  '#FFF9C4', '#B2EBF2', '#D7CCC8', '#F48FB1', '#FFECB3'];

class Question extends Component {
  constructor(props) {
    super(props);
    this.updatePublished = this.updatePublished.bind(this);
  }

  deleteQuestion(id) {
    return e => {
      e.preventDefault();

      if (!confirm('Are you sure you want to delete this question? All of ' +
        'its answers and responses will be deleted as well.')) {
        return;
      }

      this.props.dispatch(actions.deleteQuestion(id));
    };
  }

  updateQuestion(focusNext) {
    return e => {
      if (focusNext) {
        e.preventDefault();
      }

      if (e.target.value === this.props.question.question) {
        if (focusNext) {
          this.props.focusNextInput(this.refs.question._getInputNode());
        }
        return;
      }

      this.props.dispatch(actions.updateQuestion({
        question: e.target.value,
      }, this.props.question.id)).then(() => {
        if (focusNext) {
          this.props.focusNextInput(this.refs.question._getInputNode());
        }
      });
    };
  }

  updatePublished(e) {
    e.preventDefault();

    this.props.dispatch(actions.updateQuestion({
      published: !this.props.question.published,
    }, this.props.question.id));
  }

  render() {
    const { question, answers, responseCounts } = this.props;
    const questionResponses = responseCounts.question;
    return (
      <li
        className={
          `question ${question.published ? 'published' : 'unpublished'}`
        }
      >
        <a
          className="material-icons delete"
          onClick={this.deleteQuestion(question.id)}
        >
          
        </a>
        <div className="input-container">
          <TextField
            multiLine
            rows={1}
            hintText="Question"
            defaultValue={question.question}
            onEnterKeyDown={this.updateQuestion(true)}
            onBlur={this.updateQuestion(false)}
            ref="question"
            className="survey-input"
            fullWidth
            style={{
              fontSize: 24,
              lineHeight: '36px',
            }}
          />
        </div>
        <ul className="answers">
          {answers.map((answer, index) => (
            <Answer
              key={answer.id}
              question={question}
              questionResponses={questionResponses}
              answer={answer}
              answerResponses={responseCounts[answer.id]}
              focusNextInput={this.props.focusNextInput}
              color={colors[index % colors.length]}
            />
            ))}
          <AddAnswer
            question={question}
            answers={answers}
          />
        </ul>
        <div className="question-stats">
          <Checkbox
            label="Published"
            defaultChecked={question.published}
            onCheck={this.updatePublished}
            style={{
              display: 'inline-block',
              width: 'auto',
              verticalAlign: 'bottom',
            }}
            labelStyle={{ marginLeft: -16 }}
          />
          <span className="bullet">•</span>
          {questionResponses} Response{questionResponses === 1 ? '' : 's'}
        </div>
      </li>
    );
  }
}

Question.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.number.isRequired,
    question: PropTypes.string.isRequired,
    published: PropTypes.bool.isRequired,
  }).isRequired,
  answers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    answer: PropTypes.string.isRequired,
  })).isRequired,
  responseCounts: PropTypes.objectOf(PropTypes.number.isRequired).isRequired,
  focusNextInput: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
};

export default connect()(Question);
