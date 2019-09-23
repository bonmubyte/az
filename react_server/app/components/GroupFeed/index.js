import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import moment from 'moment';
import axios from '../../utils/http';
import avatar from '../../images/avatar.png';
import { get, _ } from 'lodash';
import LikeButton from '../../containers/NewsPage/like_button.png';
import UnlikeButton from '../../containers/NewsPage/unlike_button.png';
import PinButton from './pin_image.png';
import ReadMoreAndLess from 'react-read-more-less';
import ShareArticleModal from '../ShareArticleModal';
import msgOrange from '../../containers/ViewNews/msgOrange.png';
import msgBlack from '../../containers/ViewNews/msgBlack.png';
import { Row, Col, Input, Avatar, Button, Dropdown, Menu, Icon, List, Modal, Spin } from 'antd';
const { TextArea } = Input;
import './style.css';
import createReactContext from 'create-react-context';
import {
	fetchUser,
	postCommentReply,
	fetchReplies,
	fetchProfile,
	fetchCommentVotes,
	patchCommentReply,
	postCommentVote,
	postReplyVote,
	fetchReplyVotes,
	deleteCommentReply,
	patchReplyVote,
	patchComment,
	deleteReplyVote,
	deletecomment,
	patchCommentVote,
	patchPostReaction,
	deletePostReaction,
	deleteComment,
	deleteCommentVote
} from '../../containers/ViewNews/api';
const IconText = ({ type, text, onClick }) => (
	<span onClick={onClick}>
		<Icon type={type} style={{ marginRight: 8 }} />
		{text}
	</span>
);
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
const loader = <Spin indicator={antIcon} />;
class Replyform extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			replyField: ''
		};
	}

	publishReply = async () => {
		let user = localStorage.getItem('user');
		user = JSON.parse(user);
		const userID = get(user, 'id', null);
		const commentID = get(this, 'props.comment.id');
		const reply = this.state.replyField;
		const object = { user: userID, replied_reply: commentID, reply };
		console.log(object);
		await postCommentReply(object);
		this.setState({ replyField: '' });
		this.props.fetchReplies();
	};

	render() {
		return (
			<div>
				<Row>
					<Col span={16}>
						<textarea
							name="comment"
							rows="3"
							style={{ height: '52px', marginTop: '20px' }}
							value={this.state.replyField}
							onChange={(e) => this.setState({ replyField: e.target.value })}
							placeholder="Write your reply here"
						/>
					</Col>
					<Col offset={1} span={4}>
						<Button
							style={{ marginTop: '20px', marginLeft: '20px' }}
							onClick={() => this.publishReply()}
							type="primary"
						>
							Publish
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
}

const emptyDiv = () => <div />;

class CommentReplyItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: {},
			deleteDialog: false,
			editDialog: false,
			totalUpvotes: 0,
			loading: false,
			votes: [],
			totalDownvotes: 0,
			showDetails: true
		};
	}

	componentDidMount() {
		this.fetchUser();
		this.fetchVotes(this.props.item.id);
	}

	checkVote = async (type) => {
		const replyId = get(this, 'props.item.id', null);
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		const filter = this.state.votes.filter((c) => c.user == userID);
		const totalFiltered = get(filter, 'length', 0);
		const currentVote = get(filter, '[0]', {});
		if (totalFiltered > 0) {
			const currentVoteType = get(currentVote, 'vote_type', '');
			if (currentVoteType == type) {
				await deleteReplyVote(currentVote.id);
			} else {
				// updatePost
				currentVote.vote_type = type;
				await patchReplyVote(currentVote);
			}
		} else {
			const user = JSON.parse(localStorage.getItem('user')) || {};
			const userID = get(user, 'id', null);

			if (replyId > 0 && userID > 0) {
				await postReplyVote({
					reply: replyId,
					vote_type: type,
					user: userID
				});
			}
		}
		this.fetchVotes(replyId);
	};

	async vote(type) {
		this.checkVote(type);
	}

	handleRedirect = () => {
		const { history } = this.props;
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		const replyUserID = get(this, 'props.item.user');
		if (userID == replyUserID) {
			history.push(`/news-page/${userID}`);
		} else {
			history.push(`/news-page/${replyUserID}`);
		}
	};

	fetchVotes = async (replyId) => {
		if (replyId > 0) {
			try {
				const response = await fetchReplyVotes(replyId);
				const votes = get(response, 'data', []);
				const upvotes = votes.filter((c) => c.vote_type == 'UP_VOTE');
				const downvotes = votes.filter((c) => c.vote_type == 'DOWN_VOTE');
				this.setState({ totalUpvotes: upvotes.length });
				this.setState({ totalDownvotes: downvotes.length });
				this.setState({ votes });
			} catch (e) {
				console.log(e.message);
			}
		}
	};

	fetchUser = async () => {
		try {
			const id = get(this, 'props.item.user', null);
			if (id > 0) {
				const response = await fetchProfile(id);
				const user = get(response, 'data[0]', {});
				this.setState({
					user
				});
			}
		} catch (e) {
			console.log(e.message);
		}
	};

	async editReply() {
		this.setState({ loading: true });
		const item = get(this, 'props.item', null);
		if (item) {
			item.reply = get(this, 'state.editValue', '');
			try {
				await patchCommentReply(item);
				this.setState({ loading: false, editValue: '', editDialog: false });
				// message.success('Comment reply edited');
				this.props.refetch();
			} catch (e) {
				// message.error('Something went wrong while editing reply.');
			}
		}
	}

	async deleteNow() {
		this.setState({ loading: true });
		const id = get(this, 'props.item.id', null);
		if (id) {
			try {
				await deleteCommentReply(id);
				this.setState({
					loading: false,
					editValue: '',
					editDialog: false,
					deleteDialog: false
				});
				// message.success('Comment reply deleted');
				this.props.refetch();
			} catch (e) {
				// message.error('Something went wrong while deleting reply.');
			}
		}
	}

	getUser = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		return userID;
	};

	render() {
		const loading = this.state.loading ? loader : <div />;
		return (
			<div id={`reply_${this.props.item.id}`}>
				<Modal
					title="Edit Comment"
					visible={this.state.editDialog}
					onOk={() => this.editReply()}
					onCancel={() => this.setState({ editDialog: false })}
				>
					<Input
						value={this.state.editValue}
						onChange={(e) => this.setState({ editValue: e.target.value })}
					/>
					{loading}
				</Modal>
				<Modal
					title="Modal"
					visible={this.state.deleteDialog}
					onOk={() => this.deleteNow()}
					onCancel={() => this.setState({ deleteDialog: false })}
					okText="Delete Now"
					cancelText="cancel"
				>
					<p>Are you sure you want to delete the dialog?</p>
					{loading}
				</Modal>
				<List.Item
					actions={[
						<IconText onClick={() => this.vote('UP_VOTE')} type="like-o" text={this.state.totalUpvotes} />,
						<IconText
							onClick={() => this.vote('DOWN_VOTE')}
							type="dislike-o"
							text={this.state.totalDownvotes}
						/>,
						<div
							style={{
								display: this.getUser() === this.props.item.user ? 'block' : 'none'
							}}
						>
							<IconText
								onClick={() =>
									this.setState({
										editDialog: true,
										editValue: get(this, 'props.item.reply', '')
									})}
								type="edit"
							/>

							<IconText onClick={() => this.setState({ deleteDialog: true })} type="delete" />
						</div>
					]}
				>
					<List.Item.Meta
						avatar={
							<a onClick={this.handleRedirect}>
								<Avatar src={get(this, 'state.user.image', '')} />
							</a>
						}
						title={
							<div className="title">
								<Link to={`/news-page/${this.state.user.id}`}>{get(this, 'state.user.name', '')}</Link>
								<div
									style={{
										display: 'inline-block',
										fontSize: '12px',
										color: 'gray',
										marginLeft: 10
									}}
								>
									{moment(+new Date(this.props.item.created_at)).fromNow()}
								</div>
							</div>
						}
						description={get(this, 'props.item.reply', '')}
					/>
				</List.Item>
			</div>
		);
	}
}

class CommentReplies extends React.Component {
	renderReplies = () => {
		let replies = get(this, 'props.replies', []);

		if (replies.length == 0) {
			return <div />;
		}
		return (
			<div style={{ paddingLeft: '50px' }}>
				<List
					itemLayout="horizontal"
					dataSource={replies}
					pagination={replies.length > 10}
					renderItem={(item, index) => (
						<CommentReplyItem
							key={index}
							refetch={() => this.props.refetch()}
							history={this.props.history}
							item={item}
						/>
					)}
				/>
			</div>
		);
	};

	render() {
		return <div>{this.renderReplies()}</div>;
	}
}
class Comment extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			user: { email: '' },
			currendUser: this.getName(),
			replyFormShow: false,
			replies: [],
			loading: false,
			editDialog: false,
			editValue: '',
			deleteDialog: false,
			totalUpvotes: 0,
			totalDownvotes: 0,
			votes: [],
			showReplies: true
		};
	}

	fetchVotes = async (commentID) => {
		if (commentID > 0) {
			try {
				const response = await fetchReplyVotes(commentID);
				const votes = get(response, 'data', []);
				const upvotes = votes.filter((c) => c.vote_type == 'UP_VOTE');
				const downvotes = votes.filter((c) => c.vote_type == 'DOWN_VOTE');
				this.setState({ totalUpvotes: upvotes.length });
				this.setState({ totalDownvotes: downvotes.length });
				this.setState({ votes });
			} catch (e) {
				console.log(e.message);
			}
		}
	};

	handleRedirect = () => {
		const { history } = this.props;
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		const commentUserID = get(this, 'props.comment.user');

		if (userID == commentUserID) {
			history.push(`/news-page/${userID}`);
		} else {
			history.push(`/news-page/${commentUserID}`);
		}
	};

	getName = () => {
		const name = get(this, 'state.user.username', '');
		const index = name.indexOf('@');
		if (index > 0) {
			return name.split('@')[0];
		}
		return name;
	};

	fetchUser = async (uid) => {
		try {
			const response1 = await fetchProfile(uid);
			const user = get(response1, 'data[0]', {});
			this.setState({
				user
			});
		} catch (e) {
			console.log(e.message);
		}
	};

	componentDidMount() {
		const comment = get(this, 'props.comment', { comment: '' });
		this.fetchUser(comment.user);
		this.fetchVotes(comment.id);
		this.fetchReplies();
		this.setState({
			upvotes: this.props.comment.upvotes,
			downvotes: this.props.comment.downvotes,
			votes: this.props.comment.votes,
			user: comment.user
			//	replies: this.props.comment.replies
		});
		console.log('comment did mount');
	}
	getVotes() {
		return {
			upVotes: this.state.totalUpvotes,
			downVotes: this.state.totalDownvotes
		};
	}
	fetchReplies = async () => {
		const commentID = get(this, 'props.comment.id', null);
		if (commentID) {
			const response = await fetchReplies(commentID);
			const data = get(response, 'data', []);
			this.setState({
				replies: data.reverse()
			});
			this.props.updateCount();
		}
	};

	check = async (type) => {
		const commentID = get(this, 'props.comment.id', null);
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		const filter = this.state.votes.filter((c) => c.user == userID);
		const totalFiltered = get(filter, 'length', 0);
		const currentVote = get(filter, '[0]', {});
		console.log('current vote', currentVote);
		if (totalFiltered > 0) {
			const currentVoteType = get(currentVote, 'vote_type', '');
			if (currentVoteType == type) {
				await deleteReplyVote(currentVote.id);
			} else {
				// updatePost
				currentVote.vote_type = type;
				await patchReplyVote(currentVote);
			}
		} else {
			const user = JSON.parse(localStorage.getItem('user')) || {};
			const userID = get(user, 'id', null);

			if (commentID > 0 && userID > 0) {
				await postReplyVote({
					reply: commentID,
					vote_type: type,
					user: userID
				});
			}
		}
		this.fetchVotes(commentID);
	};

	vote = async (type) => {
		this.check(type);
	};

	async deleteNow() {
		this.setState({ loading: false });
		const id = get(this, 'props.comment.id', null);
		if (id) {
			try {
				await deleteCommentReply(id);
				this.setState({
					loading: false,
					editValue: '',
					editDialog: false,
					deleteDialog: false
				});
				//		message.success('Comment deleted');
				this.props.refetch();
			} catch (e) {
				console.log(e.message);
				//		message.error('Something went wrong while deleting comment.');
			}
		}
	}

	async editComment() {
		this.setState({ loading: true });
		const item = get(this, 'props.comment', null);
		if (item) {
			item.reply = get(this, 'state.editValue', '');
			try {
				console.log(item);
				await patchCommentReply(item);
				this.setState({ loading: false, editValue: '', editDialog: false });

				this.props.refetch();
			} catch (e) {}
		}
	}

	getUser = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		return userID;
	};

	render() {
		const loading = this.state.loading ? loader : <div />;
		const comment = get(this, 'props.comment', { comment: '' });
		let ReplyContent = Replyform;
		if (!this.state.replyFormShow) {
			ReplyContent = emptyDiv;
		}

		return (
			<div style={{ width: '80%' }} id={`comment_${this.props.comment.id}`}>
				<Modal
					title="Edit Comment"
					visible={this.state.editDialog}
					onOk={() => this.editComment()}
					onCancel={() => this.setState({ editDialog: false })}
				>
					<Input
						value={this.state.editValue}
						onChange={(e) =>
							this.setState({
								editValue: e.target.value
							})}
					/>
					{loading}
				</Modal>
				<Modal
					title="Delete Comment"
					visible={this.state.deleteDialog}
					onOk={() => this.deleteNow()}
					onCancel={() => this.setState({ deleteDialog: false })}
					okText="Delete Now"
					cancelText="cancel"
				>
					<p>Are you sure you want to delete the dialog?</p>
					{loading}
				</Modal>
				<List.Item
					actions={[
						<IconText onClick={() => this.vote('UP_VOTE')} type="like-o" text={this.state.totalUpvotes} />,
						<IconText
							onClick={() => this.vote('DOWN_VOTE')}
							type="dislike-o"
							text={this.state.totalDownvotes}
						/>,
						<Icon
							type="aliwangwang"
							onClick={() => this.setState({ replyFormShow: !this.state.replyFormShow })}
						/>,
						<div
							style={{
								display: this.getUser() === this.props.comment.user ? 'block' : 'none'
							}}
						>
							<IconText
								onClick={() =>
									this.setState({
										editDialog: true,
										editValue: get(this, 'props.comment.comment', '')
									})}
								type="edit"
							/>
							<IconText
								onClick={() =>
									this.setState({
										deleteDialog: true
									})}
								type="delete"
							/>
						</div>
					]}
				>
					<List.Item.Meta
						avatar={
							<a onClick={this.handleRedirect}>
								<Avatar src={get(this, 'state.user.image', '')} />
							</a>
						}
						title={
							<div>
								<Link to={`/news-page/${this.state.user.id}`}>{get(this, 'state.user.name', '')}</Link>

								<a id={'comments_' + comment.id} href={'#comments_' + comment.id}>
									<p style={{ display: 'inline-block', fontSize: '12px', marginLeft: 10 }}>
										{moment(+new Date(this.props.comment.created_at)).fromNow()}
									</p>
								</a>
							</div>
						}
						description={comment.reply}
					/>
				</List.Item>
				<List.Item.Meta
					title={
						<div
							onClick={() =>
								this.setState({
									showReplies: !this.state.showReplies
								})}
						>
							{this.state.showReplies && this.state.replies.length > 0 ? (
								<div style={{ color: 'gray', cursor: 'pointer' }}>
									Hide Replies <Icon type={'up'} style={{ marginTop: -8 }} />
								</div>
							) : null}
							{!this.state.showReplies && this.state.replies.length > 0 ? (
								<div style={{ color: 'gray', cursor: 'pointer' }}>
									View {this.state.replies.length}
									replies <Icon type={'down'} style={{ marginRight: 8 }} />
								</div>
							) : null}
						</div>
					}
				/>
				{this.state.showReplies ? (
					<div>
						<CommentReplies
							history={this.props.history}
							replies={this.state.replies}
							refetch={this.fetchReplies}
							comment={comment}
						/>
					</div>
				) : null}
				<ReplyContent comment={comment} fetchReplies={() => this.fetchReplies()} />
			</div>
		);
	}
}
export default class GroupFeed extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			shareArticleModalVisible: false,
			commentActive: this.props.commentVisible,
			totalComments: 0,
			totalReplies: 0,
			post: [],
			sortBy: 'recent',
			comments: []
		};
	}
	toggleComments = () => {
		this.setState({
			commentActive: !this.state.commentActive
		});
	};
	fetchComments = () => {
		axios.get(`/api/get_comment_replies_by_comment/?comment=${this.props.feed.comment_id}`).then((response) => {
			this.setState({ comments: response.data, totalComments: response.data.length });
		});
		this.getTotalRepliesCount();
	};
	getTotalRepliesCount = () => {
		axios.get(`/api/get_total_replies_count/?comment=${this.props.feed.comment_id}`).then((response) => {
			this.setState({
				totalReplies: response.data.total
			});
		});
	};
	componentDidMount() {
		this.setState({
			post: [
				{
					id: this.props.feed.post_id,
					avatar: this.props.feed.post_avatar,
					author: this.props.feed.post_author,
					comments: this.props.feed.comment,
					comment_id: this.props.feed.comment_id,
					title: this.props.feed.post_title,
					views: this.props.feed.post_views,
					time: moment(+new Date(this.props.feed.post_time)).fromNow()
				}
			]
		});
		this.fetchComments();
	}
	sortMenu = () => {
		return (
			<Menu>
				<Menu.Item key="0">
					<a onClick={() => this.sortByLikes()}>Top Comments</a>
				</Menu.Item>
				<Menu.Item key="1">
					<a onClick={() => this.sortByRecents()}>Most Recents</a>
				</Menu.Item>
			</Menu>
		);
	};
	renderComments = () => {
		if (this.state.commentsEmpty) {
			return <div />;
		}
		const writeReply = () => {
			const { TextArea } = Input;
			return <TextArea rows={4} />;
		};

		this.state.comments.map(async (comment) => {
			if (comment.id > 0) {
				try {
					let response = await fetchReplyVotes(comment.id);
					const votes = get(response, 'data', []);
					const upvotes = votes.filter((c) => c.vote_type == 'UP_VOTE');
					const downvotes = votes.filter((c) => c.vote_type == 'DOWN_VOTE');
					comment.upvotes = upvotes.length;
					comment.downvotes = downvotes.length;
					comment.votes = votes;

					return comment;
				} catch (e) {
					console.log(e.message);
				}
			}
		});
		console.log('comments', this.state.comments);
		if (this.state.sortBy == 'vote') {
			this.state.comments.sort((a, b) => {
				return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
			});
			console.log('comments', this.state.comments);
		} else if (this.state.sortBy == 'recent') {
			this.state.comments.sort((a, b) => {
				return new Date(b.created_at) - new Date(a.created_at);
			});
		}
		if (this.state.comments instanceof Array) {
			if (this.state.comments.length == 0) {
				return <div>No Comments</div>;
			}
			console.log('comments render');
			const commentA = this.state.comments.map((c, index) => (
				<Comment
					key={c.id}
					history={this.props.history}
					comment={c}
					updateCount={() => this.getTotalRepliesCount()}
					// addRepliesCount={(count) => (this.state.totalComments = this.state.totalComments + count + 1)}
					refetch={() => {
						this.fetchComments();
					}}
				/>
			));

			return (
				<div>
					<List
						itemLayout="vertical"
						size="large"
						dataSource={commentA}
						renderItem={(a) => <div key={a.id}>{a}</div>}
					/>
				</div>
			);
		}
	};
	sortByLikes = () => {
		this.setState({ sortBy: 'vote' });
	};
	sortByRecents = () => {
		this.setState({ sortBy: 'recent' });
	};
	removeComment = async (id) => {
		if (this.props.feed.group_id == -1) {
			await deleteComment(id);
		} else {
			await axios.get(`/api/remove_group_feed_by_id/?comment=${id}`);
		}
		this.props.refresh();
	};
	pinComment = async (group, comment) => {
		let data = new FormData();
		if (group != -1) {
			data.append('group', group);
			data.append('comment', comment);
			await axios.post(`/api/add_pin_to_group/`, data);
			this.props.refresh();
		} else {
			const user = JSON.parse(localStorage.getItem('user')) || {};
			data.append('user', get(user, 'id', null));
			data.append('saved_post_id', comment);
			await axios.post('/api/pin_commentary/', data);
			this.props.refresh();
		}
	};
	publishComment = async () => {
		let user = localStorage.getItem('user');
		user = JSON.parse(user);
		const userID = get(user, 'id', null);
		const reply = this.state.commentField;
		const object = { user: userID, comment: this.props.feed.comment_id, reply };
		await postCommentReply(object);
		this.setState({ commentField: '' });
		//  this.props.fetchReplies();
		this.fetchComments();
	};
	commentaryMenu = (id, groupCreator, feedCreator, pinned, groupId, commentId) => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		let content = <React.Fragment />;
		if (currentUser == groupCreator || currentUser == feedCreator) {
			content = (
				<Menu>
					{currentUser == groupCreator || groupCreator == -1 ? (
						<Menu.Item>
							<div
								onClick={() => {
									this.pinComment(groupId, commentId);
								}}
							>
								<p style={{ cursor: 'pointer' }}>
									{pinned == 'pinned' ? 'Unpin the commentary' : 'Pin the commentary'}
								</p>
							</div>
						</Menu.Item>
					) : null}

					{currentUser == feedCreator ? (
						<Menu.Item>
							<div
								onClick={() => {
									this.removeComment(id);
								}}
							>
								<p style={{ cursor: 'pointer' }}>Delete</p>
							</div>
						</Menu.Item>
					) : null}
				</Menu>
			);
		}
		return content;
	};
	voteFeed = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		let data = new FormData();
		data.append('user', currentUser);
		data.append('comment', this.props.feed.comment_id);
		axios
			.post(`/api/vote_comment/`, data)
			.then((response) => {
				this.props.refresh();
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	closeShareArticleModal = () => {
		this.setState({
			shareArticleModalVisible: false
		});
		this.fetchComments();
	};
	render() {
		return (
			<Row className={'feed-card'} id={`commentary_${this.props.feed.comment_id}`}>
				<Row type="flex" span={24}>
					<Col>
						<Avatar
							src={this.props.feed.user_avatar || avatar}
							className={'feed-user-avatar'}
							shape="square"
						/>
					</Col>
					<Col className={'feed-user'}>
						<Link to={`/news-page/${this.props.feed.creator_id}`}>
							&nbsp; <strong>{this.props.feed.user_name}</strong> &nbsp;
							<small>{moment(+new Date(this.props.feed.comment_time)).fromNow()}</small>
						</Link>
					</Col>

					<Col className={'feed-group'}>
						{this.props.feed.group_id != -1 ? (
							<React.Fragment>
								<Link to={`/group/${this.props.feed.group_id}`}>
									From <span className={'group-name'}>{this.props.feed.group_name}</span>
									&nbsp;&nbsp;
								</Link>
								<Avatar shape="square" src={this.props.feed.group_image} />
							</React.Fragment>
						) : null}

						<Dropdown
							trigger={[ 'click' ]}
							overlay={this.commentaryMenu(
								this.props.feed.comment_id,
								this.props.feed.group_creator,
								this.props.feed.creator_id,
								this.props.feed.pinned,
								this.props.feed.group_id,
								this.props.feed.comment_id
							)}
						>
							<div style={{ cursor: 'pointer', marginLeft: 10 }}>
								<Icon type="ellipsis" />
							</div>
						</Dropdown>
					</Col>
				</Row>
				<Row className="feed-comment">
					<ReadMoreAndLess
						ref={this.ReadMore}
						className="read-more-content"
						charLimit={195}
						readMoreText="Read More"
						readLessText="Read Less"
					>
						{this.props.feed.comment}
					</ReadMoreAndLess>
				</Row>
				<Link to={`/view/${this.props.feed.post_id}`} style={{ color: 'inherit' }}>
					<Row className={'post-card'}>
						<Row>
							<Col className={'post-avatar'} span={1}>
								<img src={this.props.feed.post_avatar || avatar} alt="PostImage" />
							</Col>
							<Col className={'post-content'}>
								<Row className={'post-title'}>{this.props.feed.post_title}</Row>
								<Row className={'post-info'}>
									<span className={'post-author'}>{this.props.feed.post_user}</span>
									&nbsp;&nbsp;
									<span className={'post-time'}>
										{moment(+new Date(this.props.feed.post_time)).fromNow()}{' '}
									</span>
									&nbsp;&nbsp;
									<span className={'post-views'}>{this.props.feed.post_views} Views</span>
								</Row>
							</Col>
						</Row>
					</Row>
				</Link>
				<Row style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid gray' }} type="flex">
					<Col style={{ marginTop: 10, marginLeft: 10, display: 'flex' }}>
						<div onClick={() => this.voteFeed()} style={{ marginRight: 10 }}>
							<img
								style={{ cursor: 'pointer', height: 32, width: 32 }}
								src={this.props.feed.like == 'like' ? LikeButton : UnlikeButton}
							/>
						</div>
						<span>{this.props.feed.votes} votes</span>
					</Col>
					<Col style={{ marginLeft: 30, display: 'flex' }}>
						<img
							style={{ width: 54, height: 46, cursor: 'pointer', marginRight: 10 }}
							src={this.state.commentActive ? msgOrange : msgBlack}
							onClick={this.toggleComments}
						/>
						<span style={{ lineHeight: '2.5em' }}>{this.state.totalComments} Comments</span>
					</Col>
					<Col style={{ marginLeft: 'auto' }}>
						{/* <br /> */}
						<Button
							style={{ borderRadius: 10, width: 100, marginTop: 10, backgroundColor: '#9e419b', color: '#ffffff' }}
							onClick={() =>
								this.setState({
									shareArticleModalVisible: true
								})}
							type="secondary"
						>
							Take
						</Button>
					</Col>
				</Row>
				<ShareArticleModal
					visible={this.state.shareArticleModalVisible}
					posts={this.state.post}
					commentId={this.props.feed.comment_id}
					kind={1}
					onClose={() => this.closeShareArticleModal()}
				/>
				{this.state.commentActive ? (
					<React.Fragment>
						<Row>
							<Col style={{ fontSize: '.8em' }} span={4}>
								{this.state.totalReplies} Comments
							</Col>
							<Col style={{ cursor: 'pointer', fontSize: '.8em' }} offset={1} span={5}>
								<Dropdown overlay={this.sortMenu} trigger={[ 'click' ]}>
									<div className="ant-dropdown-link" href="#">
										{this.state.sortBy == 'vote' ? 'Top Comments' : 'Most Recent'}
										<Icon type="down" />
									</div>
								</Dropdown>
							</Col>
						</Row>

						<Row type="flex">
							<Col span={20}>
								<textarea
									name="comment"
									rows="3"
									value={this.state.commentField}
									onChange={(e) =>
										this.setState({
											commentField: e.target.value
										})}
									placeholder="Write your comment here."
								/>
							</Col>
							<Col style={{ marginLeft: 'auto' }}>
								<Button onClick={() => this.publishComment()} type="secondary" style = {{backgroundColor: '#9e419b', color: '#ffffff'}}>
									Publish
								</Button>
							</Col>
						</Row>
						<Row>
							<Col span={24} style={{ textAlign: 'left' }}>
								{this.renderComments()}
							</Col>
						</Row>
					</React.Fragment>
				) : null}
			</Row>
		);
	}
}
