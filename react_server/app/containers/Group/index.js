import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Header from '../Headerr/Loadable';
import MyGroupsPanel from '../../components/MyGroupsPanel';
import GroupFeed from '../../components/GroupFeed';
import { Link } from 'react-router-dom';
import moment from 'moment';
import { get, _ } from 'lodash';
import axios from '../../utils/http';
import avatar from '../../images/avatar.png';
import CreateGroupModal from '../../components/CreateGroupModal';
import SelectArticleModal from '../../components/SelectArticleModal';
import ShareArticleModal from '../../components/ShareArticleModal';
import InviteModal from '../../components/InviteModal';
import { Row, Col, Button, Input, notification, Form } from 'antd';
const { TextArea } = Input;
import './style.css';

const GROUP_COLORS = [ 'red', 'green', 'blue', 'yellow' ];

const SelectedPostsPanel = (props) => {
	return (
		<Row className={'select-article-panel'}>
			<Row className={'select-article-panel-heading'} type="flex">
				<div />
				<Input
					className={'select-article-comment'}
					placeholder="Add Something to Say"
					value={props.comment}
					onChange={props.onChangeComment}
				/>
			</Row>
			<Row> {props.posts.length > 0 && 'Selected Article:'}</Row>
			<Row className={'select-article-panel-content'}>
				{props.posts.map((post) => {
					return (
						<Row className={'post-card'}>
							<Row>
								<Col className={'post-avatar'} span={1}>
									<img src={post.avatar || avatar} alt="PostImage" />
								</Col>
								<Col className={'post-content'}>
									<Row className={'post-title'}>{post.title}</Row>
									<Row className={'post-info'}>
										<span className={'post-author'}>{post.author}</span>
										&nbsp;&nbsp;
										<span className={'post-time'}>{post.time} ago</span>
									</Row>
								</Col>
							</Row>
						</Row>
					);
				})}
			</Row>

			{props.posts.length > 0 ? (
				<Row type="flex" justify="center" className={'select-article-panel-footer'}>
					<Button className={'select-article-button'} type="primary" onClick={props.shareArticle} style = {{backgroundColor: '#9e419b'}}>
						Post it to Group
					</Button>
				</Row>
			) : (
				<Row type="flex" justify="end" className={'select-article-panel-footer'}>
					<Button
						className={'select-article-button'}
						type="primary"
						shape="round"
						onClick={props.selectArticle}
					>
						Select article
					</Button>
				</Row>
			)}
		</Row>
	);
};
const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};
export default class Group extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			comment: '',
			visibleGroups: 3,
			createGroupModalVisible: false,
			selectArticleModalVisible: false,
			inviteModalVisible: false,
			shareArticleModalVisible: false,
			groupFeeds: [],
			groupPosts: [],
			myGroups: [],
			selectedPosts: [],
			joined: true,
			currentGroupInfo: {},
			loaded: false,
			openCommentary: -1,
			openCommentaryComment: -1,
			openCommentaryReply: -1,
			currentUserId: -1,
			currentGroup: -1,
			thumbnail_image: '',
			layoutMode: 'desktop'
		};
		this.handleCreateNewGroup = this.handleCreateNewGroup.bind(this);
		if (location.href.split('#').length == 2) {
			let values = location.href.split('#')[1].split('_');

			switch (values[0]) {
				case 'comment':
					this.state.openCommentary = values[1];
					this.state.openCommentaryComment = values[2];
					break;
				case 'reply':
					this.state.openCommentary = values[1];
					this.state.openCommentaryReply = values[2];
					break;
				case 'commentary':
					this.state.openCommentary = values[1];
					break;
			}
		}
	}
	shouldComponentUpdate() {
		return true;
	}
	componentDidMount() {
		this.fetchGroupInfo();
		this.fetchMyGroups();
		this.fetchGroupPosts();
		this.fetchGroupFeeds();
		window.addEventListener('resize', this.updateLayout);
		setTimeout(() => {
			if (this.state.openCommentaryComment != -1) {
				document.getElementById('comment_' + this.state.openCommentaryComment).scrollIntoView(false);
			} else if (this.state.openCommentaryReply != -1) {
				document.getElementById('reply_' + this.state.openCommentaryReply).scrollIntoView(false);
			} else if (this.state.openCommentary != -1) {
				document.getElementById('commentary_' + this.state.openCommentary).scrollIntoView(false);
			}
		}, 2000);
	}
	componentDidUpdate() {}
	fetchGroupInfo = () => {
		const currentGroup = window.location.href.split('/')[window.location.href.split('/').length - 1].split('#')[0];
		const user = JSON.parse(localStorage.getItem('user')) || {};
		this.state.currentUserId = get(user, 'id', null);
		this.state.currentGroup = currentGroup;
		axios.get(`/api/check_group_alert/?group=${currentGroup}`);
		axios
			.get(`/api/get_groupinfo_by_id/?group=${currentGroup}`)
			.then((response) => {
				console.log('group info', response.data.group);
				this.setState({
					currentGroupInfo: response.data.group
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	fetchGroupPosts = () => {
		const currentGroup = window.location.href.split('/')[window.location.href.split('/').length - 1].split('#')[0];
		axios
			.get(`/api/get_all_posts/?group=${currentGroup}`)
			.then((response) => {
				let data = [];
				console.log('group posts', response);
				response.data.posts.map((post) => {
					let p = {
						id: post.id,
						avatar: post.img_url,
						author: post.publisher.name,
						comments: post.total_comments,
						title: post.title,
						views: post.total_views,
						time: moment(+new Date(post.created_at)).fromNow()
					};
					data = [ p, ...data ];
				});
				console.log('group posts', data);
				this.setState({ groupPosts: data });
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	voteFeed = (index, id) => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		let data = new FormData();
		data.append('user', currentUser);
		data.append('comment', id);
		axios
			.post(`/api/vote_comment/`, data)
			.then((response) => {
				this.state.groupFeeds[index]['like'] = response.data['like_status'];
				this.state.groupFeeds[index]['votes'] = response.data['like_count'];
				this.setState({
					groupFeeds: this.state.groupFeeds
				});
				console.log('after vote', this.state.groupFeeds);
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	fetchMyGroups = () => {
		console.log('fetch groups');
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		axios
			.get(`/api/get_groups_by_user/?user=${currentUser}`)
			.then((response) => {
				response.data.groups.map((group, index) => {
					group.color = GROUP_COLORS[group.id % GROUP_COLORS.length];
					group.notification = 0;
				});
				this.setState({
					myGroups: response.data.groups
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	fetchGroupFeeds = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		const currentGroup = window.location.href.split('/')[window.location.href.split('/').length - 1].split('#')[0];

		axios
			.get(`/api/get_group_feeds_by_group/?group=${currentGroup}&user=${currentUser}`)
			.then((response) => {
				//	let data = response.data.feeds.filter((element, index) => index < this.state.visibleGroups);
				for (let i = 0; i < response.data.feeds.length; i++) {
					response.data.feeds[i]['group_color'] =
						GROUP_COLORS[response.data.feeds[i].group_id % GROUP_COLORS.length];
					if (response.data.feeds[i]['pinned'] == 'pinned') {
						response.data.feeds.splice(0, 0, response.data.feeds.splice(i, 1)[0]);
					}
				}
				this.setState({
					groupFeeds: response.data.feeds
				});
				console.log('reponse feeds', response.data.feeds);
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	onJoin = () => {
		const currentGroup = this.props.location.pathname.split('/')[
			this.props.location.pathname.split('/').length - 1
		];
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		if (this.state.joined) {
			axios
				.get(`/api/unjoin_group_by_user/?group=${currentGroup}&user=${currentUser}`)
				.then((response) => {
					console.log('unjoined', response);
					this.fetchMyGroups();
				})
				.catch(function(error) {
					console.log(error);
				});
		} else {
			axios
				.get(`/api/join_group_by_user/?group=${currentGroup}&user=${currentUser}`)
				.then((response) => {})
				.catch(function(error) {
					console.log(error);
				});
		}
		this.setState({ joined: !this.state.joined });
	};
	onInvite = () => {
		this.setState({ inviteModalVisible: true });
	};
	handleCreateNewGroup = () => {};
	handleSelectedPost = (post) => {
		this.setState({
			selectArticleModalVisible: false
		});
		this.state.selectedPosts.push(post);
	};
	shareArticle = (id) => {
		if (this.state.comment.length > 0) {
			let selectedId = id || this.state.selectedPosts[0].id;
			const user = JSON.parse(localStorage.getItem('user')) || {};
			const currentUser = get(user, 'id', null);
			const currentGroup = this.props.location.pathname.split('/')[
				this.props.location.pathname.split('/').length - 1
			];
			let data = new FormData();
			if (currentUser) {
				data.append('user', currentUser);
			} else {
				data.append('user', -1);
			}
			let groups = [ currentGroup ];
			data.append('groups', groups);
			data.append('comment', this.state.comment);
			data.append('post', selectedId);
			this.setState({ comment: '' });
			axios
				.post(`/api/add_group_comment/`, data)
				.then((response) => {
					this.fetchGroupFeeds();
				})
				.catch(function(error) {
					console.log(error);
				});
		} else
			this.setState({
				shareArticleModalVisible: true
			});
	};
	onChangeComment = (e) => {
		this.setState({ comment: e.target.value });
	};
	handleSharePost = (post) => {
		this.setState({
			selectArticleModalVisible: false
		});
		this.state.selectedPosts.push(post);
	};
	closeShareArticleModal = () => {
		this.setState({
			shareArticleModalVisible: false
		});
		this.fetchGroupFeeds();
	};
	closeInviteDialog = () => {
		this.setState({ inviteModalVisible: false });
		this.fetchGroupInfo();
		this.fetchGroupPosts();
		this.fetchGroupFeeds();
	};
	getBase64 = (file, attribute) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		const a = this;
		reader.onload = function() {
			let data = new FormData();
			data.append('file', reader.result);
			data.append('group', a.state.currentGroup);
			axios.post('/api/add_group_photo/', data).then((r) => {});
			axios({
				method: 'post',
				url: '/api/add_group_photo/',
				data: data
			})
				.then(function(response) {
					a.fetchGroupInfo();
				})
				.catch(function(response) {
					console.log(response);
				});
		};
		reader.onerror = function(error) {};
	};

	handleFileUpload(e, attribute) {
		e.persist();
		this.getBase64(e.target.files[0], attribute);
	}
	updateLayout = () => {
		if (window.innerWidth < 1200 && this.state.layoutMode == 'desktop') {
			this.setState({ layoutMode: 'mobile' });
		}
		if (window.innerWidth >= 1200 && this.state.layoutMode == 'mobile') {
			this.setState({ layoutMode: 'desktop' });
		}
	};
	render() {
		let myGroups = (
			<div>
				<MyGroupsPanel
					onCreate={() =>
						this.setState({
							createGroupModalVisible: true
						})}
					groups={this.state.myGroups}
				/>
				<CreateGroupModal
					visible={this.state.createGroupModalVisible}
					onClose={() =>
						this.setState({
							createGroupModalVisible: false
						})}
					onCreate={() => this.fetchMyGroups()}
				/>
				<SelectArticleModal
					visible={this.state.selectArticleModalVisible}
					onSelectArticle={this.handleSelectedPost}
					posts={this.state.groupPosts}
					onClose={() =>
						this.setState({
							selectArticleModalVisible: false
						})}
				/>
				<ShareArticleModal
					visible={this.state.shareArticleModalVisible}
					posts={this.state.selectedPosts}
					commentId={-1}
					kind={2}
					onClose={() => this.closeShareArticleModal()}
				/>
			</div>
		);
		let groupDescription = (
			<Row className={'current-group-detail'}>
				<Row className={'current-group-heading'}>
					About <span className={'current-group-detail-name'}>{this.state.currentGroupInfo.name}</span>
				</Row>
				<Row>{this.state.currentGroupInfo.privacy ? 'Public Group' : 'Private Group'}</Row>
				<Row>{this.state.currentGroupInfo.visible ? 'Visible Group' : 'Non-visible Group'}</Row>
				<h4>Group Description</h4>
				<Row>{this.state.currentGroupInfo.description}</Row>
			</Row>
		);
		let postsPanel = (
			<Row className={'posts-panel'}>
				<SelectedPostsPanel
					onChangeComment={this.onChangeComment}
					comment={this.state.comment}
					posts={this.state.selectedPosts}
					selectArticle={() =>
						this.setState({
							selectArticleModalVisible: true
						})}
					shareArticle={() => this.shareArticle()}
				/>
				<Row>
					{this.state.groupFeeds.map((element, index) => {
						return (
							<GroupFeed
								key={element.comment_id}
								feed={element}
								commentVisible={element.comment_id == this.state.openCommentary}
								refresh={() => this.fetchGroupFeeds()}
								vote={() => this.voteFeed(index, element.comment_id)}
							/>
						);
					})}
				</Row>
			</Row>
		);
		let groupInfo = (
			<Row span={24} className={'current-group'}>
				{this.state.currentGroupInfo.creator == this.state.currentUserId ? (
					<div className={'current-group-avatar-new'}>
						<img src={this.state.currentGroupInfo.image || avatar} />
						<div>
							<input
								style={{ display: 'none' }}
								className="one-upload"
								onChange={(e) => this.handleFileUpload(e, 'thumbnail_image')}
								type="file"
							/>

							<Button onClick={() => document.querySelector('.one-upload').click()}>
								Upload Picture
							</Button>
						</div>
					</div>
				) : (
					<div className={'current-group-avatar'}>
						<img src={this.state.currentGroupInfo.image || avatar} />
					</div>
				)}

				<div className={'current-group-content'}>
					<div className={'current-group-name'}>{this.state.currentGroupInfo.name}</div>
					<div className={'current-group-info'}>
						{this.state.currentGroupInfo.members} Members {this.state.currentGroupInfo.posts}
						Posts
					</div>
				</div>
			</Row>
		);
		let groupFooter = (
			<Row span={24} type="flex" justify="end" style={{ margin: 'auto 25px' }}>
				<div className={'current-group-button'} onClick={this.onJoin}>
					{this.state.joined ? 'Unjoin' : 'Join'}
				</div>
				{this.state.currentGroupInfo.creator == this.state.currentUserId ? (
					<div className={'current-group-button'} onClick={this.onInvite}>
						Invite
					</div>
				) : null}

				<InviteModal visible={this.state.inviteModalVisible} onClose={() => this.closeInviteDialog()} />
			</Row>
		);
		return (
			<div>
				<Helmet>
					<title>Group</title>
					<meta name="description" content="Description of Group" />
				</Helmet>
				<Header history={this.props.history} />
				<div className="bg-white">
					<Row className="container" style={{ marginTop: 90 }}>
						{this.state.layoutMode == 'mobile' ? (
							<div>
								{myGroups}
								{groupInfo}
								{groupFooter}
								{groupDescription}
								{postsPanel}
							</div>
						) : (
							<div>
								{groupInfo}
								{groupFooter}
								<Col span={16}>{postsPanel}</Col>
								<Col span={8}>
									{groupDescription}
									{myGroups}
								</Col>
							</div>
						)}
					</Row>
				</div>
			</div>
		);
	}
	componentWillReceiveProps(nextProps) {
		if (nextProps.match.params.id !== this.props.match.params.id) {
			this.fetchMyGroups();
			this.fetchGroupInfo();
			this.fetchGroupFeeds();
			this.fetchGroupPosts();
		}
	}
}
