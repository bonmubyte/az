import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';

import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Form, Icon, Input, Button, Row, Col, Alert, notification } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectSignup from './selectors';
import reducer from './reducer';
import saga from './saga';
import * as a from './actions';
import {sendVerificationEmail} from './api';
const FormItem = Form.Item;

/* eslint-disable react/prefer-stateless-function */
export class Signup extends React.Component {
  componentDidMount(){
    this.props.reset();
  }
  handleLogin = () => {
    this.props.history.push(`/`);
  };

  handleSubmit = e => {
    e.preventDefault();

    this.props.form.validateFields((err, values) => {
      if (!err) {
        this.props.createAccount(values);
        setTimeout(() => {
          const { response } = this.props.signup;
          if (response && response.status && response.status === 201) {
            notification["success"]({
              message: 'Account created',
              description: 'Your account has been created successfuly. ',
            })
            sendVerificationEmail(values.email);
            this.props.history.push('/');
          }
        }, 3000);
      }
    });
  };

  handleErrors = () => {
    const { response } = this.props.signup;
    if (response && response.message && response.message.non_field_errors) {
      return response.message.non_field_errors;
    }
    if (response && response.message && response.message.email) {
      return response.message.email;
    }
    if (response && response.message && response.message.password1) {
      return response.message.password1;
    }
    return 'Something went wrong';
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { response } = this.props.signup;

    return (
      <div>
        <Helmet>
          <title>Signup</title>
          <meta name="description" content="Description of Signup" />
        </Helmet>
        <Row justify="center">
          <Col span={8} offset={8}>
            <div className="wrapper">
              <Icon type="smile" className="logo" theme="outlined" />
              <h3>Create your Articlize Account!</h3>
              <Form onSubmit={this.handleSubmit} className="login-form">
                <FormItem>
                  {getFieldDecorator('username', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your username!',
                      },
                    ],
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="user"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      placeholder="Username"
                    />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('email', {
                    rules: [
                      {
                        required: true,
                        message: 'Please input your email!',
                      },
                    ],
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="mail"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      placeholder="Email"
                    />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('password1', {
                    rules: [
                      {
                        required: true,
                        message: 'Please enter your Password!',
                      },
                    ],
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      type="password"
                      placeholder="Password"
                    />,
                  )}
                </FormItem>
                <FormItem>
                  {getFieldDecorator('password2', {
                    rules: [
                      {
                        required: true,
                        message: 'Please confirm password!',
                      },
                    ],
                  })(
                    <Input
                      prefix={
                        <Icon
                          type="lock"
                          style={{ color: 'rgba(0,0,0,.25)' }}
                        />
                      }
                      type="password"
                      placeholder="Confirm Password"
                    />,
                  )}
                </FormItem>
                <div className="first-mode">
                  <h5>Sign Up as Newsroom</h5>
                  <FormItem>
                    {getFieldDecorator('first_mode', {
                      rules: [

                      ],
                    })(
                      <Input
                        type="checkbox"
                      />,
                    )}
                  </FormItem>
                </div>
                <div classname="terms">
                  <h5>By clicking Register, you agree to our<a href = "https://www.articlize.news/terms-of-service"> Terms of Agreement </a>, <a href = "https://www.articlize.news/privacy-policy">Privacy Policy </a>, and <a href = "https://www.articlize.news/copyright-policy">CopyRight Policy</a>. 
                  You may receive email notifications from Articlize and can opt out any time.
                  </h5>
                </div>
                {response &&
                  response.status &&
                  response.status !== 201 && (
                    <Alert
                      message={
                        this.handleErrors()
                      }
                      type="error"
                      showIcon
                    />
                  )}

                <FormItem>
                  <Button
                    style = {{backgroundColor: '#9e419b', color: '#ffffff'}}
                    type="primary"
                    className="login-form-button"
                    htmlType="submit"
                  >
                    Register <Icon type="arrow-right" />
                  </Button>

                  <div className="content-divider signup">
                    <span>Already have an account?</span>
                  </div>
                  <Button
                    style = {{backgroundColor: '#9e419b', color: '#ffffff'}}
                    type="secondary"
                    block
                    className="btn-success signup-btn"
                    onClick={this.handleLogin}
                  >
                    Back to Login Page
                  </Button>
                </FormItem>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    );
  }
}
const SignupForm = Form.create()(Signup);

Signup.propTypes = {};

const mapStateToProps = createStructuredSelector({
  signup: makeSelectSignup(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    createAccount: payload => dispatch(a.createAccount(payload)),
    reset: () => dispatch(a.resetResponse()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'signup', reducer });
const withSaga = injectSaga({ key: 'signup', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(SignupForm);
