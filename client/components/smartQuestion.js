import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {dispatch} from 'redux'
import {fetchQuestions} from '../store/questions'
import {Link} from 'react-router-dom'
import {logout} from '../store'
import DumbQuestion from './dumbQuestion'
import { List, Button, Header, Container, Segment, Dimmer, Loader } from 'semantic-ui-react'


class Question extends  React.Component {

    constructor(props){
        super(props)
        this.state = {
            loaded: false,
            question: '',
            answers: '',
            currentLink: this.props.history.location.pathname,
            linkToNext: ''
        }
    }

    async componentWillMount(){
         await this.props.getAllQuestions()
        
            
        //Find next link
        let linkToNext ='';
        // console.log('STATE', this.state)
        // console.log('PATH', this.props.history.location.pathname)
        if(this.state.currentLink.includes('repeat')){
            this.setState({linkToNext:'/example'})
            this.setState({question: this.props.questions[0].SubTopics[0].Questions[0].QuestionList.RQuestion})
            this.setState({answers: this.props.questions[0].SubTopics[0].Questions[0].QuestionList.RQuestions})
            this.setState({loaded: true})
        } else if(this.state.currentLink.includes('example')){
            this.setState({linkToNext: '/approach'})
            this.setState({question: this.props.questions[0].SubTopics[0].Questions[0].QuestionList.EQuestion})
            this.setState({answers: this.props.questions[0].SubTopics[0].Questions[0].QuestionList.EQuestions})
            this.setState({loaded: true})
        } else {
            this.setState({linkToNext: '/editor'})
            this.setState({question: this.props.questions[0].SubTopics[0].Questions[0].QuestionList.AQuestion})
            this.setState({answers: this.props.questions[0].SubTopics[0].Questions[0].QuestionList.AQuestions})
            this.setState({loaded: true})
        }
         
         
    }

    render(){
        



        let clickHandlerArr = [];
        if(this.state.loaded){
            
            this.state.answers.forEach(element => {
                clickHandlerArr.push(function(element){
                    console.log(element.correct)
                });
        })
    }
       
       
        
        return (
            <div>
            {this.state.loaded &&

            <DumbQuestion question={this.state.question} answers ={this.state.answers} clickHandlers ={clickHandlerArr} linkToNext={this.props.history.location.pathname + this.state.linkToNext}/>
            }
        </div>
            
        )
           
    
}
}   


const mapStateToProps = (state) => {
    return {
        questions: state.questions,
       
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        getAllQuestions: () => dispatch(fetchQuestions())
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Question)