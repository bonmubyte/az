/**
 *
 * AddNews
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import Files from 'react-butterfiles';
import { makeSelectEmail } from '../App/selectors';
import {
  Row,
  Col,
  Form,
  Select,
  Input,
  Button,
  Alert,
  Spin,
  Tabs,
  Radio,
} from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectAddNews from './selectors';
import reducer from './reducer';
import saga from './saga';
import Header from '../Headerr/Loadable';
import * as a from './actions';
import * as appActions from '../App/actions';
import { makeSelectResourceSummary } from '../App/selectors';
import { withRouter } from 'react-router';

import axios from '../../utils/http';
const qs = require('querystring');
axios.defaults.timeout = 180000;

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;

/* eslint-disable react/prefer-stateless-function */
export class AddNews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      thumbnail_image: '',
      embedded_image: '',
      value: 1,
      // for resource
      files: [],
      errors: [],
      file_txt: '',
      url: '',
      loadingResouce: false,
      result: null,
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

  handleFileUpload(e, attribute) {
    e.persist();
    this.getBase64(e.target.files[0], attribute);
  }

  handleMain = e => {
    console.log('value ' + e.target.value);
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      values.embedded_image = this.state.embedded_image;
      values.thumbnail_image = this.state.thumbnail_image;
      const user = JSON.parse(localStorage.getItem('user')) || {};
      values.user = user['id'];
      if (!err) {
        this.props.addPost(values);
      }
    });
  };

  //  for resource
  readFileContentResource(file) {
    const reader = new FileReader();
    return new Promise((resolve, reject) => {
      reader.onload = event => resolve(event.target.result);
      reader.onerror = error => reject(error);
      reader.readAsText(file);
    });
  }

  handleFileUploadResource = (e, attribute) => {
    e.persist();
    this.setState({ file_txt: e.target.files[0] });
    this.readFileContentResource(e.target.files[0]).then(content => {});
  };

  onChangeUrl = e => {
    this.setState({ url: e.target.value });
    console.log(this.state.url);
  };

  handleSubmitResource = e => {
    e.preventDefault();
    console.log('clicked', this.props.email);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    this.setState({ loadingResouce: true });
    const formData = new FormData();
    formData.append('file_txt', this.state.file_txt);
    formData.append('url_path', this.state.url);
    formData.append('email', this.props.email);
    // return axios.post('api/generate_graph/', formData, config);

    axios
      .post('api/generate_graph/', formData)
      .then(response => {
        this.setState({ result: response.data });
        this.setState({ loadingResouce: false });
        this.setState({ jigar: 'nnananna' });
        console.log(this.state.result);
        this.setState({
          files: [],
          file_txt: null,
        });
      })
      .catch(function(error) {
        console.log(error);
      });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
    };
    const { response } = this.props.addNews;

    if (response && response.status && response.status === 201) {
      this.props.reset();
      this.props.resetResource({});
      this.props.history.push(`/view/${response.message.id}`);
    }
    const { loading } = this.props.addNews;
    return (
      <div
        style={
          {
            // minWidth: 1250,
          }
        }
      >
        <Spin tip="Generating..." spinning={this.state.loadingResouce}>
          <Spin tip="Generating..." spinning={loading}>
            <Helmet>
              <title>AddNews</title>
              <meta name="description" content="Description of AddNews" />
            </Helmet>
            <Header history={this.props.history} />
            <div className="container">
              <div className="bg-white">
                ,
                <Row>
                  <Col offset={3} span={20}>
                    <Tabs defaultActiveKey="1">
                      <TabPane tab="Publish Manually" key="1" />
                      <TabPane tab="Publish Existing Article" key="2">
                        <Form
                          onSubmit={this.handleSubmitResource}
                          hideRequiredMark={false}
                        >
                          <FormItem label="Enter URL" {...formItemLayout}>
                            {getFieldDecorator('url', {
                              rules: [
                                {
                                  required: false,
                                  message: 'Enter URL',
                                },
                              ],
                            })(
                              <Input
                                type="text"
                                placeholder="Enter URL"
                                onChange={this.onChangeUrl}
                              />,
                            )}
                          </FormItem>

                          <FormItem label="File" {...formItemLayout}>
                            <Files
                              multiple={false}
                              maxSize="2mb"
                              multipleMaxSize="10mb"
                              accept={['application/pdf', 'text/plain']}
                              onSuccess={files =>
                                this.setState({
                                  file_txt: files[0].src.file,
                                  files,
                                })
                              }
                              onError={errors => this.setState({ errors })}
                            >
                              {({ browseFiles }) => (
                                <>
                                  {/* {!this.state.files.length && ( */}
                                  <Button onClick={browseFiles}>
                                    Upload File
                                  </Button>
                                  {/* // )} */}
                                  {/* <ul style={styles.fileList}>
                                  {this.state.files.map(file => (
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
                                  {this.state.errors.map(error => (
                                    <li
                                      style={{ color: 'red' }}
                                      key={error.file.name}
                                    >
                                      {error.file.name} - {error.type}
                                    </li>
                                  ))}
                                </ul> */}
                                </>
                              )}
                            </Files>
                          </FormItem>

                          <Row>
                            <Col offset={4}>
                              <FormItem>
                                <Button type="primary" htmlType="submit">
                                  Process URL/File
                                </Button>
                              </FormItem>
                            </Col>
                          </Row>
                        </Form>
                      </TabPane>
                    </Tabs>
                  </Col>
                </Row>
                <Row>
                  <Col span={20} offset={3}>
                    <Form onSubmit={this.handleSubmit} hideRequiredMark={false}>
                      <FormItem label="Title" {...formItemLayout}>
                        {getFieldDecorator('title', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter your title!',
                            },
                          ],
                          initialValue:
                            this.state.result && this.state.result.title
                              ? this.state.result.title
                              : '',
                        })(
                          <Input
                            type="text"
                            placeholder="Please enter your title"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Thumbnail image" {...formItemLayout}>
                        {getFieldDecorator('thumbnail_image', {})(
                          <div>
                            <input
                              style={{ display: 'none' }}
                              className="one-upload-thumbnail"
                              onChange={e =>
                                this.handleFileUpload(e, 'thumbnail_image')
                              }
                              type="file"
                            />
                            <Button
                              onClick={() =>
                                document
                                  .querySelector('.one-upload-thumbnail')
                                  .click()
                              }
                            >
                              Upload
                            </Button>
                          </div>,
                        )}
                      </FormItem>
                      <FormItem
                        {...formItemLayout}
                        label="Category"
                        hasFeedback
                      >
                        {getFieldDecorator('category', {
                          rules: [
                            {
                              required: true,
                              message: 'Please select your category',
                            },
                          ],
                          initialValue:
                            this.state.result && this.state.result.category,
                        })(
                          <Select placeholder="Select category">
                            <Option value="Economy">Society</Option>
                            <Option value="Politics">Culture</Option>
                            <Option value="Entertainment">Sports</Option>
                          </Select>,
                        )}
                      </FormItem>
                      <FormItem label="Author" {...formItemLayout}>
                        {getFieldDecorator('author', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter author name',
                            },
                          ],
                          initialValue:
                            this.state.result && this.state.result.author,
                        })(
                          <Input
                            type="text"
                            placeholder="Please enter author name"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Author description" {...formItemLayout}>
                        {getFieldDecorator('author_description', {
                          initialValue:
                            this.state.result &&
                            this.state.result.author_description
                              ? this.state.result.author_description
                              : '',
                        })(
                          <TextArea
                            type="text"
                            placeholder="Please enter author description"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Source URL" {...formItemLayout}>
                        {getFieldDecorator('source', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter source',
                            },
                          ],
                          initialValue:
                            this.state.result && this.state.result.source,
                        })(
                          <Input
                            type="text"
                            placeholder="Please enter source"
                          />,
                        )}
                      </FormItem>

                      <FormItem label="Select Your Main Sentence" {...formItemLayout}>
                        {/* {getFieldDecorator('Place in frontpage?', { */}
                        {getFieldDecorator('main_sentence_number', {})(
                          <RadioGroup
                            onChange={this.handleMain}
                            defaultValue={1}
                          >
                            Sentence no 1
                            <Radio style={{ marginLeft: 10 }} value={1} />
                            Sentence no 2
                            <Radio style={{ marginLeft: 10 }} value={2} />
                            Sentence no 3
                            <Radio style={{ marginLeft: 10 }} value={3} />
                            Sentence no 4
                            <Radio style={{ marginLeft: 10 }} value={4} />
                            Sentence no 5
                            <Radio style={{ marginLeft: 10 }} value={5} />
                          </RadioGroup>,
                        )}
                      </FormItem>

                      <FormItem label="Sentence 1" {...formItemLayout}>
                        {getFieldDecorator('main_sentence', {
                          rules: [
                            {
                              required: true,
                              message: 'Please write something here',
                            },
                          ],
                          initialValue:
                            this.state.result &&
                            this.state.result.main_sentence,
                        })(
                          <TextArea
                            type="text"
                            placeholder="Please write something here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Sentence 2" {...formItemLayout}>
                        {getFieldDecorator('sentence2', {
                          rules: [],
                          initialValue:
                            this.state.result && this.state.result.sentence2
                              ? this.state.result.sentence2
                              : '',
                        })(
                          <TextArea
                            type="text"
                            placeholder="Please write something here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Sentence 3" {...formItemLayout}>
                        {getFieldDecorator('sentence3', {
                          rules: [],
                          initialValue:
                            this.state.result && this.state.result.sentence3
                              ? this.state.result.sentence3
                              : '',
                        })(
                          <TextArea
                            type="text"
                            placeholder="Please write something here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Sentence 4" {...formItemLayout}>
                        {getFieldDecorator('sentence4', {
                          rules: [],
                          initialValue:
                            this.state.result && this.state.result.sentence4
                              ? this.state.result.sentence4
                              : '',
                        })(
                          <TextArea
                            type="text"
                            placeholder="Please write something here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Sentence 5" {...formItemLayout}>
                        {getFieldDecorator('sentence5', {
                          rules: [],
                          initialValue:
                            this.state.result && this.state.result.sentence5
                              ? this.state.result.sentence5
                              : '',
                        })(
                          <TextArea
                            type="text"
                            placeholder="Please write something here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Keyword 1" {...formItemLayout}>
                        {getFieldDecorator('people1', {
                          rules: [
                            {
                              required: true,
                              message: 'Please enter name here',
                            },
                          ],

                          initialValue:
                            this.state.result && this.state.result.people1,
                        })(
                          <Input
                            type="text"
                            placeholder="Please enter name here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Keyword 2" {...formItemLayout}>
                        {getFieldDecorator('people2', {
                          rules: [
                            {
                              message: 'Please enter name here',
                            },
                          ],
                          initialValue:
                            this.state.result && this.state.result.people2
                              ? this.state.result.people2
                              : '',
                        })(
                          <Input
                            type="text"
                            placeholder="Please enter name here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Keyword 3" {...formItemLayout}>
                        {getFieldDecorator('people3', {
                          rules: [
                            {
                              message: 'Please enter name here',
                            },
                          ],
                          initialValue:
                            this.state.result && this.state.result.people3
                              ? this.state.result.people3
                              : '',
                        })(
                          <Input
                            type="text"
                            placeholder="Please enter name here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Keyword 4" {...formItemLayout}>
                        {getFieldDecorator('people4', {
                          rules: [
                            {
                              message: 'Please enter name here',
                            },
                          ],
                          initialValue:
                            this.state.result && this.state.result.people4
                              ? this.state.result.people4
                              : '',
                        })(
                          <Input
                            type="text"
                            placeholder="Please enter name here"
                          />,
                        )}
                      </FormItem>
                      <FormItem label="Card News" {...formItemLayout}>
                        {getFieldDecorator('embedded_image', {})(
                          <div>
                            <input
                              style={{ display: 'none' }}
                              className="one-upload"
                              onChange={e =>
                                this.handleFileUpload(e, 'embedded_image')
                              }
                              type="file"
                            />
                            <Button
                              onClick={() =>
                                document.querySelector('.one-upload').click()
                              }
                            >
                              Upload
                            </Button>
                          </div>,
                        )}
                      </FormItem>
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
                      <FormItem>
                        <Button type="primary" htmlType="submit">
                          Publish
                        </Button>
                      </FormItem>
                    </Form>
                  </Col>
                </Row>
              </div>
            </div>
          </Spin>
        </Spin>
      </div>
    );
  }
}
const NewForm = Form.create()(AddNews);
AddNews.propTypes = {};

const mapStateToProps = createStructuredSelector({
  addNews: makeSelectAddNews(),
  resourceSummary: makeSelectResourceSummary(),
  email: makeSelectEmail(),
});

function mapDispatchToProps(dispatch) {
  return {
    dispatch,
    addPost: payload => dispatch(a.addPost(payload)),
    reset: () => dispatch(a.resetResponse()),
    resetResource: () => dispatch(appActions.setResourceResponse({})),
  };
}

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'addNews', reducer });
const withSaga = injectSaga({ key: 'addNews', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(NewForm);
