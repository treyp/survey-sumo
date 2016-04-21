import React, { PropTypes } from 'react';
import Paper from 'material-ui/lib/paper';
import RadioButton from 'material-ui/lib/radio-button';
import RadioButtonGroup from 'material-ui/lib/radio-button-group';

const answerPrefix = 'answer-';

const Question = ({ question, response, answers, respond }) => (
  <Paper zDepth={2} className="paper">
    <h1 className="question">{question.question}</h1>
    <RadioButtonGroup
      name="answer"
      valueSelected={answerPrefix + response}
      onChange={(e, value) => respond(e, value.slice(answerPrefix.length))}
    >
      {question.answers.map(answerId => (
        <RadioButton
          key={answerId}
          value={answerPrefix + answerId}
          label={answers[answerId]}
          className="answer-choice"
        />
      ))}
    </RadioButtonGroup>
  </Paper>
);

Question.propTypes = {
  respond: PropTypes.func.isRequired,
  question: PropTypes.shape({
    question: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(PropTypes.number.isRequired),
  }).isRequired,
  answers: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
  response: PropTypes.number,
};

export default Question;
