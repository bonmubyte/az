import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { get } from 'lodash';
import { fromJS } from 'immutable';
import { Layout, List, Avatar, Button, Input, Card, Select, Row, Col, Divider, Modal, Tabs } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectHome from './selectors';
import isLogin from '../App/selectors';
import reducer from './reducer';
import alter from './alter.jpg';
import { Link } from 'react-router-dom';
import saga from './saga';
import axios from '../../utils/http';
import moment from 'moment';
import Header from '../Headerr/Loadable';
import Sidebar from '../../components/Sidebar/Loadable';
import * as a from './actions';
import constants from 'jest-haste-map/build/constants';
import ShareArticleModal from '../../components/ShareArticleModal';
import './style.css';
const { Content } = Layout;
const { Meta } = Card;
const { TextArea } = Input;
const Option = Select.Option;
const { TabPane } = Tabs;
let defaultTitle =
	'Barcelona’s radical plan to take back streets from car. Barcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from carBarcelona’s radical plan to take back streets from car';
// 'GOP senator applies for farm aid, but maintains support for Trump’s trade war with China with China with China with China with China with China  with China with China with China';

let defaultDescription = 'Introducing "superblocks."';
// 'Trump said recent North Korean missile tests are nothing to worry about, and that he wants "fairness and reciprocity" in a US-Japan trade deal. reciprocity" in a US-Japan trade deal reciprocity" in a US-Japan trade deal ';
let defaultAuthor = 'Admin';
let defaultViews = 0;
let defaultImage = '';
let defaultComments = 0;
let headingLimit = 90;
let paragraphLimit = 150;

/* eslint-disable react/prefer-stateless-function */
export class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			logginUser: '',
			query: '',
			stories: [],
			loading: true,
			iconLoading: false,
			postData: null,
			shareModal: false,
			isOpen: [],
			commentary: '',
			ownerData: '',
			isOpenStory: [],
			layoutMode: 'desktop'
		};
	}

	componentDidMount() {
		this.props.fetchPosts();
		this.props.fetchUser();

		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);

		let data = new FormData();
		if (currentUser) {
			data.append('user', currentUser);
		} else {
			data.append('user', -1);
		}

		axios
			.post('/api/get_top_stories/', data)
			.then((response) => {
				this.setState({ stories: response.data.top_stories });
				console.log(this.state.stories);
			})
			.catch(function(error) {
				console.log(error);
			});

		axios
			.get(`api/get_home_posts/?category=${'Economy'}`)
			.then((response) => {
				this.setState({ postData: response.data });
				console.log('economy data', response.data);
			})
			.catch(function(error) {
				console.log(error);
			});
		this.handleResize();
		window.addEventListener('resize', this.handleResize);
	}

	filter = (category) => {
		axios
			.get(`api/get_home_posts/?category=${category}`)
			.then((response) => {
				this.setState({ postData: response.data });
				console.log(this.state.postData);
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	viewPost = (id) => {
		this.props.history.push(`/view/${id}`);
	};

	
	handleNewPostForResource = () => {
		this.props.history.push('/add-resource');
	};

	handleChange = (evt) => {
		this.setState({ query: evt.target.value });
	};

	handleRefresh = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);

		let data = new FormData();
		if (currentUser) {
			data.append('user', currentUser);
		} else {
			data.append('user', -1);
		}

		this.setState({ iconLoading: true });
		axios
			.post('/api/get_top_stories/', data)
			.then((response) => {
				this.setState({ stories: response.data.top_stories });
				this.setState({ iconLoading: false });
				console.log(this.state.stories);
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	limitText = (text, limit) => {
		let count = text.length;
		if (count > limit) {
			text = text.substring(0, limit) + '.. ';
			return text;
		} else {
			return text + ' ';
		}
	};

	topSidePostLeft(list, index) {
		let id = '';
		let title = defaultTitle;
		let description = defaultDescription;
		let views = defaultViews;
		let comments = defaultComments;
		let author = defaultAuthor;
		let image = defaultImage;
		let item = [];
		if (list[index]) {
			item = list[index];
			id = list[index].id;
			title = list[index].title;
			description = list[index].main_sentence;
			author = list[index].author;
			views = list[index].total_views;
			comments = list[index].total_comments;
			image = list[index].img_url;
		}

		return (
			<div>
				<Link to={'/view/' + id}>
					<img style={{ height: 150, width: '100%' }} alt="example" src={image || alter} />
					<h2 className={'top-side-post-heading'}>{this.limitText(title, 90)}</h2>
					<p className={'top-side-post-description'}>{this.limitText(description, 150)}</p>
				</Link>
				<p style={{ lineHeight: 0.5 }}> BY {'  ' + author}</p>
				<p style={{ lineHeight: 0.5 }}>
					Views <strong>{views}</strong> Comments <strong>{comments}</strong>{' '}
				</p>
				{list[index] ? (
					<div>
						<Button
							style={{ borderRadius: 10, width: 100, backgroundColor: '#9e419b', color: '#ffffff'}}
							onClick={() => this.showModalStories(index, id)}
							type="secondary"
						>
							Take
						</Button>
						<ShareArticleModal
							visible={this.state.isOpenStory[index] || false}
							commentId={-1}
							kind={2}
							posts={[
								{
									id: item.id,
									avatar: item.image_url,
									title: item.title,
									author: item.author,
									time: moment(+new Date(item.created_at)).fromNow(),
									views: item.total_views
								}
							]}
							onClose={() =>
								this.setState({
									isOpenStory: {
										[index]: false
									}
								})}
						/>
					</div>
				) : null}
			</div>
		);
	}

	bottomSidePost(list, index) {
		let id = '';
		let title = defaultTitle;
		let description = defaultDescription;
		let views = defaultViews;
		let comments = defaultComments;
		let author = defaultAuthor;
		let item = [];

		if (list[index]) {
			item = list[index];
			id = list[index].id;
			title = list[index].title;
			description = list[index].main_sentence;
			author = list[index].author;
			views = list[index].total_views;
			comments = list[index].total_comments;
		}
		return (
			<div>
				<hr />
				<Link to={'/view/' + id}>
					<h2 className={'bottom-side-post-heading'}>{this.limitText(title, 110)}</h2>
					<p className={'bottom-side-post-description'}>{this.limitText(description, 150)}</p>
				</Link>

				<p style={{ lineHeight: 0.5 }}> BY {'  ' + author}</p>

				<p style={{ lineHeight: 0.5 }}>
					Views <strong>{views}</strong> Comments <strong>{comments}</strong>{' '}
				</p>
				{list[index] ? (
					<div>
						<Button
							style={{ borderRadius: 10, width: 100 }}
							onClick={() => this.showModalStories(index, id)}
							type="primary"
						>
							Take
						</Button>
						<ShareArticleModal
							commentId={-1}
							kind={2}
							visible={this.state.isOpenStory[index] || false}
							posts={[
								{
									id: item.id,
									avatar: item.image_url,
									title: item.title,
									author: item.author,
									time: moment(+new Date(item.created_at)).fromNow(),
									views: item.total_views
								}
							]}
							onClose={() =>
								this.setState({
									isOpenStory: {
										[index]: false
									}
								})}
						/>
						{/* {this.shareModalStories(index, item)} */}
					</div>
				) : null}
			</div>
		);
	}

	topMiddlePost(list, index) {
		let id = '';
		let title = defaultTitle;
		let description = defaultDescription;
		let views = defaultViews;
		let comments = defaultComments;
		let author = defaultAuthor;
		let image = defaultImage;
		let item = [];
		if (list[index]) {
			item = list[index];
			id = list[index].id;
			title = list[index].title;
			description = list[index].main_sentence;
			author = list[index].author;
			views = list[index].total_views;
			comments = list[index].total_comments;
			image = list[index].img_url;
		}

		return (
			<div>
				<div style={{ textAlign: 'center', width: '100%' }}>
					<Link to={'/view/' + id}>
						<img style={{ height: 316, width: '100%' }} alt="example" src={image || alter} />
						<br />
						<h2 className={'top-middle-post-heading'}>{this.limitText(title, 100)}</h2>

						<i>
							<p className={'top-middle-post-description'}>{this.limitText(description, 200)}</p>
						</i>
					</Link>

					<p
						style={{
							lineHeight: 0.5
						}}
					>
						{' '}
						BY {'  ' + author}
					</p>

					<p style={{ lineHeight: 0.5 }}>
						Views <strong>{views}</strong> Comments <strong>{comments}</strong>{' '}
					</p>
					{list[index] ? (
						<div>
							<Button
								style={{ borderRadius: 10, width: 100, backgroundColor: '#9e419b', color: '#ffffff'}}
								onClick={() => this.showModalStories(index, id)}
								type="secondary"
							>
								Take
							</Button>
							<ShareArticleModal
								commentId={-1}
								kind={2}
								visible={this.state.isOpenStory[index] || false}
								posts={[
									{
										id: item.id,
										avatar: item.image_url,
										title: item.title,
										author: item.author,
										time: moment(+new Date(item.created_at)).fromNow(),
										views: item.total_views
									}
								]}
								onClose={() =>
									this.setState({
										isOpenStory: {
											[index]: false
										}
									})}
							/>
							{/* {this.shareModalStories(index, item)} */}
						</div>
					) : null}

					<hr />
				</div>
			</div>
		);
	}

	bottomMiddlePost(list, index) {
		let id = '';
		let title = defaultTitle;
		let description = defaultDescription;
		let views = defaultViews;
		let comments = defaultComments;
		let author = defaultAuthor;
		let image = defaultImage;
		let item = [];
		if (list[index]) {
			item = list[index];
			id = list[index].id;
			title = list[index].title;
			description = list[index].main_sentence;
			author = list[index].author;
			views = list[index].total_views;
			comments = list[index].total_comments;
			image = list[index].img_url;
		}

		return (
			<Row>
				<Col span={15}>
					<Link to={'/view/' + id}>
						<h2 className={'bottom-middle-post-heading'}>{this.limitText(title, 110)}</h2>
					</Link>

					<i>
						<p className={'bottom-middle-post-description'}>{this.limitText(description, 200)}</p>
					</i>

					<p
						style={{
							lineHeight: 0.5,
							width: 327
						}}
					>
						{' '}
						BY {'  ' + author}
					</p>

					<p style={{ lineHeight: 0.5, width: 544 }}>
						Views <strong>{views}</strong> Comments <strong>{comments}</strong>{' '}
					</p>
					{list[index] ? (
						<div>
							<Button
								style={{ borderRadius: 10, width: 100, backgroundColor: '#9e419b', color: '#ffffff'}}
								onClick={() => this.showModalStories(index, id)}
								type="secondary"
							>
								Take
							</Button>
							<ShareArticleModal
								commentId={-1}
								kind={2}
								visible={this.state.isOpenStory[index] || false}
								posts={[
									{
										id: item.id,
										avatar: item.image_url,
										title: item.title,
										author: item.author,
										time: moment(+new Date(item.created_at)).fromNow(),
										views: item.total_views
									}
								]}
								onClose={() =>
									this.setState({
										isOpenStory: {
											[index]: false
										}
									})}
							/>
							{/* {this.shareModalStories(index, item)} */}
						</div>
					) : null}
				</Col>
				<Col offset={1} span={8}>
					<Link to={'/view/' + id}>
						<img style={{ height: 97, width: '100%' }} alt="example" src={image || alter} />
					</Link>
				</Col>
				{/* <hr /> */}
			</Row>
		);
	}
	mobilePost(list, index) {
		let id = '';
		let title = defaultTitle;
		let description = defaultDescription;
		let views = defaultViews;
		let comments = defaultComments;
		let author = defaultAuthor;
		let image = defaultImage;
		let item = [];
		if (list[index]) {
			item = list[index];
			id = list[index].id;
			title = list[index].title;
			description = list[index].main_sentence;
			author = list[index].author;
			views = list[index].total_views;
			comments = list[index].total_comments;
			image = list[index].img_url;
		}

		return (
			<Row type="flex" style={{ borderTop: '1px solid gray', padding: '10px 0' }}>
				<Col span={8}>
					<Link to={'/view/' + id}>
						<img style={{ height: 150, width: '100%' }} alt="example" src={image || alter} />
					</Link>
				</Col>
				<Col span={16} style={{ paddingLeft: 10 }}>
					<Link to={'/view/' + id}>
						<h2 className={'bottom-middle-post-heading'}>{this.limitText(title, 110)}</h2>
					</Link>

					<i>
						<p className={'bottom-middle-post-description'}>{this.limitText(description, 200)}</p>
					</i>

					<p
						style={{
							lineHeight: 0.5
						}}
					>
						{' '}
						BY {'  ' + author}
					</p>

					<p style={{ lineHeight: 0.5 }}>
						Views <strong>{views}</strong> Comments <strong>{comments}</strong>{' '}
					</p>
					{list[index] ? (
						<div>
							<Button
								style={{
									borderRadius: 10,
									width: 100,
									float: 'right', backgroundColor: '#9e419b', color: '#ffffff'

								}}
								onClick={() => this.showModalStories(index, id)}
								type="secondary"
							>
								Take
							</Button>
							<ShareArticleModal
								commentId={-1}
								kind={2}
								visible={this.state.isOpenStory[index] || false}
								posts={[
									{
										id: item.id,
										avatar: item.image_url,
										title: item.title,
										author: item.author,
										time: moment(+new Date(item.created_at)).fromNow(),
										views: item.total_views
									}
								]}
								onClose={() =>
									this.setState({
										isOpenStory: {
											[index]: false
										}
									})}
							/>
							{/* {this.shareModalStories(index, item)} */}
						</div>
					) : null}
				</Col>
			</Row>
		);
	}

	sharePost = (index, id) => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		let data = new FormData();
		data.append('id', id);
		data.append('user', currentUser);
		data.append('commentary', this.state.commentary);

		const payload = {
			post: id,
			user: currentUser,
			commentary: this.state.commentary
		};

		axios
			.post(`/api/saved-post/`, payload)
			.then((response) => {
				this.setState({ isOpen: { [index]: false } });
				console.log(this.state.stories);
			})
			.catch(function(error) {
				console.log(error);
			});
		this.setState({ isOpen: { [index]: false } });
	};

	showModal = (index, id) => {
		this.setState({
			isOpen: {
				[index]: true
			}
		});
	};

	showModalStories = (index, id) => {
		console.log('index ', index);
		this.setState({
			isOpenStory: {
				[index]: true
			}
		});
	};

	handleCancel = (index) => {
		this.setState({ isOpen: { [index]: false } });
		this.setState({ isOpenStory: { [index]: false } });
	};

	postsData = (data) => {
		return (
			<Card style={{ marginTop: 3 }}>
				<List
					itemLayout="vertical"
					size={'large'}
					dataSource={data}
					renderItem={(item, index) => (
						<List.Item
							extra={
								<Row>
									<Col span={24}>
										<p style={{ color: '#9e419b' }}>{item.total_views} Views </p>
										<Link style={{ color: 'black' }} to={'/view/' + item.id}>
											<img style={{ width: 100, height: 100 }} src={item.img_url || alter} />
										</Link>

										<Row>
											<Col span={1} offset={1}>
												<br />
												<Button
													style={{ borderRadius: 10, width: 100, backgroundColor: '#9e419b', color: '#ffffff'}}
													onClick={() => this.showModal(index, item.id)}
													type="secondary"
												>
													Take
												</Button>
											</Col>
										</Row>
									</Col>
								</Row>
							}
						>
							<List.Item.Meta
								// avatar={item.title}
								title={
									<React.Fragment>
										<p
											style={{
												display: 'inline-block',
												fontSize: '12px',
												color: '#4286f4'
											}}
										>
											{moment(+new Date(item.created_at)).fromNow()}
										</p>
										<Link to={'/view/' + item.id}>
											<h2>{item.title}</h2>
										</Link>
									</React.Fragment>
								}
								description={'By   ' + item.author}
							/>
							<Link style={{ color: 'black' }} to={'/view/' + item.id}>
								{item.main_sentence}
							</Link>
							<ShareArticleModal
								commentId={-1}
								kind={2}
								visible={this.state.isOpen[index] || false}
								posts={[
									{
										id: item.id,
										avatar: item.image_url,
										title: item.title,
										author: item.author,
										time: moment(+new Date(item.created_at)).fromNow(),
										views: item.total_views
									}
								]}
								onClose={() =>
									this.setState({
										isOpen: {
											[index]: false
										}
									})}
							/>
							{/* {this.shareModal(index, item)} */}
						</List.Item>
					)}
				/>
			</Card>
		);
	};
	handleResize = () => {
		if (window.innerWidth < 800 && this.state.layoutMode != 'mobile') {
			this.setState({ layoutMode: 'mobile' });
		} else if (window.innerWidth >= 800 && window.innerWidth <= 1000 && this.state.layoutMode != 'tablet') {
			this.setState({ layoutMode: 'tablet' });
		} else if (window.innerWidth > 1000 && this.state.layoutMode != 'desktop') {
			this.setState({ layoutMode: 'desktop' });
		}
	};
	responsiveLayout = () => {
		if (this.state.layoutMode == 'desktop') {
			return (
				<Row style={{ marginTop: 20 }}>
					<Col span={5}>
						<Row>{this.topSidePostLeft(this.state.stories, 1)}</Row>
						<Row>{this.bottomSidePost(this.state.stories, 2)}</Row>
						<Row>{this.bottomSidePost(this.state.stories, 3)}</Row>
					</Col>
					<Col offset={1} span={12}>
						<Row>{this.topMiddlePost(this.state.stories, 4)}</Row>
						<Row>{this.bottomMiddlePost(this.state.stories, 5)}</Row>
					</Col>
					<Col offset={1} span={5}>
						<Row>{this.topSidePostLeft(this.state.stories, 6)}</Row>
						<Row>{this.bottomSidePost(this.state.stories, 7)}</Row>
						<Row>{this.bottomSidePost(this.state.stories, 8)}</Row>
					</Col>
				</Row>
			);
		} else if (this.state.layoutMode == 'tablet') {
			return (
				<Row style={{ marginTop: 20 }}>
					<Col span={8}>
						<Row>{this.topSidePostLeft(this.state.stories, 1)}</Row>
						<Row>{this.bottomSidePost(this.state.stories, 2)}</Row>
						<Row>{this.bottomSidePost(this.state.stories, 3)}</Row>
					</Col>
					<Col offset={1} span={15}>
						<Row>{this.topMiddlePost(this.state.stories, 4)}</Row>
						<Row>{this.bottomMiddlePost(this.state.stories, 5)}</Row>
					</Col>
					<Col span={8}>{this.bottomSidePost(this.state.stories, 6)}</Col>
					<Col span={8}>{this.bottomSidePost(this.state.stories, 7)}</Col>
					<Col span={8}>{this.bottomSidePost(this.state.stories, 8)}</Col>
				</Row>
			);
		} else {
			return (
				<Row style={{ marginTop: 20 }}>
					{this.mobilePost(this.state.stories, 4)}
					{this.mobilePost(this.state.stories, 5)}
					{this.mobilePost(this.state.stories, 1)}
					{this.mobilePost(this.state.stories, 2)}
					{this.mobilePost(this.state.stories, 3)}
					{this.mobilePost(this.state.stories, 6)}
					{this.mobilePost(this.state.stories, 7)}
					{this.mobilePost(this.state.stories, 8)}
				</Row>
			);
		}
	};
	render() {
		const { user } = this.props.userInfo;
		return (
			<div style={{ minWidth: 100 }}>
				<Helmet>
					<title>Home</title>
					<meta name="description" content="Description of Home" />
				</Helmet>
				<div>
					<Header history={this.props.history} />
				</div>

				<Layout>
					<Content className="content">
						<div className={'container'}>
							<Row>
								<Divider><h2 style= {{fontFamily: 'Techna Sans', color: '#9e419b'}}>
									<strong>Front Page</strong></h2></Divider>
							</Row>
							<Row type="flex" justify="center">

							</Row>
							{this.responsiveLayout()}

							<Row>
								<Col xs={24} sm={24} md={24} lg={18} xl={16}>
									<Tabs
										defaultActiveKey="1" // onChange={() => this.filter('Entertainment')}
										onChange={this.filter}
										style={{color:'#9e419b'}}
									>
										<TabPane tab="Society" key="Economy" style={{color: '#9e419b'}}>
											{this.state.postData ? this.postsData(this.state.postData) : null}
										</TabPane>
										<TabPane tab="Culture" key="Politics">
											{this.state.postData ? this.postsData(this.state.postData) : null}
										</TabPane>
										<TabPane tab="Sports" key="Entertainment">
											{this.state.postData ? this.postsData(this.state.postData) : null}
										</TabPane>
									</Tabs>

								
								</Col>
							</Row>
						</div>
					</Content>
					{/* </Layout> */}
				</Layout>
			</div>
		);
	}
}

Home.propTypes = {};

const mapStateToProps = createStructuredSelector({
	home: makeSelectHome(),
	userInfo: isLogin()
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
		fetchPosts: (category = '') => dispatch(a.fetchPosts(category)),
		fetchUser: () => dispatch(a.fetchUser(localStorage.getItem('email')))
	};
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'home', reducer });
const withSaga = injectSaga({ key: 'home', saga });

export default compose(withReducer, withSaga, withConnect)(Home);
