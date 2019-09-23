/**
 *
 * AddPostFromResource
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Row, Col, Form, Select, Input, Button, Alert, Spin } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectPostFromResource from './selectors';
import reducer from './reducer';
import saga from './saga';
import Header from '../Headerr/Loadable';
import * as actions from './actions';
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
import LoadingOverlay from 'react-loading-overlay';
import Files from 'react-butterfiles';
import isUrl from 'is-url';
import { makeSelectEmail } from '../App/selectors';
import { withRouter } from 'react-router';

const styles = {
  fileList: {
    listStyle: 'none',
    paddingLeft: '0px',
  },
  fileInfo: {
    width: '100%',
    backgroundColor: 'gray',
    borderRadius: '8px',
    padding: '5px',
  },
  clearFile: {
    borderRadius: '50%',
    backgroundColor: 'black',
    color: 'white',
    padding: '1px 15px 1px 15px',
    position: 'relative',
    fontWeight: 'bolder',
    marginLeft: '18px',
    top: '-8px',
  },
  fileDetails: {
    padding: '15px',
    display: 'inline-block',
    lineHeight: 1,
  },
  fileName: {
    color: 'white',
    fontWeight: 'bolder',
    paddingBottom: '0px',
    marginBottom: '2px',
  },

  fileSize: {
    color: 'lightGray',
    fontWeight: 'bolder',
    paddingTop: '0px',
    marginTop: '2px',
  },
};

/* eslint-disable react/prefer-stateless-function */
export class AddPostFromResource extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      errors: [],
      file_txt: '',
    };
  }

  componentDidMount() {
    this.props.reset();
  }

  getBase64 = (file, attribute) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    const a = this;
    reader.onload = function() {
      a.setState({
        [attribute]: reader.result,
      });
    };
    reader.onerror = function(error) {};
  };
  readFileContent(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  }

  handleFileUpload = (e, attribute) => {
    e.persist();
    this.setState({ file_txt: e.target.files[0] });
    this.readFileContent(e.target.files[0]).then((content) => {});
  };

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      values.file_txt = this.state.file_txt;
      values.email = this.props.email;
      values.push = this.props.history.push;
      values.user = 1;
      if (!err) {
        this.props.addPostFromResource(values);
      }
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const { response } = this.props.addPostFromResourceResponse;
    if (response && response.status && response.status === 200) {
      this.props.history.push(`/view/${response.message.post_id}`);
    }

    const { loading } = this.props.addPostFromResourceResponse;
    return (
      <div>
        <Spin tip="Generating..." spinning={loading}>
          <Helmet>
            <title />
            <meta
              name="description"
              content="Description of AddPostFromResource"
            />
          </Helmet>
          <Header history={this.props.history} />
          <div className="container" style={{marginTop:80}}>
            <div className="bg-white">
              <Row>
                <Col span={18} offset={3}>
                  <Form onSubmit={this.handleSubmit} hideRequiredMark={false}>
                    <FormItem label="URL" {...formItemLayout}>
                      {getFieldDecorator('url_path', {})(
                        <Input
                          type="text"
                          placeholder="Enter URL"
                          onChange={(e) => {
                            this.setState({ url_path: e.target.value });
                          }}
                        />,
                      )}
                    </FormItem>

                    <FormItem label="File" {...formItemLayout}>
                      <Files
                        multiple={false}
                        maxSize="2mb"
                        multipleMaxSize="10mb"
                        accept={['application/pdf', 'text/plain']}
                        onSuccess={(files) =>
                          this.setState({ file_txt: files[0].src.file, files })
                        }
                        onError={(errors) => this.setState({ errors })}
                      >
                        {({ browseFiles }) => (
                          <>
                            {!this.state.files.length && (
                              <Button onClick={browseFiles}>Upload File</Button>
                            )}
                            <ul style={styles.fileList}>
                              {this.state.files.map((file) => (
                                <li style={styles.fileInfo} key={file.name}>
                                  <button
                                    onClick={() => {
                                      this.setState({
                                        files: [],
                                        file_txt: null,
                                      });
                                      return false;
                                    }}
                                    style={styles.clearFile}
                                  >
                                    X
                                  </button>
                                  <div style={styles.fileDetails}>
                                    <div style={styles.fileName}>
                                      {file.name}
                                    </div>
                                    <div style={styles.fileSize}>
                                      {file.size} bytes
                                    </div>
                                  </div>
                                </li>
                              ))}
                              {this.state.errors.map((error) => (
                                <li
                                  style={{ color: 'red' }}
                                  key={error.file.name}
                                >
                                  {error.file.name} - {error.type}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </Files>
                    </FormItem>
                    <div style={{ textAlign: 'center' }}>
                      <Button
                        type="primary"
                        htmlType="submit"
                        disabled={
                          !isUrl(this.state.url_path) && !this.state.file_txt
                        }
                      >
                        Publish
                      </Button>
                    </div>
                    {response &&
                      response.status &&
                      response.status !== 201 && (
                        <Alert
                          message="Something went wrong with server please try again!"
                          type="error"
                          showIcon
                          style={{ marginTop: '20px', marginBottom: '0' }}
                        />
                      )}
                  </Form>
                </Col>
              </Row>
            </div>
          </div>
        </Spin>
      </div>
    );
  }
}
const NewForm = Form.create()(AddPostFromResource);
AddPostFromResource.propTypes = {};

const mapStateToProps = createStructuredSelector({
  addPostFromResourceResponse: makeSelectPostFromResource(),
  email: makeSelectEmail(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    addPostFromResource: (payload) => dispatch(actions.addPost(payload)),
    reset: () => dispatch(actions.resetResponse()),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'addPostFromResource', reducer });
const withSaga = injectSaga({ key: 'addNews', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(NewForm);
