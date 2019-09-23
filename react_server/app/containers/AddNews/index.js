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
import {
  Row,
  Col,
  Form,
  Select,
  Input,
  Button,
  Alert,
  Spin,
  Checkbox,
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
const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const RadioGroup = Radio.Group;

/* eslint-disable react/prefer-stateless-function */
export class AddNews extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      thumbnail_image: '',
      embedded_image: '',
      value: 1,
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
      <Spin tip="Generating..." spinning={loading}>
        <Helmet>
          <title>AddNews</title>
          <meta name="description" content="Description of AddNews" />
        </Helmet>
        <Header history={this.props.history} />
        <div className="container" style={{ marginTop: 80 }}>
          <div className="bg-white">
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.title,
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
                  <FormItem {...formItemLayout} label="Category" hasFeedback>
                    {getFieldDecorator('category', {
                      rules: [
                        {
                          required: true,
                          message: 'Please select your category',
                        },
                      ],
                      initialValue:
                        this.props.resourceSummary &&
                        this.props.resourceSummary.category,
                    })(
                      <Select placeholder="Select category">
                        <Option value="Society">Society</Option>
                        <Option value="Culture">Culture</Option>
                        <Option value="Sports">Sports</Option>
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.author,
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.author_description,
                    })(
                      <TextArea
                        type="text"
                        placeholder="Please enter author description"
                      />,
                    )}
                  </FormItem>
                  <FormItem label="Source" {...formItemLayout}>
                    {getFieldDecorator('source', {
                      rules: [
                        {
                          required: true,
                          message: 'Please enter source',
                        },
                      ],
                      initialValue:
                        this.props.resourceSummary &&
                        this.props.resourceSummary.source,
                    })(<Input type="text" placeholder="Please enter source" />)}
                  </FormItem>

                  <FormItem label="Place in frontpage?" {...formItemLayout}>
                    {/* {getFieldDecorator('Place in frontpage?', { */}
                    {getFieldDecorator('main_sentence_number', {})(
                      <RadioGroup onChange={this.handleMain} defaultValue={1}>
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.main_sentence,
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.sentence2,
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.sentence3,
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.sentence4,
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
                        this.props.resourceSummary &&
                        this.props.resourceSummary.sentence5,
                    })(
                      <TextArea
                        type="text"
                        placeholder="Please write something here"
                      />,
                    )}
                  </FormItem>
                  <FormItem label="People" {...formItemLayout}>
                    {getFieldDecorator('people1', {
                      rules: [
                        {
                          required: true,
                          message: 'Please enter name here',
                        },
                      ],

                      initialValue:
                        this.props.resourceSummary &&
                        this.props.resourceSummary.people1,
                    })(
                      <Input
                        type="text"
                        placeholder="Please enter name here"
                      />,
                    )}
                  </FormItem>
                  <FormItem label="People" {...formItemLayout}>
                    {getFieldDecorator('people2', {
                      rules: [
                        {
                          message: 'Please enter name here',
                        },
                      ],
                      initialValue:
                        this.props.resourceSummary &&
                        this.props.resourceSummary.people2,
                    })(
                      <Input
                        type="text"
                        placeholder="Please enter name here"
                      />,
                    )}
                  </FormItem>
                  <FormItem label="People" {...formItemLayout}>
                    {getFieldDecorator('people3', {
                      rules: [
                        {
                          message: 'Please enter name here',
                        },
                      ],
                      initialValue:
                        this.props.resourceSummary &&
                        this.props.resourceSummary.people3,
                    })(
                      <Input
                        type="text"
                        placeholder="Please enter name here"
                      />,
                    )}
                  </FormItem>
                  <FormItem label="People" {...formItemLayout}>
                    {getFieldDecorator('people4', {
                      rules: [
                        {
                          message: 'Please enter name here',
                        },
                      ],
                      initialValue:
                        this.props.resourceSummary &&
                        this.props.resourceSummary.people4,
                    })(
                      <Input
                        type="text"
                        placeholder="Please enter name here"
                      />,
                    )}
                  </FormItem>
                  <FormItem label="Embedded image" {...formItemLayout}>
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
    );
  }
}
const NewForm = Form.create()(AddNews);
AddNews.propTypes = {};

const mapStateToProps = createStructuredSelector({
  addNews: makeSelectAddNews(),
  resourceSummary: makeSelectResourceSummary(),
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
