import React, { PropTypes } from 'react';
import Paper from 'material-ui/lib/paper';
import { Toolbar, ToolbarGroup, ToolbarTitle } from 'material-ui/lib/toolbar';
import { List, ListItem } from 'material-ui/lib/lists';

const PreviousResponses = ({ loadQuestion, responses, questions, answers }) => (
  <Paper zDepth={2} className="paper previously-answered">
    <Toolbar>
      <ToolbarGroup>
        <ToolbarTitle text="Previously answered" />
      </ToolbarGroup>
    </Toolbar>
    <List style={{ paddingTop: 0, paddingBottom: 0 }}>
      {responses.map((response) => (
        <ListItem
          key={response.QuestionId}
          onClick={loadQuestion(response.QuestionId)}
          primaryText={questions[response.QuestionId].question}
          secondaryText={answers[response.AnswerId]}
          innerDivStyle={{ paddingLeft: 24 }}
        />
      ))}
    </List>
  </Paper>
);

PreviousResponses.propTypes = {
  loadQuestion: PropTypes.func.isRequired,
  questions: PropTypes.objectOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(PropTypes.number.isRequired),
  })).isRequired,
  answers: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
  responses: PropTypes.arrayOf(PropTypes.shape({
    AnswerId: PropTypes.number.isRequired,
    QuestionId: PropTypes.number.isRequired,
  })).isRequired,
};

export default PreviousResponses;
