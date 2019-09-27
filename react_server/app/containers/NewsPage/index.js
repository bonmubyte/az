import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import axios from '../../utils/http';
import alter from './alter.jpg';
import menuIcon from '../../images/menu.png';
import verticleDots from './verticleDots.png';
import GroupFeed from '../../components/GroupFeed';
import ArticleFeed from '../../components/ArticleFeed';
import like_button from './like_button.png';
import unlike_button from './unlike_button.png';
import avatar from '../../images/avatar.png';
import './style.css';
import {
	Row,
	Col,
	Card,
	Badge,
	message,
	Button,
	Input,
	Avatar,
	List,
	Tabs,
	Icon,
	Modal,
	Switch,
	Dropdown,
	Menu,
	notification
} from 'antd';
import { get } from 'lodash';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectNewsPage from './selectors';
import makeSelectGlobalState from '../App/selectors';
import reducer from './reducer';
import saga from './saga';
import Header from '../Headerr/Loadable';
import * as a from './actions';
import ReadMoreReact from 'read-more-react';

const { Meta } = Card;
const TabPane = Tabs.TabPane;
const { TextArea } = Input;

/* eslint-disable react/prefer-stateless-function */

const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};

export class NewsPage extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			loading: false,
			imageUrl: '',
			name: '',
			bio: '',
			result: null,
			renderedPosts: [],
			currentUser: null,
			otherId: null,
			ch: true,
			followButtonDisAble: true,
			articlesCount: '0',
			profileModal: false,
			settingModal: false,
			show_commentary_articles: false,
			show_profile_keywords: false,
			show_articles_first: false,
			showKeywordsCopy: false,
			showCommentaryCopy: false,
			showArticleFirst: true,
			subscribeModal: false,
			shareModal: false,
			isOpen: [],
			isArticleOpen: [],
			commentary: '',
			ownerData: '',
			comments: [],
			posts: [],
			myGroups: [],
			pinnedGroups: [],
			isGroupViewMoreOpen: false,
			openArticle: -1,
			openArticleComment: -1,
			openArticleReply: -1,
			openCommentary: -1,
			openCommentaryComment: -1,
			openCommentaryReply: -1
		};
    const user = JSON.parse(localStorage.getItem('user')) || {};
    // this.setState({ show_articles_first: !user.first_mode });
		if (location.href.split('#').length == 2) {
			let values = location.href.split('#')[1].split('_');

			switch (values[0]) {
				case 'articlecomment':
					this.state.openArticle = values[1];
					this.state.openArticleComment = values[2];
					break;
				case 'articlereply':
					this.state.openArticle = values[1];
					this.state.openArticleReply = values[2];
					break;
				case 'article':
					this.state.openArticle = values[1];
					break;
				case 'commentarycomment':
					this.state.openCommentary = values[1];
					this.state.openCommentaryComment = values[2];
					break;
				case 'commentaryreply':
					this.state.openCommentary = values[1];
					this.state.openCommentaryReply = values[2];
					break;
				case 'commentary':
					this.state.openCommentary = values[1];
					break;
			}
		}

		console.log('id====', this.state.openArticleReply);
	}

	componentDidUpdate(prevProps) {
		if (this.props.match.params.id !== prevProps.match.params.id) {
			this.fetchData();
		}
	}

	fetchData = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		this.setState({ currentUser });
		this.setState({})
		let otherId = this.props.match.params.id;
		console.log('other', otherId);

		this.setState({ otherId });
		let data = new FormData();
		data.append('user', currentUser);
		data.append('user_view', otherId);
		console.log('fetch profile', currentUser, otherId);
		axios
			.post('/api/get_profile_content/', data)
			.then((response) => {
				this.setState({ result: response.data }, () => {
					console.log('visitor profile', this.state.result);
				});
				console.log('profile=========', response.data);
			})
			.catch(function(error) {
				console.log(error);
			});
		this.fetchComments();
		this.fetchPosts();
	};
	fetchComments = () => {
		let otherId = String(this.props.location.pathname).replace('/news-page/', '');
		axios
			.get(`/api/get_saved_comments_by_user/?user=${otherId}`)
			.then((response) => {
				this.setState({ comments: response.data.comments });
				console.log('commentaries: ', this.state.comments);
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	fetchPosts = () => {
		let otherId = String(this.props.location.pathname).replace('/news-page/', '');
		axios
			.get(`/api/get_posts_by_user/?user=${otherId}`)
			.then((response) => {
				this.setState({ posts: response.data.posts });
				console.log('posts: ', this.state.posts);
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	componentDidMount() {
		//	this.props.reset();
		const userID = get(this, 'props.global.user.id', null);
		const user = JSON.parse(localStorage.getItem('user')) || {};
    this.setState({ show_articles_first: !user.first_mode });

		this.fetchData();

		this.fetchMyGroups();
		//	this.props.fetchPost(userID);

		setTimeout(() => {
			this.setState({
				imageUrl: get(this.props, 'global.profile.image', ''),
				bio: get(this.props, 'global.profile.bio', ''),
				name: get(this.props, 'global.profile.name', ''),
				uID: get(this.props, 'global.profile.uID', ''),
				verified: get(this.props, 'global.profile.verified', ''),
				show_commentary_articles: get(this.props, 'global.profile.show_commentary_articles', false),
				show_profile_keywords: get(this.props, 'global.profile.show_profile_keywords', false),
				// show_articles_first: get(this.props, 'global.profile.show_articles_first', false)
			});
			 this.fetchProfile();
			console.log('show first article', get(this.props, 'global.profile.show_articles_first', false));
		}, 500);
		setTimeout(() => {
			if (this.state.openArticleComment != -1) {
				document.getElementById('comment_' + this.state.openArticleComment).scrollIntoView(false);
			} else if (this.state.openArticleReply != -1) {
				document.getElementById('reply_' + this.state.openArticleReply).scrollIntoView(false);
			} else if (this.state.openArticle != -1) {
				document.getElementById('article_' + this.state.openArticle).scrollIntoView(false);
			}
			if (this.state.openCommentaryComment != -1) {
				document.getElementById('comment_' + this.state.openCommentaryComment).scrollIntoView(false);
			} else if (this.state.openCommentaryReply != -1) {
				document.getElementById('reply_' + this.state.openCommentaryReply).scrollIntoView(false);
			} else if (this.state.openCommentary != -1) {
				document.getElementById('commentary_' + this.state.openCommentary).scrollIntoView(false);
			}
		}, 1000);
	}
	fetchMyGroups = () => {
		const currentUser = this.props.match.params.id;
		axios
			.get(`/api/get_groups_by_user/?user=${currentUser}`)
			.then((response) => {
				console.log('mygroups', response.data.groups);
				let data = response.data.groups.filter((group) => group.visible);
				data.map((group) => {
					group.notification = 0;
				});
				this.setState({ myGroups: data }, () => {
					this.pinGroup('');
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	fetchProfile = () => {
		const currentUser = this.props.match.params.id;
		axios
			.get(`/api/user-profile/?user=${currentUser}`)
			.then((response) => {
				let data = response.data;
        const user = JSON.parse(localStorage.getItem('user')) || {};
        this.setState({ uID: user.username });
        this.setState({ name: data[0].name });

			})
			.catch(function(error) {
				console.log(error);
			});
	};

	getBase64 = (img, callback) => {
		const reader = new FileReader();
		reader.addEventListener('load', () => callback(reader.result));
		reader.readAsDataURL(img);
	};

	beforeUpload = (file) => {
		const isLt2M = file.size / 1024 / 1024 < 2;
		if (!isLt2M) {
			message.error('Image must smaller than 2MB!');
		}
		return isLt2M;
	};

	handleChange = (info) => {
		if (info.file.status === 'uploading') {
			this.setState({ loading: true });
			return;
		}
		if (info.file.status === 'done') {
			// Get this url from response in real world.
			this.getBase64(info.file.originFileObj, (imageUrl) =>
				this.setState({
					imageUrl,
					loading: false
				})
			);
		}
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

	saveProfile = () => {
		let profile = localStorage.getItem('profile') || '{}';
		profile = JSON.parse(profile);
		debugger
		axios.get(`/api/exists_profile_uid/?id=${profile.id}&uID=${this.state.uID}`).then((response) => {
			if (response.data.uID !== this.state.uID) {
				openNotificationWithIcon('error', 'Your Id is already exists', 'Please type your id again.');
				this.setState({
					uID: response.data.uID
				});
			} else {
				this.props.updateProfile({
					id: profile.id,
					image: this.state.imageUrl,
					bio: this.state.bio,
					name: this.state.name,
					uID: this.state.uID
				});

				this.setState({ profileModal: false });
			}
		});
	};

	handleFileUpload = (e, attribute) => {
		e.persist();
		this.getBase64(e.target.files[0], attribute);
		this.setState({ imageUrl: this.getBase64(e.target.files[0], attribute) });
	};

	getBase64 = (file, attribute) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		const a = this;
		reader.onload = function() {
			a.setState({
				[attribute]: reader.result
			});
		};
		reader.onerror = function(error) {};
	};

	handleRedirect = () => {
		this.props.history.push('/add-news');
	};

	handleNewPostForResource = () => {
		this.props.history.push('/add-resource');
	};

	handleFollow = () => {
		this.setState({ followButtonDisAble: false });

		let data = new FormData();
		data.append('user', this.state.currentUser);
		data.append('user_view', this.state.otherId);

		axios
			.post('/api/follow_user/', data)
			.then((response) => {
				this.setState(
					Object.assign(this.state.result, {
						follow_status: response.data.follow_status
					})
				);
				this.setState({ followButtonDisAble: true });
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	showProfileModal = () => {
		this.setState({ profileModal: true });
	};
	showSettingModal = () => {
		this.setState({
			showCommentaryCopy: this.state.show_commentary_articles,
			showKeywordsCopy: this.state.show_profile_keywords,
			showArticleFirst: this.state.show_articles_first,
			settingModal: true
		});
	};

	handleSettingModal = () => {
		let data = new FormData();
		data.append('user', this.state.currentUser);
		data.append('show_profile_keywords', this.state.showKeywordsCopy ? 1 : 0);
		data.append('show_commentary_articles', this.state.showCommentaryCopy ? 1 : 0);
		data.append('show_articles_first', this.state.showArticleFirst ? 1 : 0);

		axios
			.post('/api/update_profile_settings/', data)
			.then((response) => {
				this.setState({
					show_commentary_articles: response.data.show_commentary_articles,
					show_profile_keywords: response.data.show_profile_keywords,
					show_articles_first: response.data.show_articles_first
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	handleCancel = () => {
		this.setState({ profileModal: false, settingModal: false, subscribeModal: false });
	};

	handleShareCancel = (index) => {
		this.setState({ isOpen: { [index]: false } });
	};
	unFollow = (id) => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);

		axios
			.get(`/api/unjoin_group_by_user/?group=${id}&user=${currentUser}`)
			.then((response) => {
				console.log('unjoined', response);
				this.fetchMyGroups();
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	logout = () => {
		localStorage.clear();
		this.props.history.push('/');
	};

	handleSubscribeProfile = () => {
		this.setState({ subscribeModal: true });
	};

	pinPost = async (id, check) => {
		console.log('check  ', check);
		this.setState({ PopoverVisible: false });

		let pinData = new FormData();
		pinData.append('user', this.state.currentUser);

		if (check === 'commentary') {
			pinData.append('saved_post_id', id);
			await axios.post('/api/pin_commentary/', pinData);

			this.fetchData();
		} else if (check === 'articles') {
			pinData.append('post_id', id);
			await axios.post('/api/pin_my_post/', pinData);
			this.fetchData();
		}
	};
	pinGroup = (id) => {
		let data = new FormData();
		data.append('user', this.state.currentUser);
		data.append('group', id);
		axios.post('/api/pin_group/', data).then((response) => {
			for (let i = 0; i < this.state.myGroups.length; i++) {
				this.state.myGroups[i].pinned = false;
				if (response.data.groups.includes(this.state.myGroups[i].id.toString())) {
					this.state.myGroups[i].pinned = true;
					this.state.myGroups.splice(0, 0, this.state.myGroups.splice(i, 1)[0]);
				}
			}
			this.setState({ myGroups: this.state.myGroups });
		});
	};
	unpinGroup = (id) => {
		let data = new FormData();
		data.append('user', this.state.currentUser);
		data.append('group', id);
		axios.post('/api/unpin_group/', data).then((response) => {
			for (let i = 0; i < this.state.myGroups.length; i++) {
				this.state.myGroups[i].pinned = false;
				if (response.data.groups.includes(this.state.myGroups[i].id.toString())) {
					this.state.myGroups[i].pinned = true;
					this.state.myGroups.splice(0, 0, this.state.myGroups.splice(i, 1)[0]);
				}
			}
			this.setState({ myGroups: this.state.myGroups });
		});
	};
	handleKeyword = (checked) => {
		this.setState({ showKeywordsCopy: checked });
	};

	handleCommentry = (checked) => {
		this.setState({ showCommentaryCopy: checked });
	};
	handleArticleFirst = (checked) => {
		this.setState({ showArticleFirst: checked });
		this.setState({ show_articles_first: checked });
		const currentUser = this.props.match.params.id;
		const user = JSON.parse(localStorage.getItem('user')) || {};
		user.first_mode  = !checked;
		localStorage.setItem("user", JSON.stringify(user));
			axios
			.patch('/api/user/'+currentUser+'/', user)
			.then((response) => {
				console.log('show article first updated');
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	pinProfile = async (id) => {
		let data = new FormData();
		data.append('user', this.state.currentUser);
		data.append('user_view', this.state.otherId);

		let pinData = new FormData();
		pinData.append('user', this.state.currentUser);
		pinData.append('user_view', id);
		axios
			.post('/api/pin_following_profile/', pinData)
			.then((response) => {
				console.log('pin success');
				axios
					.post('/api/get_profile_content/', data)
					.then((response) => {
						this.setState({ result: response.data });
					})
					.catch(function(error) {
						console.log(error);
					});
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	followProfile = async (id, status, index) => {
		let data = new FormData();
		const { result } = this.state;
		data.append('user', this.state.currentUser);
		data.append('user_view', id);

		axios
			.post('/api/follow_user/', data)
			.then((response) => {
				this.state.result.following_profiles[index].follow_status = response.data.follow_status;
				this.setState({
					result
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	followMenu = (id, pinned, status, index) => {
		return (
			<Menu>
				<Menu.Item onClick={() => this.pinProfile(id)}>
					<div>
						<p
							style={{
								cursor: 'pointer'
							}}
						>
							{pinned ? 'Unpin the profile' : 'Pin the profile'}
						</p>
					</div>
				</Menu.Item>

				<Menu.Item onClick={() => this.followProfile(id, status, index)}>
					<div>
						<p
							style={{
								cursor: 'pointer'
							}}
						>
							{/* {status} */}
							{this.state.result.following_profiles[index].follow_status}
							{/* {this.followProfile()} */}
						</p>
					</div>
				</Menu.Item>
			</Menu>
		);
	};
	groupMenu = (id, pinned) => {
		return (
			<Menu>
				<Menu.Item key="0">
					<a onClick={() => this.pinGroup(id)}>{pinned ? 'Unpin the Profile' : 'Pin the Profile'}</a>
				</Menu.Item>
				<Menu.Item key="1">
					<a onClick={() => this.unFollow(id)}>Unfollow</a>
				</Menu.Item>
			</Menu>
		);
	};
	showModal = (index, id) => {
		this.setState({
			isOpen: {
				[index]: true
			}
		});
	};
	showArticleModal = (index, id) => {
		this.setState({
			isArticleOpen: {
				[index]: true
			}
		});
	};

	likeClicked = (index, id, count) => {
		const { result } = this.state;
		let data = new FormData();
		data.append('user', this.state.currentUser);
		data.append('saved_post_id', id);

		axios
			.post('/api/like_commentary/', data)
			.then((response) => {
				console.log('liked here', response.data);
				this.state.result.saved_posts[index].like_count = response.data.like_count;
				this.state.result.saved_posts[index].like_status = response.data.like_status;
				this.setState({
					result
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	handleLike = (index, id, count, status) => {
		return (
			<div>
				{status === 'like' ? (
					<img
						style={{
							cursor: 'pointer',
							height: 32,
							width: 32
						}}
						onClick={() => this.likeClicked(index, id, count)}
						src={like_button}
					/>
				) : (
					<img
						style={{
							cursor: 'pointer',
							height: 32,
							width: 32
						}}
						onClick={() => this.likeClicked(index, id, count)}
						src={unlike_button}
					/>
				)}
				<span style={{ marginLeft: 10 }}>{count} votes</span>
			</div>
		);
	};

	render() {
		const { initLoading, profileLoading, list } = this.state;
		const loadMore =
			!initLoading && !profileLoading ? (
				<div
					style={{
						textAlign: 'center',
						marginTop: 12,
						height: 32,
						lineHeight: '32px'
					}}
				>
					<Button onClick={this.onLoadMore}>loading more</Button>
				</div>
			) : null;

		let image = <span />;
		image = (
			<img
				style={{
					height: 85,
					width: 85,
					borderRadius: 10
				}}
				src={this.state.imageUrl || avatar}
			/>
		);

		const { response } = this.props.newsPage;
		return (
			<div>
				<Helmet>
					<title>Profile Page</title>
					<meta name="description" content="Description of NewsPage" />
				</Helmet>
          <Header history={this.props.history} first_mode = {!this.state.show_articles_first}/>
				<div className="bg-white" style={{ minWidth: 650 }}>
					<div className="container" style={{ marginTop: 90 }}>
						<Row>
							<Col
								lg={{ offset: 7, span: 11 }}
								md={{ offset: 3, span: 14 }}
								sm={{ offset: 1, span: 16 }}
								xs={{ offset: 1, span: 16 }}
								style ={{fontFamily: 'Techna Sans'}}
							>
								{this.state.result ? (
									<Row>
										{!this.state.show_articles_first ? (
											<div
												style={{
													backgroundColor: 'purple',
													color: 'white',
													borderRadius: 10,
													width: 100,
													lineHeight: '2em',
													height: 30,
													textAlign: 'center'
												}}
											>
												Journalist
											</div>
										) : null}

										<Col xs={10} sm={10} md={10} lg={10} style={{ display: 'flex', fontFamily: 'Techna Sans'  }}>
											<h2
												style={{
													width: 150,
													height: 27,
													whiteSpace: 'nowrap',
													overflow: 'hidden',
													whiteSpace: 'initial'
												}}
											>
												{this.state.currentUser == this.state.otherId ? (
													this.state.name
												) : (
													this.state.result.visitor_profile_info.name
												)}
											</h2>

											{this.state.result.visitor_profile_info.is_verified &&
											this.state.currentUser != this.state.otherId ? (
												<Icon
													style={{ marginTop: 5, color: '#9e419b', fontSize: '20px' }}
													type="safety"
												/>
											) : null}
											{this.state.verified && this.state.currentUser == this.state.otherId ? (
												<Icon
													style={{ marginTop: 5, color: '#9e419b', fontSize: '20px' }}
													type="safety"
												/>
											) : null}
										</Col>

										<Col xs={13} sm={13} md={13} lg={13} offset={1}>
											{this.state.currentUser == this.state.otherId ? (
												<Row type="flex">
													<Col>
														<Button
															style={{ marginLeft: 15, color: '#9e419b'}}
															ghost
															type="primary"
															onClick={this.showProfileModal}
														>
															Edit Profile
														</Button>
													</Col>
													<Col offset={1}>
														<Icon
															style={{ fontSize: 30, marginLeft: 15, cursor: 'pointer' }}
															type="setting"
															onClick={this.showSettingModal}
														/>
													</Col>
												</Row>
											) : null}

											{this.state.currentUser != this.state.otherId ? this.state.result
												.follow_status ? (
												<Row>
													<Col offset={12} span={12}>
														<Button
															ghost
															disabled={!this.state.followButtonDisAble}
															type="primary"
															onClick={this.handleFollow}
														>
															{this.state.result.follow_status}
														</Button>
													</Col>
												</Row>
											) : null : null}
										</Col>

										<Col span={22}>
											{this.state.currentUser == this.state.otherId ? (
												<p>@{this.state.uID}</p>
											) : this.state.result && this.state.result ? (
												<p>@{this.state.result.visitor_profile_info.uID}</p>
											) : null}
										</Col>
										<Col span={22}>
											{this.state.currentUser == this.state.otherId ? (
												<p>{this.state.bio}</p>
											) : this.state.result && this.state.result ? (
												<p>{this.state.result.visitor_profile_info.bio}</p>
											) : null}
										</Col>
										<Col span={24}>
											<Row>
												<Col xs={8} sm={8} md={6} lg={4}>
													<p>
														<strong>{this.state.result.my_posts.length + ' '}</strong>
														Articles
													</p>
												</Col>
												<Col xs={8} sm={8} md={6} lg={5}>
													<p>
														<strong>{this.state.result.total_view_count + ' '}</strong>
														Visitors
													</p>
												</Col>
												<Col xs={8} sm={8} md={6} lg={5}>
													<p>
														<strong>
															{this.state.result.total_followers_count + ' '}
														</strong>{' '}
														Followers
													</p>
												</Col>
											</Row>
										</Col>
									</Row>
								) : null}
								<br />
								{/* modal code  */}
								<Modal
									title="Edit profile"
									visible={this.state.profileModal}
									onCancel={this.handleCancel}
									footer={[
										<Button key="back" onClick={this.handleCancel}>
											Cancel
										</Button>,
										<Button key="submit" type="primary" onClick={() => this.saveProfile()}>
											Save
										</Button>
									]}
								>
									<Input
										maxLength={15}
										style={{ marginBottom: '10px' }}
										placeholder="Your name"
										onChange={(e) => this.setState({ name: e.target.value })}
										value={this.state.name}
									/>
									<textarea
										maxLength={400}
										name="bio"
										rows="5"
										value={this.state.bio}
										id="bio"
										onChange={(e) => this.setState({ bio: e.target.value })}
										style={{ width: '100%' }}
										placeholder="Enter your bio"
									/>

									<Row>
										<Col span={16}>
											{image}
											<input
												style={{ display: 'none' }}
												className="one-upload-thumbnail"
												onChange={(e) => this.handleFileUpload(e, 'imageUrl')}
												type="file"
											/>
											<Button
												style={{ marginLeft: 10 }}
												onClick={() => document.querySelector('.one-upload-thumbnail').click()}
											>
												Upload Photo
											</Button>
										</Col>
										<Col span={8} style={{ marginTop: 10 }}>
											<span>User ID:</span>
											<Input
												maxLength={15}
												style={{ marginBottom: '10px' }}
												placeholder="Your ID"
												onChange={(e) => this.setState({ uID: e.target.value})}
												value={this.state.uID}
												disabled = {true}
											/>
										</Col>
									</Row>
								</Modal>
								{/* setting modal */}

								<Modal
									width={450}
									title={[
										<div key="1" style={{ textAlign: 'center' }}>
											<Icon style={{ fontSize: 25 }} type="setting" />
											<strong style={{ marginLeft: 10 }}>Settings</strong>
										</div>
									]}
									visible={this.state.settingModal}
									onCancel={this.handleCancel}
									footer={[
										<div key="1" style={{ textAlign: 'center' }}>
											<Row>
												<Button
													onClick={this.handleSettingModal}
													type="primary"
													style={{ width: 100 }}
												>
													Save
												</Button>
											</Row>
											<br />
											<Row>
												<Button onClick={this.logout} type="danger" style={{ width: 100 }}>
													Sign Out
												</Button>
											</Row>
										</div>
									]}
								>
									<div style={{ textAlign: 'center' }}>
										<h3>Account Settings & Language</h3>
										<p>Manage my information</p>
										<p>Change Language</p>
									</div>
									<hr />
									<div style={{ textAlign: 'center' }}>
										<h3>Privacy</h3>
										<p>Following Profile and Keywords</p>
										<Switch onChange={this.handleKeyword} checked={this.state.showKeywordsCopy} />

										<span style={{ marginLeft: 10 }}>
											{this.state.showKeywordsCopy ? 'Shown' : 'Hidden'}
										</span>
										<p>Takeaways and My Articles </p>
										<Switch
											onChange={this.handleCommentry}
											checked={this.state.showCommentaryCopy}
										/>

										<span style={{ marginLeft: 10 }}>
											{this.state.showCommentaryCopy ? 'Shown' : 'Hidden'}
										</span>

										<p>Newsroom Mode / Reader Mode</p>
										<Switch
											onChange={this.handleArticleFirst}
											checked={this.state.showArticleFirst}
										/>
									</div>
								</Modal>
							</Col>

							{/* image col */}
							<Col span={4}>
								{this.state.currentUser == this.state.otherId ? (
									<div style={{ marginLeft: 10 }}>{image}</div>
								) : this.state.result && this.state.result.visitor_profile_info.img_url ? (
									<img
										style={{
											marginLeft: 10,
											height: 85,
											width: 85,
											borderRadius: 10
										}}
										src={this.state.result.visitor_profile_info.img_url}
									/>
								) : (
									<Avatar style={{ height: 85, width: 85, borderRadius: 10 }} size={74} icon="user" />
								)}
							</Col>
						</Row>
					</div>
					<div className="container">
						<Row>
							<Col xs={24} sm={24} md={24} lg={8}>
								{this.state.result ? (
									<Card style={{ textAlign: 'center', marginTop: '10%' }}>
										<h3 style ={{fontFamily: 'Techna Sans'}}>Following Profile</h3>
										<br />
										{this.state.currentUser != this.state.otherId &&
										this.state.result.visitor_profile_info.show_profile_keywords == false ? (
											<div style={{ textAlign: 'center' }}>
												<br />
												<br />
												<h3>
													<strong>This profile is private!</strong>
													<br />
												</h3>
											</div>
										) : (
											<div>
												{this.state.result ? (
													<React.Fragment>
														{this.state.result.following_profiles
															.slice(0, 3)
															.map((sub, index) => {
																return (
																	<div key={sub.id}>
																		<Row>
																			<Col span={18}>
																				<a
																					href={'/news-page/' + sub.id}
																					target="blank"
																				>
																					<Row>
																						<Col
																							xs={4}
																							sm={4}
																							md={4}
																							lg={4}
																							xl={4}
																						>
																							{sub.img_url ? (
																								<img
																									style={{
																										height: 35,
																										width: 35
																									}}
																									src={sub.img_url}
																								/>
																							) : (
																								<Avatar
																									style={{
																										height: 35,
																										width: 35,
																										borderRadius: 1
																									}}
																									icon="user"
																								/>
																							)}{' '}
																						</Col>
																						<Col
																							xs={18}
																							sm={18}
																							md={18}
																							lg={18}
																							offset={1}
																						>
																							<div
																								style={{
																									textAlign: 'left'
																									// marginLeft: 30,
																								}}
																							>
																								<h2>
																									<strong>
																										{this.limitText(
																											sub.name +
																												'mobinmalik',
																											13
																										)}
																									</strong>
																								</h2>
																							</div>
																						</Col>
																					</Row>
																				</a>
																			</Col>
																			<Col xs={1} sm={1} md={1} lg={1} offset={5}>
																				{this.state.currentUser ==
																				this.state.otherId ? (
																					<Dropdown
																						trigger={[ 'click' ]}
																						overlay={this.followMenu(
																							sub.id,
																							sub.pinned,
																							sub.follow_status,
																							index
																						)}
																					>
																						<img
																							style={{
																								cursor: 'pointer',
																								height: 25,
																								width: 25
																							}}
																							src={verticleDots}
																						/>
																					</Dropdown>
																				) : null}
																			</Col>
																		</Row>
																	</div>
																);
															})}
														{/* subscribe modal */}
														<Modal
															title="Following Profiles"
															visible={this.state.subscribeModal}
															onCancel={this.handleCancel}
															footer={null}
														>
															<List
																className="demo-loadmore-list"
																itemLayout="horizontal"
																dataSource={this.state.result.following_profiles}
																renderItem={(item, index) => (
																	<List.Item
																		actions={[
																			this.state.currentUser ==
																			this.state.otherId ? (
																				<Dropdown
																					trigger={[ 'click' ]}
																					overlay={this.followMenu(
																						item.id,
																						item.pinned,
																						item.follow_status,
																						index
																					)}
																				>
																					<img
																						style={{
																							cursor: 'pointer',
																							height: 25,
																							width: 25
																						}}
																						src={verticleDots}
																					/>
																				</Dropdown>
																			) : null
																		]}
																	>
																		<List.Item.Meta
																			avatar={
																				item.img_url ? (
																					<img
																						style={{
																							height: '30px',
																							width: '30px'
																						}}
																						src={item.img_url}
																					/>
																				) : (
																					<img
																						style={{
																							height: '35px',
																							width: '35px'
																						}}
																						src={alter}
																						alt=""
																					/>
																				)
																			}
																			title={
																				<div style={{ fontSize: 20 }}>
																					{item.name}
																				</div>
																			}
																		/>
																	</List.Item>
																)}
															/>
														</Modal>
														<Row style={{ textAlign: 'center' }}>
															<Col>
																<br />
																<h3
																	onClick={this.handleSubscribeProfile}
																	style={{ cursor: 'pointer' }}
																>
																	<strong> View more</strong>
																</h3>
															</Col>
														</Row>
													</React.Fragment>
												) : null}
											</div>
										)}
									</Card>
								) : null}

								{this.state.result ? (
									<Card style={{ textAlign: 'center', marginTop: '5%'}}>
										<h3 style = {{fontFamily: 'Techna Sans' }}>Following Keyword</h3>
										<br />
										{this.state.currentUser != this.state.otherId &&
										this.state.result.visitor_profile_info.show_profile_keywords == false ? (
											<div style={{ textAlign: 'center' }}>
												<br />
												<br />
												<h3>
													<strong>This profile is private!</strong>
													<br />
												</h3>
											</div>
										) : (
											<Row>
												{this.state.result ? (
													this.state.result.following_keywords &&
													this.state.result.following_keywords.map((k) => {
														return (
															<Col xs={24} sm={24} md={16} lg={12} key={k.keyword}>
																{k.alert ? (
																	<Col span={22} offset={2}>
																		<a href={'/search/?query=' + k.keyword}>
																			<Badge count={'!'}>
																				<Badge dot={true}>
																					{' '}
																					<Link
																						to={
																							'/search/?query=' +
																							k.keyword
																						}
																					>
																						{' '}
																						<p
																							style={{
																								borderRadius: 25,
																								padding: 10,
																								width: 'auto',
																								height: 'auto',
																								border:
																									'1px solid black',
																								color: 'black'
																							}}
																						>
																							{k.keyword}
																						</p>
																					</Link>
																				</Badge>
																			</Badge>
																		</a>
																	</Col>
																) : (
																	<Col span={22} offset={2}>
																		<Link to={'/search/?query=' + k.keyword}>
																			{' '}
																			<p
																				style={{
																					borderRadius: 25,
																					padding: 10,
																					width: 'auto',
																					height: 'auto',
																					border: '1px solid black',
																					color: 'black'
																				}}
																			>
																				{k.keyword}
																			</p>
																		</Link>
																	</Col>
																)}
															</Col>
														);
													})
												) : null}
											</Row>
										)}
									</Card>
								) : null}
								<Card style={{ marginTop: 30 }}>
									<h3 style={{ textAlign: 'center', fontFamily: 'Techna Sans'}}>My Groups</h3>
									{/* <Row style={{ textAlign: 'center', fontSize: '2em' }}>My Groups</Row> */}
									<Row>
										{this.state.myGroups.map((group, index) => {
											if (index < 3)
												return (
													<Row type="flex" className={'my-group-row'} key={group.id}>
														<div className={'my-group-avatar'}>
															<img src={group.image || avatar} />
														</div>
														<div className={'my-group-name'}>
															<Link style={{ color: 'gray' }} to={'/group/' + group.id}>
																{group.name}
															</Link>
														</div>
														<div className={'my-group-pin'}>
															<Dropdown overlay={this.groupMenu(group.id, group.pinned)}>
																<a className="ant-dropdown-link" href="#">
																	<img src={menuIcon} />
																</a>
															</Dropdown>
														</div>
													</Row>
												);
										})}
									</Row>
									{this.state.myGroups.length > 3 ? (
										<Row
											className={'view-more'}
											onClick={() => this.setState({ isGroupViewMoreOpen: true })}
										>
											View More
										</Row>
									) : null}

									<Modal
										width={620}
										title="My Groups"
										footer={null}
										visible={this.state.isGroupViewMoreOpen}
										onCancel={() =>
											this.setState(
												// onOk={this.handleOk} // visible={this.state.isOpen}
												{ isGroupViewMoreOpen: false }
											)}
									>
										{this.state.myGroups.map((group, index) => {
											return (
												<Row type="flex" className={'my-group-row'} key={group.id}>
													<div className={'my-group-avatar'}>
														<img src={group.image || avatar} />
													</div>
													<div className={'my-group-name'}>
														<Link style={{ color: 'gray' }} to={'/group/' + group.id}>
															{group.name}
														</Link>
													</div>
													<div className={'my-group-pin'}>
														<Dropdown overlay={this.groupMenu(group.id)}>
															<a className="ant-dropdown-link" href="#">
																<img src={menuIcon} />
															</a>
														</Dropdown>
													</div>
												</Row>
											);
										})}
									</Modal>
								</Card>
							</Col>

							<Col xs={24} sm={24} md={24} lg={{ offset: 2, span: 14 }}>
								<Row>
									{this.state.result ? (
										<Col span={24}>
											<div style={{ minWidth: 500 }}>
												{this.state.show_articles_first ? (
													<Tabs>
														<TabPane tab="Commentaries" key="1">
															{this.state.currentUser != this.state.otherId &&
															!this.state.result.visitor_profile_info
																.show_commentary_articles ? (
																<div style={{ textAlign: 'center' }}>
																	<br />
																	<br />
																	<h3>
																		<strong>This profile is private!</strong>
																		<br />
																	</h3>
																</div>
															) : (
																this.state.comments.map((element, index, key) => {
																	return (
																		<GroupFeed
																			key={index}
																			feed={element}
																			commentVisible={
																				element.comment_id ==
																				this.state.openCommentary
																			}
																			refresh={() => this.fetchData()}
																		/>
																	);
																})
															)}
														</TabPane>
														<TabPane tab="My Articles" key="2">
															{this.state.currentUser != this.state.otherId &&
															this.state.result.visitor_profile_info
																.show_commentary_articles == false ? (
																<div style={{ textAlign: 'center' }}>
																	<br />
																	<br />
																	<h3>
																		<strong>This profile is private!</strong>
																		<br />
																	</h3>
																</div>
															) : (
																<div>
																	{this.state.posts.length > 0 ? (
																		<div>
																			{this.state.currentUser ==
																			this.state.otherId ? (
																				<Row>
																					<Col offset={16}>
																						<Button
																							href="/add-news"
																							type="primary"
																						>
																							Upload
																						</Button>
																					</Col>
																				</Row>
																			) : null}
																			{this.state.posts.map(
																				(element, index, key) => {
																					return (
																						<ArticleFeed
																							key={index}
																							feed={element}
																							commentVisible={
																								element.post_id ==
																								this.state.openArticle
																							}
																							refresh={() => {
																								this.fetchPosts();
																								this.fetchComments();
																							}}
																						/>
																					);
																				}
																			)}
																		</div>
																	) : (
																		<Row>
																			{this.state.currentUser ==
																			this.state.otherId ? (
																				<Col>
																					<br />
																					<div
																						style={{ textAlign: 'center' }}
																					>
																						<h2>
																							<strong>
																								Publish or Import
																							</strong>
																							<br />
																							<strong>
																								{' '}
																								your own article (in
																								less than one minute)!
																							</strong>
																						</h2>
																						<p style={{ color: 'black' }}>
																							Why don't you try publish
																							your article with our tools?
																						</p>
																						<br />
																						<br />
																						<Button
																							type="primary"
																							href="/add-news"
																						>
																							Upload
																						</Button>
																					</div>
																				</Col>
																			) : (
																				<List
																					dataSource={
																						this.state.result.my_posts
																					}
																					renderItem={(item) => <List.Item />}
																				/>
																			)}
																		</Row>
																	)}
																</div>
															)}
														</TabPane>
													</Tabs>
												) : (
													<Tabs>
														<TabPane tab="Articles" key="1">
															{this.state.currentUser != this.state.otherId &&
															this.state.result.visitor_profile_info
																.show_commentary_articles == false ? (
																<div style={{ textAlign: 'center' }}>
																	<br />
																	<br />
																	<h3>
																		<strong>
																			This profile is set to Private!
																			{
																				this.state.result.visitor_profile_info
																					.show_commentary_articles
																			}
																		</strong>
																		<br />
																	</h3>
																</div>
															) : (
																<div>
																	{this.state.posts.length > 0 ? (
																		<div>
																			{this.state.currentUser ==
																			this.state.otherId ? (
																				<Row>
																					<Col offset={16}>
																						<Button
																							href="/add-news"
																							type="secondary"
																							style={{backgroundColor: '#9e419b', color: '#ffffff', textAlign: 'center'}}
																						>
																							Publish Article
																						</Button>
																					</Col>
																				</Row>
																			) : null}
																			{this.state.posts.map(
																				(element, index, key) => {
																					return (
																						<ArticleFeed
																							key={index}
																							feed={element}
																							commentVisible={
																								element.post_id ==
																								this.state.openArticle
																							}
																							refresh={() => {
																								this.fetchPosts();
																								this.fetchComments();
																							}}
																						/>
																					);
																				}
																			)}
																		</div>
																	) : (
																		<Row>
																			{this.state.currentUser ==
																			this.state.otherId ? (
																				<Col>
																					<br />
																					<div
																						style={{ textAlign: 'center' }}
																					>
																						<h2>
																							<strong>
																								Publish or Import
																							</strong>
																							<br />
																							<strong>
																								{' '}
																								your own article (in
																								less than one minute)!
																							</strong>
																						</h2>
																						<p style={{ color: 'black' }}>
																							Why don't you try publish
																							your article with our tools?
																						</p>
																						<br />
																						<br />
																						<Button
																							type="primary"
																							href="/add-news"
																						>
																							Upload
																						</Button>
																					</div>
																				</Col>
																			) : (
																				<List
																					dataSource={
																						this.state.result.my_posts
																					}
																					renderItem={(item) => <List.Item />}
																				/>
																			)}
																		</Row>
																	)}
																</div>
															)}
														</TabPane>
														<TabPane tab="Takeaways" key="2">
															{this.state.currentUser != this.state.otherId &&
															!this.state.result.visitor_profile_info
																.show_commentary_articles ? (
																<div style={{ textAlign: 'center' }}>
																	<br />
																	<br />
																	<h3>
																		<strong>This profile is private!</strong>
																		<br />
																	</h3>
																</div>
															) : (
																this.state.comments.map((element, index, key) => {
																	return (
																		<GroupFeed
																			key={index}
																			commentVisible={
																				element.comment_id ==
																				this.state.openCommentary
																			}
																			feed={element}
																			refresh={() => this.fetchData()}
																		/>
																	);
																})
															)}
														</TabPane>
													</Tabs>
												)}
											</div>
										</Col>
									) : null}
								</Row>
							</Col>
						</Row>
					</div>
				</div>
			</div>
		);
	}
}

NewsPage.propTypes = {};

const mapStateToProps = createStructuredSelector({
	newsPage: makeSelectNewsPage(),
	global: makeSelectGlobalState()
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
		fetchPost: (id) => dispatch(a.fetchPosts(id)),
		updateProfile: (data) => dispatch(a.updateProfile(data)),
		fetchProfile: (data) => dispatch(a.fetchProfile(data)),
		reset: () => dispatch(a.resetResponse())
	};
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'newsPage', reducer });
const withSaga = injectSaga({ key: 'newsPage', saga });

export default compose(withReducer, withSaga, withConnect)(NewsPage);
