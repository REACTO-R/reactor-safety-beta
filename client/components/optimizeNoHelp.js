import React from 'react'
import {connect} from 'react-redux'
import {fetchQuestion} from '../store/questions'
import {Link} from 'react-router-dom'
import axios from 'axios'
import {Header, Container, Step} from 'semantic-ui-react'

class OptimizeNoHelp extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      loaded: false,
      questionText: '',
      question: ''
    }
  }

  async componentDidMount() {
    let pathnameArr = this.props.location.pathname.split('/')
    let topicId = pathnameArr[2]
    let subtopicId = pathnameArr[3]
    let questionId = pathnameArr[4]

    await this.props.getQuestion(topicId, subtopicId, questionId)
    console.log('prop', this.props)

    let root = this.props.questions.QuestionList

    this.setState({
      questionText: this.props.questions.text,
      answers: root.AQuestions,
      loaded: true
    })
  }

  render() {
    let pathnameArr = this.props.location.pathname.split('/')
    const link = `/${pathnameArr[1]}/${pathnameArr[2]}/${pathnameArr[3]}/${
      pathnameArr[4]
    }`
    const steps = [
      {
        key: 'R',
        title: 'R',
        description: 'Repeat',
        active: true,
        href: link + '/repeat'
      },
      {
        key: 'E',
        title: 'E',
        description: 'Example',
        active: true,
        href: link + '/repeat/example'
      },
      {
        key: 'A',
        title: 'A',
        description: 'Approach',
        active: true,
        href: link + '/repeat/example/approach'
      },
      {
        key: 'CT',
        title: 'CT',
        description: 'Code+Test',
        active: true,
        href: link + '/repeat/example/approach/editor'
      },
      {
        key: 'O',
        title: 'O',
        description: 'Optimize',
        active: true,
        href: link + '/repeat/example/approach/editor/optimize'
      }
    ]

    return (
      <div>
        <Step.Group
          items={steps}
          widths={8}
          size="tiny"
          style={{
            width: '60%',
            display: 'flex',
            margin: 'auto',
            height: '42px',
            backgroundColor: 'blue'
          }}
        />
        {this.state.loaded && (
          <div>
            <br />
            <Container>
              <Header size="large">{this.state.questionText}</Header>
              <Header size="medium">{this.state.question}</Header>
              {this.state.answers.map(answer => {
                return (
                  <div key={answer.id} style={{fontSize: '17px'}}>
                    {answer.optimizationText}
                  </div>
                )
              })}
            </Container>
          </div>
        )}
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    questions: state.questions,
    user: state.user
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getQuestion: (topicId, subtopicId, questionId) =>
      dispatch(fetchQuestion(topicId, subtopicId, questionId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(OptimizeNoHelp)