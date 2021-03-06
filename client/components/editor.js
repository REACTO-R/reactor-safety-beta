import React from 'react'
import brace from 'brace'
import {connect} from 'react-redux'
import AceEditor from 'react-ace'
import {Link} from 'react-router-dom'
import axios from 'axios'
import 'brace/mode/javascript'
import 'brace/theme/monokai'
import {fetchQuestion} from '../store/questions'
import {
  List,
  Header,
  Card,
  Container,
  Button,
  Icon,
  Step,
  Grid
} from 'semantic-ui-react'
import {expect} from 'chai'

export class Editor extends React.Component {
  constructor() {
    super()
    this.state = {
      code: '',
      isWorking: 0, // 0: default state; 1: if the user func works; 2: if user func doesn't work
      errorMessage: '',
      results: [],
      questionid: 0,
      saveStatus: '',
      saveStatusColor: ''
    }
    this.onChange = this.onChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.saveCode = this.saveCode.bind(this)
  }

  async componentDidMount() {
    let pathnameArr = this.props.location.pathname.split('/')
    let topicId
    let subtopicId
    let questionId
    if (this.props.location.pathname.includes('nohelp')) {
      topicId = pathnameArr[2]
      subtopicId = pathnameArr[3]
      questionId = pathnameArr[4]
    } else {
      topicId = pathnameArr[1]
      subtopicId = pathnameArr[2]
      questionId = pathnameArr[3]
    }

    await this.props.getQuestion(topicId, subtopicId, questionId)
    this.setState({
      questionid: this.props.questions.id
    })
    const {data} = await axios.get('/api/users/' + this.props.userId)
    const userData = data.userQuestions.find(userQ => {
      return userQ.questionId === Number(this.props.questions.id)
    })
    if (userData.CTAnswer) {
      this.setState({code: userData.CTAnswer})
    }
    console.log(userData)
  }

  onChange(newValue) {
    if (this.state.isWorking !== 0) {
      this.setState({isWorking: 0})
    }
    if (this.state.errorMessage) {
      this.setState({errorMessage: ''})
    }
    this.setState({code: newValue})
  }

  async saveCode() {
    let statusStr
    try {
      await axios.put(
        '/api/users/' + this.props.userId + '/' + this.state.questionid,
        {
          propUpdate: 'CTAnswer',
          CTAnswer: this.state.code
        }
      )
      statusStr = 'Code saved successfully!'
      this.setState({saveStatusColor: 'green'})
    } catch (err) {
      console.log(err)
      statusStr =
        "Error with saving code! (If you're a dev, check the console.)"
      this.setState({saveStatusColor: 'red'})
    }
    this.setState({saveStatus: statusStr})
  }

  async handleClick() {
    try {
      const tests = this.props.questions.CTStuffs
      let userFunc = new Function(`return ${this.state.code}`)()
      let resultArr = tests.map(test => {
        let result
        try {
          let input = JSON.parse(test.Input)
          let output
          if (test.Output === 'undefined') {
            output = undefined
          } else {
            output = JSON.parse(test.Output)
          }
          result = userFunc(...input)
          expect(result).to.be.deep.equal(output)
          return {passed: true, output: result}
        } catch (err) {
          const error = new Error(err)
          return {passed: false, output: result, error: error.message}
        }
      })
      this.setState({results: resultArr})
    } catch (err) {
      const error = new Error(err)
      this.setState({errorMessage: error.message})
    }
  }
  async handleForward() {
    try {
      await axios.put(
        '/api/users/' + this.props.userId + '/' + this.state.questionid,
        {
          propUpdate: 'CTQuestion'
        }
      )
    } catch (err) {
      console.log(err)
    }
  }

  render() {
    let pathnameArr = this.props.location.pathname.split('/')
    const link = `/${pathnameArr[1]}/${pathnameArr[2]}/${pathnameArr[3]}`

    const {
      isWorking,
      errorMessage,
      code,
      results,
      saveStatus,
      saveStatusColor
    } = this.state
    const tests = this.props.questions.CTStuffs
    const checkResults =
      !!results.length && results.every(el => el.passed === true)
    return (
      <div>
        <Step.Group
          widths={8}
          size="tiny"
          style={{
            width: '60%',
            display: 'flex',
            margin: 'auto',
            height: '42px'
          }}
        >
          <Step active>
            <Link to={link + '/repeat'}>
              <Step.Content>
                <Step.Title>R</Step.Title>
                <Step.Description>Repeat</Step.Description>
              </Step.Content>
            </Link>
          </Step>
          <Step active>
            <Link to={link + '/repeat/example'}>
              <Step.Content>
                <Step.Title>E</Step.Title>
                <Step.Description>Example</Step.Description>
              </Step.Content>
            </Link>
          </Step>
          <Step active>
            <Link to={link + '/repeat/example/approach'}>
              <Step.Content>
                <Step.Title>A</Step.Title>
                <Step.Description>Approach</Step.Description>
              </Step.Content>
            </Link>
          </Step>
          <Step active>
            <Link to={this.props.history.location.pathname}>
              <Step.Content>
                <Step.Title>CT</Step.Title>
                <Step.Description>Code+Test</Step.Description>
              </Step.Content>
            </Link>
          </Step>
          <Step disabled>
            <Step.Content>
              <Step.Title>O</Step.Title>
              <Step.Description>Optimize</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>
        <div>
          <br />
          <Header size="large"> {this.props.questions.text} </Header>
          <Grid>
            <Grid.Column width={8}>
              <AceEditor
                mode="javascript"
                theme="monokai"
                value={code}
                onChange={this.onChange}
                enableLiveAutocompletion={true}
                name="UNIQUE_ID_OF_DIV"
                editorProps={{
                  $blockScrolling: true
                }}
              />
            </Grid.Column>
            {tests && (
              <Grid.Column width={8}>
                <List>
                  {tests.map((elem, idx) => {
                    return (
                      <List.Item key={elem.id}>
                        <Card style={{padding: '10px', margin: '0px'}}>
                          <Card.Header> INPUT: </Card.Header>
                          <Card.Meta> {elem.Input.slice(1, -1)} </Card.Meta>
                          <Card.Header> OUTPUT: </Card.Header>
                          <Card.Meta> {elem.Output} </Card.Meta>
                          {!results.length ? null : results[idx].passed ? (
                            <p style={{color: '#32CD32'}}>You passed</p>
                          ) : (
                            <p style={{color: 'red'}}>
                              You failed. Your output:{' '}
                              {JSON.stringify(results[idx].output)} Error:{' '}
                              {results[idx].error}
                            </p>
                          )}
                        </Card>
                        <br />
                      </List.Item>
                    )
                  })}
                  {errorMessage && (
                    <Card>
                      <Card.Header style={{color: 'red'}}>
                        {errorMessage}
                      </Card.Header>
                    </Card>
                  )}
                </List>
              </Grid.Column>
            )}
          </Grid>
          <Button onClick={this.handleClick}>run</Button>
          {isWorking === 0 ? null : isWorking === 1 ? (
            <p>Your Func is right</p>
          ) : (
            <p>Your func is not right, sorry</p>
          )}
          <Button
            onClick={() => {
              this.saveCode()
            }}
          >
            Save Code
          </Button>
          {saveStatus && (
            <span style={{color: saveStatusColor}}>{saveStatus}</span>
          )}
        </div>
        <Button disabled={!checkResults} color="green">
          <Link
            style={{color: 'white'}}
            to={this.props.history.location.pathname + '/optimize'}
            onClick={() => {
              this.handleForward()
            }}
          >
            GO NEXT <Icon name="right arrow" />
          </Link>
        </Button>
      </div>
    )
  }
}

const mapStateToProps = state => {
  return {
    questions: state.questions,
    userId: state.user.id
  }
}

const mapDispatchToProps = dispatch => {
  return {
    getQuestion: (topicId, subtopicId, questionId) =>
      dispatch(fetchQuestion(topicId, subtopicId, questionId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Editor)
