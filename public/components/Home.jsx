import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { fetchHome, saveResponse, pageLoaded } from '../actions/home';
import Paper from 'material-ui/lib/paper';
import CircularProgress from 'material-ui/lib/circular-progress';
import Question from './home/Question';
import NoQuestions from './home/NoQuestions';
import PreviousResponses from './home/PreviousResponses';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { currentQuestion: null };
    this.respond = this.respond.bind(this);
    this.loadQuestion = this.loadQuestion.bind(this);
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchHome()).then(() => {
      dispatch(pageLoaded());
      this.unansweredQuestion();
    }).catch(() => null);
  }

  unansweredQuestion() {
    let id = null;
    const answered = {};
    this.props.responses.forEach(r => { answered[r.QuestionId] = true; });
    const unanswered =
      Object.keys(this.props.questions).filter(q => !answered[q]);
    if (unanswered.length) {
      id = unanswered[Math.floor(Math.random() * unanswered.length)];
    }

    this.setState({ currentQuestion: id });
  }

  loadQuestion(questionId) {
    return () => {
      this.setState({ currentQuestion: questionId });
    };
  }

  respond(e, answerId) {
    this.props.dispatch(saveResponse(answerId)).then(() => {
      this.unansweredQuestion();
    }).catch(() => null);
  }

  render() {
    const props = this.props;

    if (props.pageLoading) {
      return (
        <div className="page">
          <Paper zDepth={2} className="paper">
            <p className="loading">Loading…</p>
            <div className="loading"><CircularProgress size={2} /></div>
          </Paper>
        </div>
      );
    }

    let displayQuestion = null;
    if (this.state.currentQuestion) {
      let question = props.questions[this.state.currentQuestion];
      let response = null;
      props.responses.some(r => {
        if (r.QuestionId === this.state.currentQuestion) {
          response = r.AnswerId;
          return true;
        }
        return false;
      });
      displayQuestion = (
        <Question
          question={question}
          response={response}
          answers={props.answers}
          respond={this.respond}
        />
      );
    } else if (!Object.keys(props.questions).length) {
      displayQuestion = (
        <NoQuestions
          message="This survey has not been published yet. Try again later!"
          type="none"
        />
      );
    } else {
      displayQuestion =
        <NoQuestions type="done" message="You've finished the survey!" />;
    }

    return (
      <div className="page">
        {displayQuestion}
        {props.responses.length ?
          <PreviousResponses
            loadQuestion={this.loadQuestion}
            questions={props.questions}
            responses={props.responses}
            answers={props.answers}
          /> : ''}
      </div>
    );
  }
}

Home.propTypes = {
  pageLoading: PropTypes.bool.isRequired,
  questions: PropTypes.objectOf(PropTypes.shape({
    question: PropTypes.string.isRequired,
    answers: PropTypes.arrayOf(PropTypes.number.isRequired),
  })).isRequired,
  answers: PropTypes.objectOf(PropTypes.string.isRequired).isRequired,
  responses: PropTypes.arrayOf(PropTypes.shape({
    AnswerId: PropTypes.number.isRequired,
    QuestionId: PropTypes.number.isRequired,
  })),
  session: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
  const props = Object.assign({}, state);
  props.answers = {};
  props.questions = {};
  state.questions.forEach(question => {
    const answers = [];
    question.Answers.forEach(answer => {
      props.answers[answer.id] = answer.answer;
      answers.push(answer.id);
    });
    props.questions[question.id] = {
      question: question.question,
      answers,
    };
  });
  props.responses = props.responses.filter(response =>
    props.questions[response.QuestionId] && props.answers[response.AnswerId]);
  return props;
}

export default connect(
  mapStateToProps
)(Home);
