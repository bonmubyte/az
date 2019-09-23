/**
 *
 * ViewNews
 *
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import axios from '../../utils/http';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Link } from 'react-router-dom';
import injectSaga from 'utils/injectSaga';
import { get } from 'lodash';
import People from 'components/People';
import createHistory from 'history/createBrowserHistory';
import InfiniteCarousel from 'react-leaf-carousel';
import './bubble.css';
import alter from './alter.jpg';
import msg from './msg.png';
import rect from './rect.png';
import bar from './bar.png';

import ShareArticleModal from '../../components/ShareArticleModal';
import barOrange from './barOrange.png';
import barBlack from './barBlack.png';
import msgOrange from './msgOrange.png';
import msgBlack from './msgBlack.png';
import rectOrange from './rectOrange.png';
import rectBlack from './rectBlack.png';
import questionMark from './questionMark.png';
import modal from './modal.png';
import injectReducer from 'utils/injectReducer';
import avatar from '../../images/avatar.png';
import {
	Row,
	Col,
	Icon,
	Button,
	Form,
	List,
	Avatar,
	Input,
	Modal,
	message,
	Timeline,
	Tooltip,
	Checkbox,
	Dropdown,
	Menu
} from 'antd';
const { TextArea } = Input;
import moment from 'moment';
import { Spin } from 'antd';
import styled from 'styled-components';
import { empty } from 'rxjs';
import {
	fetchUser,
	postCommentReply,
	fetchCommentReplies,
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
} from './api';

let max_1 = 0;
let max_2 = 0;

import isUrl from 'is-url';
import makeSelectGlobalState from '../App/selectors';
import makeSelectViewNews from './selectors';
import reducer from './reducer';
import saga from './saga';
import Header from '../Headerr/Loadable';
import * as a from './actions';

import * as Scroll from 'react-scroll';
import { Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll';

const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;
const loader = <Spin indicator={antIcon} />;
const Wrapper = styled.div`
	margin: 20px auto;
	text-align: left;
	.main-heading {
		margin-bottom: 30px;
	}
	h3 {
		color: #555;
	}
	p {
		margin: auto 20px;
	}
	.main-sentence {
		margin: 50px auto;
	}
	.save-btn {
		margin-top: 50px;
		margin-right: 10px;
	}
	.comment {
		margin-top: 50px;
	}
`;

const IconText = ({ type, text, onClick }) => (
	<span onClick={onClick}>
		<Icon type={type} style={{ marginRight: 8 }} />
		{text}
	</span>
);

const Sidebar = styled.div`
	border-left: 1px solid #eee;
	height: 600px;
	margin-left: 50px;
	i {
		margin-bottom: 5px;
	}
	img {
		margin-top: 50px;
	}
`;

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
		const object = { user: userID, comment: commentID, reply };
		await postCommentReply(object);
		this.setState({ replyField: '' });
		this.props.fetchReplies();
	};

	render() {
		return (
			<div>
				<Row>
					<Col span={10}>
						<textarea
							name="comment"
							rows="3"
							style={{ height: '52px', marginTop: '20px' }}
							value={this.state.replyField}
							onChange={(e) => this.setState({ replyField: e.target.value })}
							placeholder="Write ur reply here"
						/>
					</Col>
					<Col span={4}>
						<Button
							style={{ marginTop: '20px', marginLeft: '20px', backgroundColor: '#9e419b' }}
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
				message.success('Comment reply edited');
				this.props.refetch();
			} catch (e) {
				message.error('Something went wrong while editing reply.');
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
				message.success('Comment reply deleted');
				this.props.refetch();
			} catch (e) {
				message.error('Something went wrong while deleting reply.');
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
								<a onClick={this.handleRedirect}>{get(this, 'state.user.name', '')}</a>
								<p
									style={{
										display: 'inline-block',
										fontSize: '12px',
										color: '#4286f4'
									}}
								>
									{moment(+new Date(this.props.item.created_at)).fromNow()}
								</p>
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
					renderItem={(item) => (
						<CommentReplyItem
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
				const response = await fetchCommentVotes(commentID);
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
		// this.setState({
		// 	upvotes: this.props.comment.upvotes,
		// 	downvotes: this.props.comment.downvotes,
		// 	votes: this.props.comment.votes,
		// 	user: this.props.comment.user,
		// 	replies: this.props.comment.replies
		// });
		console.log('comment did mount');
	}
	getVotes() {
		return { upVotes: this.state.totalUpvotes, downVotes: this.state.totalDownvotes };
	}
	fetchReplies = async () => {
		const commentID = get(this, 'props.comment.id', null);
		if (commentID) {
			const response = await fetchCommentReplies(commentID);
			const data = get(response, 'data', []);
			// this.props.addRepliesCount(data.length);
			this.setState({
				replies: data.reverse()
			});
		}
		this.props.totalComments();
	};

	check = async (type) => {
		const commentID = get(this, 'props.comment.id', null);
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		const filter = this.state.votes.filter((c) => c.user == userID);
		const totalFiltered = get(filter, 'length', 0);
		const currentVote = get(filter, '[0]', {});
		if (totalFiltered > 0) {
			const currentVoteType = get(currentVote, 'vote_type', '');
			if (currentVoteType == type) {
				await deleteCommentVote(currentVote.id);
			} else {
				// updatePost
				currentVote.vote_type = type;
				await patchCommentVote(currentVote);
			}
		} else {
			const user = JSON.parse(localStorage.getItem('user')) || {};
			const userID = get(user, 'id', null);

			if (commentID > 0 && userID > 0) {
				await postCommentVote({
					comment: commentID,
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
				await deleteComment(id);
				this.setState({
					loading: false,
					editValue: '',
					editDialog: false,
					deleteDialog: false
				});
				message.success('Comment deleted');
				this.props.refetch();
			} catch (e) {
				console.log(e.message);
				message.error('Something went wrong while deleting comment.');
			}
		}
	}

	async editComment() {
		this.setState({ loading: true });
		const item = get(this, 'props.comment', null);
		if (item) {
			item.comment = get(this, 'state.editValue', '');
			try {
				await patchComment(item);
				this.setState({ loading: false, editValue: '', editDialog: false });
				message.success('Comment edited');
				this.props.refetch();
			} catch (e) {
				message.error('Something went wrong while editing comment.');
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
		const comment = get(this, 'props.comment', { comment: '' });
		let ReplyContent = Replyform;
		if (!this.state.replyFormShow) {
			ReplyContent = emptyDiv;
		}

		return (
			<div style={{ width: '80%' }}>
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
						<Icon
							type="aliwangwang"
							onClick={() => this.setState({ replyFormShow: !this.state.replyFormShow })}
						/>,
						<div style={{ display: this.getUser() === this.props.comment.user ? 'block' : 'none' }}>
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
						</div>,
						<br />
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
								<a onClick={this.handleRedirect}>{get(this, 'state.user.name', '')}</a>

								<a id={'comments_' + comment.id} href={'#comments_' + comment.id}>
									<p style={{ display: 'inline-block', fontSize: '12px' }}>
										{moment(+new Date(this.props.comment.created_at)).fromNow()}
									</p>
								</a>
								{/* {this.props.comment.created_at.fromNow()} */}
							</div>
						}
						description={comment.comment}
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
								<div style={{ color: 'gray' }}>
									Hide Replies <Icon type={'up'} style={{ marginTop: -8 }} />
								</div>
							) : null}
							{!this.state.showReplies && this.state.replies.length > 0 ? (
								<div style={{ color: 'gray' }}>
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

/* eslint-disable react/prefer-stateless-function */
export class ViewNews extends React.Component {
	constructor(props) {
		super(props);
		const { post } = props.viewNews;
		console.log('constructor', props.viewNews);
		this.state = {
			commentField: '',
			commentsEmpty: false,
			sentence2: post.sentence2,
			sentence3: post.sentence3 ? post.sentence3 : '',
			sentence4: post.sentence4 ? post.sentence4 : '',
			main_sentence: post.main_sentence ? post.main_sentence : '',
			comments: props.viewNews.comments,
			totalLikeReactions: 0,
			totalFunnyReactions: 0,
			totalSadReactions: 0,
			totalAngryReactions: 0,
			mode: true,
			followPeople: null,
			followButtonEnable: true,
			followOrganization: null,
			shareModalVisibility: false,
			commentsOnShare: '',
			followButtonDisAble: true,
			currentUser: -1,
			totalComments: 0,
			imageActive: false,
			msgActive: true,
			urlActive: false,
			ownerData: '',
			checkedComment: true,
			sortBy: 'recent',
			gotoReply: ''
		};
		if (location.href.split('#').length == 2) {
			let values = location.href.split('#')[1].split('_');

			switch (values[0]) {
				case 'reply':
					this.state.gotoReply = 'reply_' + values[1];
					break;
			}
		}
	}

	postReaction = async (type) => {
		const allReactions = get(this, 'props.viewNews.postReactions', []);
		const { id } = this.props.globalState.user;
		// const {name_payload} = 'sasa';//+this.getUser()
		const userId = id;
		const postId = parseInt(get(this, 'props.match.params.id', null));
		const filter = allReactions.filter((c) => c.user == userId);
		const length = get(filter, 'length', 0);
		if (length > 0) {
			const currentReaction = get(filter, '[0]', null);
			if (type == currentReaction.reaction_type) {
				await deletePostReaction(currentReaction);
			} else {
				currentReaction.reaction_type = type;
				await patchPostReaction(currentReaction);
			}
			console.log(currentReaction, type);
			setTimeout(() => {
				this.props.getPostReactions(postId);
			}, 500);
			setTimeout(() => {
				this.filterPostReactions();
			}, 1000);
		} else {
			const data = {
				post: postId,
				user: userId,
				reaction_type: type
			};
			this.props.setPostReaction(data);
			setTimeout(() => {
				this.props.getPostReactions(postId);
			}, 500);
			setTimeout(() => {
				this.filterPostReactions();
			}, 1000);
		}
	};

	filterPostReactions = () => {
		const allReactions = get(this, 'props.viewNews.postReactions', []);
		const likeReactions = allReactions.filter((c) => c.reaction_type == 'like');
		this.setState({ totalLikeReactions: likeReactions.length });
		const funnyReactions = allReactions.filter((c) => c.reaction_type == 'funny');
		this.setState({ totalFunnyReactions: funnyReactions.length });
		const sadReactions = allReactions.filter((c) => c.reaction_type == 'sad');
		this.setState({ totalSadReactions: sadReactions.length });
		const angryReactions = allReactions.filter((c) => c.reaction_type == 'angry');
		this.setState({ totalAngryReactions: angryReactions.length });
	};
	getUser = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const userID = get(user, 'id', null);
		return userID;
	};
	componentDidMount() {
		const { id } = this.props.match.params;

		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		this.setState({ currentUser: currentUser });

		let data = new FormData();
		data.append('user', currentUser);
		data.append('post_id', id);
		// console.log(DataTransferItemList)

		axios
			.post('/api/get_posts_people_follow_status/', data)
			.then((response) => {
				console.log('follow status', response.data);
				this.setState({ followPeople: response.data.people });
				this.setState({ followOrganization: response.data.organization });
			})
			.catch(function(error) {
				console.log(error);
			});

		const name_payload = {
			user: this.getUser()
		};

		this.props.viewPost(id, name_payload);
		// fetch people fooll
		this.props.fetchPostComments(id);
		this.props.getPostReactions(id);
		setTimeout(() => this.filterPostReactions(), 1000);

		// owner data

		let ownerForm = new FormData();
		ownerForm.append('post_id', id);
		ownerForm.append('user', currentUser);

		let { comments } = this.props.viewNews;
		// this.setState({ totalComments: this.state.totalComments });
		this.commentTotalCount();
		axios
			.post('api/get_profile_owner_of_post/', ownerForm)
			.then((response) => {
				console.log('ownerData', response.data);
				this.setState({ ownerData: response.data });
			})
			.catch(function(error) {
				console.log(error);
			});
		var hash = this.props.location.hash;
		console.log('console log ', hash);
		late_reaction;

		setTimeout(() => {
			if (hash.includes('#comments')) {
				hash = hash.replace('#', '');
				var link = document.getElementById(hash);
				if (link) {
					// alert(link.text);
					link.click();
					setTimeout(() => {
						scroll.scrollMore(-100);
					}, 50);
				} else {
					var link = document.getElementById('late_comment');
					if (link) {
						// alert(link.text);
						link.click();
						setTimeout(() => {
							scroll.scrollMore(-100);
						}, 50);
					}
				}
			} else if (hash === '#reactionId') {
				var link = document.getElementById('late_reaction');
				if (link) {
					link.click();
				}
			}

			if (this.state.gotoReply.length > 1) {
				document.getElementById(this.state.gotoReply).scrollIntoView(false);
			}
		}, 2000);
	}

	componentWillUnmount() {
		this.props.unmount();
	}

	handleRedirect = () => {
		// console.log(this.state.currentUser)

		this.props.history.push(`/news-page/${this.state.currentUser}`);
	};

	publishComment = () => {
		const { id } = this.props.match.params;
		const { state: { commentField } } = this;
		if (commentField) {
			this.props.match.params.id;
			let data = new FormData();
			data.append('post', parseInt(get(this, 'props.match.params.id', null)));
			data.append('comment', this.state.commentField);
			data.append('user', get(this, 'props.globalState.user.id', null));
			data.append('kind', 0);
			axios.post('/api/add_comment/', data);
			this.setState({
				commentField: ''
			});
			setTimeout(() => {
				this.props.fetchPostComments(id);
				this.state.totalComments += 1;
			}, 500);
		}
	};

	handleChange = (e) => {
		const { name, value } = e.target;
		this.setState({
			[name]: value
		});
	};

	modalComment = (e) => {
		console.log('modal coments ' + e.target.checked);
		this.setState({ checkedComment: e.target.checked });
		// if (e.target.checked === true) {
		//   this.setState({ commentField: this.state.commentsOnShare });
		// }
	};

	handleSave = () => {
		const { id } = this.props.match.params;
		const payload = {
			post: id,
			user: this.props.globalState.user.id,
			commentary: this.state.commentField
		};
		this.props.saveAsSavedPost(payload);

		// publish comment code
		if (this.state.checkedComment == true) {
			const { state: { commentField } } = this;
			if (commentField) {
				this.props.match.params.id;
				this.props.comment({
					comment: this.state.commentField,
					post: parseInt(get(this, 'props.match.params.id', null)),
					user: get(this, 'props.globalState.user.id', null)
				});
				this.setState({
					commentField: '',
					commentsOnShare: ''
				});
				setTimeout(() => {
					this.props.fetchPostComments(id);
				}, 500);
			}
		} else {
			this.setState({ commentsOnShare: '', commentField: '' });
		}

		this.setState({ shareModalVisibility: false });
		this.setState({ commentsOnShare: '' });
	};

	fetchagain() {
		this.setState({
			commentsEmpty: true
		});
		setTimeout(() => {
			this.setState({
				commentsEmpty: false
			});
			this.props.fetchPostComments(this.props.match.params.id);
			this.commentTotalCount();
		}, 30);
	}

	commentsCount = () => {
		const { comments } = this.props.viewNews;
		let sum = comments.length;
		return (
			<a id="late_comment" href="#comments">
				<Button>
					<h3>
						<Icon
							style={{
								marginRight: 4
							}}
							type="message"
						/>
						{sum}
					</h3>
				</Button>
			</a>
		);
	};
	commentTotalCount = () => {
		axios.get(`/api/get_total_commments_count/?post=${this.props.match.params.id}`).then((response) => {
			this.setState({
				totalComments: response.data.total
			});
		});
	};
	renderComments = () => {
		if (this.state.commentsEmpty) {
			return <div />;
		}
		const writeReply = () => {
			const { TextArea } = Input;
			return <TextArea rows={4} />;
		};
		const { comments } = this.props.viewNews;

		comments.map(async (comment) => {
			if (comment.id > 0) {
				try {
					let response = await fetchCommentVotes(comment.id);
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

		if (this.state.sortBy == 'vote') {
			comments.sort((a, b) => {
				return b.upvotes - b.downvotes - (a.upvotes - a.downvotes);
			});
			console.log('comments', comments);
		} else if (this.state.sortBy == 'recent') {
			comments.sort((a, b) => {
				return new Date(b.created_at) - new Date(a.created_at);
			});
		}
		if (comments instanceof Array) {
			if (comments.length == 0) {
				return <div>No Comments</div>;
			}
			console.log('comments render');
			const commentA = comments.map((c, index) => (
				<Comment
					key={c.id}
					history={this.props.history}
					comment={c}
					totalComments={() => {
						this.commentTotalCount();
					}}
					// addRepliesCount={(count) => (this.state.totalComments = this.state.totalComments + count + 1)}
					refetch={() => {
						this.fetchagain();
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

	getSentimentClass(index) {
		const { post } = this.props.viewNews;
		{
			console.log('JSON_DATA: ', JSON.parse(post.json_data).title, JSON.parse(post.json_data).key);
		}
		let response = post && post.json_response ? JSON.parse(post.json_response) : null;
		return response && response.sentiments && index === post.main_sentence_number ? 'true' : 'false';
	}

	gotoOriginal = () => {
		const { post } = this.props.viewNews;
		if (post.source.includes('http')) {
			// window.open(post.source, '_blank');
			window.open(post.source);
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

	handleImageMode = () => {
		const { mode, imageActive, msgActive } = this.state;
		this.setState({ imageActive: true });
		this.setState({ msgActive: false });
		this.setState({ urlActive: false });

		this.setState({ mode: false });
	};

	handleMessagesgMode = () => {
		const { mode, imageActive, msgActive, urlActive } = this.state;
		this.setState({ imageActive: false });
		this.setState({ msgActive: true });
		this.setState({ mode: true });
	};

	handleFollow = (keyword) => {
		this.setState({ followButtonDisAble: false });
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		const { id } = this.props.match.params;

		let data = new FormData();
		data.append('user', currentUser);
		data.append('keyword', keyword);
		data.append('post_id', id);

		axios
			.post('/api/follow_people/', data)
			.then((response) => {
				this.setState({ followPeople: response.data.people });
				this.setState({ followOrganization: response.data.organization });
				this.setState({ followButtonDisAble: true });
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	followUser = () => {
		this.setState({ followButtonDisAble: false });

		let data = new FormData();
		data.append('user', this.state.currentUser);
		data.append('user_view', this.state.ownerData.id);

		axios
			.post('/api/follow_user/', data)
			.then((response) => {
				this.setState(
					Object.assign(this.state.ownerData, {
						follow_status: response.data.follow_status,
						total_followers_count: response.data.total_followers_count
					})
				);
				this.setState({ followButtonDisAble: true });
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	showModal = () => {
		this.setState({
			shareModalVisibility: true
		});
	};

	handleCancel = () => {
		this.setState({ shareModalVisibility: false });
		this.fetchagain();
	};

	reactionCount = () => {
		let max_1_style = '';
		let max_2_style = '';
		let love = parseInt(this.state.totalLikeReactions);
		let funny = parseInt(this.state.totalFunnyReactions);
		let angry = parseInt(this.state.totalAngryReactions);
		let sad = parseInt(this.state.totalSadReactions);

		max_1 = love;
		max_2 = 0;

		let max_1_name = 'heart';
		let max_2_name = 'heart';

		if (max_1 <= angry) {
			max_2 = max_1;
			max_2_name = max_1_name;
			max_1 = angry;
			max_1_name = 'meh';
		}
		if (max_1 <= sad) {
			max_2 = max_1;
			max_2_name = max_1_name;
			max_1 = sad;
			max_1_name = 'frown';
		}
		if (max_1 <= funny) {
			max_2 = max_1;
			max_2_name = max_1_name;
			max_1 = funny;
			max_1_name = 'smile';
		}
		if (max_1 <= love) {
			max_2 = max_1;
			max_2_name = max_1_name;
			max_1 = love;
			max_1_name = 'heart';
		}
		if (max_2 == 0) {
			max_2_name = max_1_name;
		}
		console.log('MAX 1' + max_1_name + 'MAX 2' + max_2_name);
		let sum =
			parseInt(this.state.totalLikeReactions) +
			parseInt(this.state.totalSadReactions) +
			parseInt(this.state.totalFunnyReactions) +
			parseInt(this.state.totalAngryReactions);
		if (max_1_name === 'heart') {
			max_1_style = 'red';
		} else {
			max_1_style = '#faad14';
		}

		if (max_2_name === 'heart') {
			max_2_style = 'red';
		} else {
			max_2_style = '#faad14';
		}

		return (
			<a id="late_reaction" href="#reactionId">
				<Button style={{ color: '#555555', fontSize: 18 }}>
					<div>
						<Icon
							type={max_1_name}
							theme="filled"
							className="reaction-icons"
							style={{ color: `${max_1_style}` }}
						/>
						{'  '}
						<Icon
							type={max_2_name}
							theme="filled"
							className="reaction-icons"
							style={{ color: `${max_2_style}` }}
						/>
						{'  ' + sum}
					</div>
				</Button>
			</a>
		);
	};
	sortMenu = () => {
		return (
			<Menu>
				<Menu.Item key="0">
					<a onClick={() => this.sortByLikes()}>Top Commnets</a>
				</Menu.Item>
				<Menu.Item key="1">
					<a onClick={() => this.sortByRecents()}>Most Recents</a>
				</Menu.Item>
			</Menu>
		);
	};
	sortByLikes = () => {
		this.setState({ sortBy: 'vote' });
	};
	sortByRecents = () => {
		this.setState({ sortBy: 'recent' });
	};
	render() {
		const { post, loading } = this.props.viewNews;
		let response = post && post.json_response ? JSON.parse(post.json_response) : null;

		let recomended = post && post.recommended_json ? JSON.parse(post.recommended_json) : null;
		// let result = post && post.json_data ? JSON.stringify(post.json_data) : null;
		let result = post && post.json_data ? JSON.parse(post.json_data) : null;

		return (
			<div>
				<Spin tip="Generating..." spinning={loading}>
					{/* {this.goToComments()} */}
					<Helmet>
						<title>View Post</title>
						<meta name="description" content="Description of ViewNews" />
					</Helmet>
					<Header history={this.props.history} />

					<Wrapper>
						<div style={{ marginTop: 50, minWidth: 650 }} className="bg-white">
							<Row>
								<Col xs={14} sm={14} md={15} lg={16}>
									<Row>
										<h3 style={{ float: 'left' }}>{post.category}</h3>
									</Row>
									<Row>
										<h1 style={{ float: 'left' }}>{post.title}</h1>
									</Row>
									<Row>
										<h4 style={{ float: 'left', color: '#000000' }}>
											Published in {post.created_at_str} By {post.author}
										</h4>
									</Row>
									<Row>
										<Col span={2}>
											<Button disabled>
												<h3 style={{ float: 'left' }}>
													<Icon style={{ marginRight: 8 }} type="eye" />
													{post.total_views}
												</h3>
											</Button>
										</Col>
										<Col xs={6} sm={5} md={3} lg={2} xl={1}>
											<div />
										</Col>
										<Col span={2}>{this.reactionCount()}</Col>
										<Col xs={6} sm={5} md={3} lg={2} xl={1}>
											<div />
										</Col>
										<Col
											span={2}
											// offset={1}
										>
											<React.Fragment>{this.commentsCount()}</React.Fragment>
										</Col>
									</Row>
								</Col>
								{Object.keys(this.state.ownerData).length > 0 ? (
									<Col xs={10} sm={10} md={9} lg={8}>
										<Row style={{ marginTop: 10 }} type="flex">
											<Col>
												<a href={`/news-page/${this.state.ownerData.id}`}>
													<img
														style={{
															height: 70,
															width: 70,
															borderRadius: 10
														}}
														alt="example"
														src={this.state.ownerData.img_url || avatar}
													/>
												</a>
											</Col>
											<Col offset={1}>
												<Row type="flex">
													<Col>
														<a href={`/news-page/${this.state.ownerData.id}`}>
															<h2>
																{' '}
																{this.limitText(this.state.ownerData.name, 14)}
																{}
															</h2>
														</a>
													</Col>
													<Col offset={1} span={1}>
														{this.state.ownerData.is_verified ? (
															<Icon
																style={{
																	marginTop: 5,
																	color: '#FF9400',
																	fontSize: '20px'
																}}
																type="check-square"
															/>
														) : null}
													</Col>
												</Row>

												<Row>
													<Col xs={18} sm={14} md={10} lg={15} xl={16}>
														{this.state.currentUser != this.state.ownerData.id ? (
															<Button
																style={{
																	backgroundColor: '#FF9400',
																	width: 120,
																	height: 20,
																	color: 'white'
																}}
																onClick={() => this.followUser()}
															>
																{this.state.ownerData.follow_status}(
																{this.state.ownerData.total_followers_count}
																)
															</Button>
														) : null}
													</Col>
												</Row>

												<Row>
													<Col xs={18} sm={14} md={10} lg={15} xl={16}>
														<a href={`/news-page/${this.state.ownerData.id}`}>
															<Button
																style={{
																	marginTop: 2,
																	backgroundColor: 'grey',
																	height: 25,
																	width: 122,
																	color: 'white'
																}}
															>
																More Articles
															</Button>
														</a>
													</Col>
												</Row>
											</Col>
											{/* <Col span={1} /> */}
										</Row>
									</Col>
								) : null}
							</Row>

							<hr />
							<Row>
								{this.state.mode ? (
									<Col xs={24} sm={24} md={13} lg={13} xl={13}>
										<Form onChange={this.handleChange} className="post-form">
											{post.main_sentence && (
												<Row style={{ marginTop: 15 }}>
													<Col span={24}>
														{this.getSentimentClass(1) === 'true' ? (
															<p className={'speech-bubble-positive'}>
																{post.main_sentence}
															</p>
														) : (
															<p className={'speech-bubble-negative'}>
																{post.main_sentence}
															</p>
														)}
													</Col>
												</Row>
											)}
											{post.sentence2 && (
												<Row style={{ marginTop: 15 }}>
													<Col span={24}>
														{this.getSentimentClass(2) === 'true' ? (
															<p className={'speech-bubble-positive'}>{post.sentence2}</p>
														) : (
															<p className={'speech-bubble-negative'}>{post.sentence2}</p>
														)}
													</Col>
												</Row>
											)}
											{post.sentence3 && (
												<Row style={{ marginTop: 15 }}>
													<Col span={24}>
														{this.getSentimentClass(3) === 'true' ? (
															<p className={'speech-bubble-positive'}>{post.sentence3}</p>
														) : (
															<p className={'speech-bubble-negative'}>{post.sentence3}</p>
														)}
													</Col>
												</Row>
											)}
											{post.sentence4 && (
												<Row style={{ marginTop: 15 }}>
													<Col span={24}>
														{this.getSentimentClass(4) === 'true' ? (
															<p className={'speech-bubble-positive'}>{post.sentence4}</p>
														) : (
															<p className={'speech-bubble-negative'}>{post.sentence4}</p>
														)}
													</Col>
												</Row>
											)}
											{post.sentence5 && (
												<Row style={{ marginTop: 15 }}>
													<Col span={24}>
														{this.getSentimentClass(5) === 'true' ? (
															<p className={'speech-bubble-positive'}>{post.sentence5}</p>
														) : (
															<p className={'speech-bubble-negative'}>{post.sentence5}</p>
														)}
													</Col>
												</Row>
											)}
										</Form>
									</Col>
								) : (
									<Col xs={24} sm={24} md={13} lg={13} xl={13}>
										<h2 className="main-heading">CardNews</h2>
										{post.embedded_image ? (
											<img style={{ height: '40%', width: '70%' }} src={post.embedded_image} />
										) : (
											<img src={alter} alt="" style={{ height: '40%', width: '70%' }} />
										)}
									</Col>
								)}

								<Col offset={1} xs={24} sm={24} md={10} lg={10} xl={10}>
									<div className="reaction-sidebar">
										<h1 style={{ textAlign: 'left' }}>People</h1>
										<Row className="custom-row">
											<Col className="custom-col" span={20}>
												{response &&
													response.people.map((person, index) => {
														return (
															<Row className="custom-row" key={index}>
																<Col span={24} className="custom-col">
																	<Row>
																		{/* <People {...person} /> */}

																		<div className="info-block">
																			<div className="holder">
																				<div className="img-holder">
																					<Tooltip
																						title={() => {
																							return (
																								<div>
																									<p
																										style={{
																											color:
																												'white'
																										}}
																									>
																										{person.description ? (
																											<ul>
																												<li>
																													{person.description ||
																														''}
																												</li>
																											</ul>
																										) : null}
																									</p>

																									<a
																										target="_blank"
																										href={
																											person.reference_url ||
																											''
																										}
																									>
																										{person.reference_url ? (
																											<ul>
																												<li>
																													{' '}
																													{person.reference_title || ''}
																												</li>
																											</ul>
																										) : null}
																									</a>
																								</div>
																							);
																						}}
																					>
																						<Link
																							to={
																								'/search/?query=' +
																								person.keyword
																							}
																						>
																							{' '}
																							<img
																								src={
																									person.image_url ||
																									avatar
																								}
																								alt=""
																							/>
																						</Link>
																					</Tooltip>
																				</div>{' '}
																				{/* </Link> */}
																				{this.state.followPeople ? (
																					<div
																						style={{ textAlign: 'center' }}
																					>
																						<Button
																							style={{
																								fontSize: 10,
																								width: '100%'
																							}}
																							disabled={
																								!this.state
																									.followButtonDisAble
																							}
																							onClick={() => {
																								this.handleFollow(
																									person.keyword
																								);
																							}}
																							type="primary"
																							ghost
																						>
																							<strong>
																								{' '}
																								{
																									this.state
																										.followPeople[
																										index
																									]
																								}
																							</strong>
																						</Button>
																					</div>
																				) : null}
																				<Link
																					to={
																						'/search/?query=' +
																						person.keyword
																					}
																				>
																					<Tooltip
																						title={() => {
																							return (
																								<div>
																									<p
																										style={{
																											color:
																												'white'
																										}}
																									>
																										{person.description ? (
																											<ul>
																												<li>
																													{person.description ||
																														''}
																												</li>
																											</ul>
																										) : null}
																									</p>

																									<a
																										target="_blank"
																										href={
																											person.reference_url ||
																											''
																										}
																									>
																										{person.reference_url ? (
																											<ul>
																												<li>
																													{person.reference_title ||
																														''}
																												</li>
																											</ul>
																										) : null}
																									</a>
																								</div>
																							);
																						}}
																					>
																						{' '}
																						<div
																							style={{
																								textAlign: 'center'
																							}}
																						>
																							{person.keyword}
																						</div>
																					</Tooltip>
																				</Link>
																			</div>
																		</div>
																	</Row>
																</Col>
															</Row>
														);
													})}
											</Col>
										</Row>
										<Row className="custom-row">
											<Col span={24} className="custom-col">
												{response &&
													response.organization.map((organization, index) => {
														return (
															<Row className="custom-row">
																<Col span={24} className="custom-col">
																	{/* <People {...organization} /> */}

																	<div className="info-block">
																		<div className="holder">
																			<Link
																				to={
																					'/search/?query=' +
																					organization.keyword
																				}
																			>
																				<div className="img-holder">
																					<Tooltip
																						// title={organization.description}
																						title={() => {
																							return (
																								<div>
																									<p
																										style={{
																											color:
																												'white'
																										}}
																									>
																										{organization.description ? (
																											<ul>
																												<li>
																													{organization.description ||
																														''}
																												</li>
																											</ul>
																										) : null}
																									</p>
																									<a
																										target="_blank"
																										href={
																											organization.reference_url ||
																											''
																										}
																									>
																										{organization.reference_url ? (
																											<ul>
																												<li>
																													{organization.reference_title ||
																														''}
																												</li>
																											</ul>
																										) : null}
																									</a>
																								</div>
																							);
																						}}
																					>
																						<img
																							src={
																								organization.image_url ||
																								avatar
																							}
																							alt=""
																						/>
																					</Tooltip>
																				</div>{' '}
																			</Link>

																			{this.state.followOrganization ? (
																				<div style={{ textAlign: 'center' }}>
																					<Button
																						style={{
																							fontSize: 10,
																							width: 82
																						}}
																						disabled={
																							!this.state
																								.followButtonDisAble
																						}
																						onClick={() => {
																							this.handleFollow(
																								organization.keyword
																							);
																						}}
																						type="primary"
																						ghost
																					>
																						<strong>
																							{
																								this.state
																									.followOrganization[
																									index
																								]
																							}
																						</strong>
																					</Button>
																				</div>
																			) : null}

																			<Link
																				to={
																					'/search/?query=' +
																					organization.keyword
																				}
																			>
																				{' '}
																				<Tooltip
																					// title={organization.description || ''}
																					title={() => {
																						return (
																							<div>
																								<p
																									style={{
																										color: 'white'
																									}}
																								>
																									{organization.description ? (
																										<ul>
																											<li>
																												{organization.description ||
																													''}
																											</li>
																										</ul>
																									) : null}
																								</p>
																								<a
																									target="_blank"
																									href={
																										organization.reference_url ||
																										''
																									}
																								>
																									{organization.reference_url ? (
																										<ul>
																											<li>
																												{organization.reference_title ||
																													''}
																											</li>
																										</ul>
																									) : null}
																								</a>
																							</div>
																						);
																					}}
																				>
																					{' '}
																					<div
																						style={{
																							textAlign: 'center'
																						}}
																					>
																						{organization.keyword}
																					</div>
																				</Tooltip>
																			</Link>
																		</div>
																	</div>
																</Col>
															</Row>
														);
													})}
											</Col>
										</Row>

										<Row>
											<Col span={20} offset={2} />
										</Row>
										<Row>
											{result && result.title.length > 0 ? (
												<h1 style={{ textAlign: 'left' }}>Upper Recommentaion</h1>
											) : null}

											<div style={{ marginLeft: '2%', marginTop: '2%' }}>
												<Timeline style={{ textAlign: 'left' }} id="reactionId">
													{result &&
														result.title.map((p, index) => {
															return (
																<Timeline.Item>
																	<a
																		style={{ color: '#000000' }}
																		href={result.id[index]}
																		target="_blank"
																	>
																		{p}
																		<br />
																		{moment(
																			+new Date(result.created_at_list[index])
																		).fromNow()}
																	</a>
																</Timeline.Item>
															);
														})}
												</Timeline>
											</div>
										</Row>
									</div>
								</Col>
							</Row>

							<hr />
							<Row>
								<Col xs={24} sm={24} md={18} lg={8} xl={8}>
									<Row>
										<Col xs={6} sm={5} md={4} lg={4}>
											<div
												style={{ cursor: 'pointer' }}
												onClick={() => this.postReaction('like')}
												className="react-box"
											>
												<Icon
													type="heart"
													theme="filled"
													className="reaction-icons"
													style={{ color: 'red', fontSize: '30px' }}
												/>
												<h4>Like</h4>
												<span>{this.state.totalLikeReactions}</span>
											</div>
										</Col>

										<Col xs={6} sm={5} md={4} lg={4}>
											<div
												style={{ cursor: 'pointer' }}
												onClick={() => this.postReaction('funny')}
												className="react-box"
											>
												<Icon
													type="smile"
													theme="filled"
													className="reaction-icons"
													style={{ color: '#faad14', fontSize: '30px' }}
												/>
												<h4>Funny</h4>
												<span>{this.state.totalFunnyReactions}</span>
											</div>
										</Col>

										<Col xs={6} sm={5} md={4} lg={4}>
											<div
												style={{ cursor: 'pointer' }}
												onClick={() => this.postReaction('sad')}
												className="react-box"
											>
												<Icon
													type="frown"
													theme="filled"
													className="reaction-icons"
													style={{ color: '#faad14', fontSize: '30px' }}
												/>
												<h4>Sad</h4>

												<span>{this.state.totalSadReactions}</span>
											</div>
										</Col>
										<Col xs={6} sm={5} md={4} lg={4}>
											<div
												style={{ cursor: 'pointer' }}
												onClick={() => this.postReaction('angry')}
												className="react-box"
											>
												<Icon
													type="meh"
													theme="filled"
													className="reaction-icons"
													style={{ color: '#faad14', fontSize: '30px' }}
												/>
												<h4>Angry</h4>
												<span>{this.state.totalAngryReactions}</span>
											</div>
										</Col>
									</Row>
								</Col>
								<Col xs={24} sm={24} md={2} lg={9} xl={9}>
									<Button id="save" style = {{backgroundColor: '#9e419b', color: '#ffffff'}} type="secondary" onClick={this.showModal} size={'large'}>
										Take
									</Button>
									<ShareArticleModal
										visible={this.state.shareModalVisibility}
										posts={[
											{
												id: post.id,
												avatar: post.img_url,
												author: this.state.ownerData.name,
												// comments: this.props.feed.comment,
												// comment_id: this.props.feed.comment_id,
												title: post.title,
												views: post.total_views,
												time: moment(+new Date(post.created_at)).fromNow()
											}
										]}
										commentId={-1}
										kind={0}
										onClose={() => this.handleCancel()}
									/>
								</Col>

								<Col xs={24} sm={24} md={12} lg={7} xl={7}>
									<Col xs={9} sm={8} md={6} lg={5}>
										<Tooltip title={'CardNews'}>
											{this.state.imageActive ? (
												<img
													style={{
														height: 46,
														width: 54,
														cursor: 'pointer'
													}}
													src={rectOrange}
													onClick={this.handleImageMode}
												/>
											) : (
												<img
													style={{
														height: 46,
														width: 54,
														cursor: 'pointer'
													}}
													src={rectBlack}
													onClick={this.handleImageMode}
												/>
											)}
										</Tooltip>
									</Col>

									<Col xs={9} sm={8} md={6} lg={5}>
										<Tooltip title={'Summary'}>
											{this.state.msgActive ? (
												<img
													style={{
														width: 54,
														height: 46,
														cursor: 'pointer'
													}}
													src={msgOrange}
													onClick={this.handleMessagesgMode}
												/>
											) : (
												<img
													style={{
														height: 46,
														width: 54,
														cursor: 'pointer'
													}}
													src={msgBlack}
													onClick={this.handleMessagesgMode}
												/>
											)}
										</Tooltip>
									</Col>

									<Col xs={6} sm={8} md={6} lg={5}>
										<Tooltip title={'Read Original'}>
											<img
												style={{ height: 46, width: 54, cursor: 'pointer' }}
												src={barBlack}
												onClick={this.gotoOriginal}
											/>
										</Tooltip>
									</Col>
								</Col>
							</Row>
							<br />
							<Row>
								{recomended ? (
									<div
										style={{
											position: 'relative',
											// margin: '0 auto',
											width: '100%'
										}}
									>
										<InfiniteCarousel
											style={{ width: '100%' }}
											breakpoints={[
												{
													breakpoint: 576,
													settings: {
														slidesToShow: 1,
														slidesToScroll: 1
													}
												},
												{
													breakpoint: 668,
													settings: {
														slidesToShow: 1,
														slidesToScroll: 1
													}
												},

												{
													breakpoint: 768,
													settings: {
														slidesToShow: 2,
														slidesToScroll: 2
													}
												},
												{
													breakpoint: 868,
													settings: {
														slidesToShow: 3,
														slidesToScroll: 3
													}
												},

												{
													breakpoint: 968,
													settings: {
														slidesToShow: 3,
														slidesToScroll: 3
													}
												}
											]}
											dots={false}
											showSides={true}
											sidesOpacity={0.5}
											sideSize={0.1}
											slidesToScroll={4}
											responsive={true}
											slidesToShow={4}
											scrollOnDevice={true}
										>
											{recomended.title.map((p, index) => {
												return (
													<a href={recomended.id[index]} target="_blank" className="center">
														<div className="gallery link">
															{recomended.img_list[index] ? (
																<img
																	src={recomended.img_list[index]}
																	alt=""
																	style={{ width: 215, height: 215 }}
																/>
															) : (
																<img
																	style={{ width: 215, height: 215 }}
																	src={alter}
																	alt=""
																/>
															)}

															<div className="desc">{p}</div>
														</div>
													</a>
												);
											})}
										</InfiniteCarousel>
									</div>
								) : (
									console.log('No data')
								)}
							</Row>

							<h2 id="comments" className="comment">
								Comment Section
							</h2>
							<Row>
								<Col style={{ cursor: 'pointer', fontSize: '1.2em' }} span={2}>
									{this.state.totalComments} <strong>Comments</strong>
								</Col>
								
							</Row>
							<Row>
							<Col style={{ cursor: 'pointer', fontSize: '1.2em' }} span={2}>
									<Dropdown overlay={this.sortMenu} trigger={[ 'click' ]}>
										<div className="ant-dropdown-link" href="#">
											<strong>Sort By</strong><Icon type="down" />
										</div>
									</Dropdown>
								</Col>

							</Row>
							<Row>
								<Col span={20}>
									<textarea
										name="comment"
										rows="3"
										value={this.state.commentField}
										onChange={(e) => this.setState({ commentField: e.target.value })}
										placeholder="Write ur comment here"
									/>
								</Col>
								<Col span={4}>
									<Button onClick={() => this.publishComment()} style = {{backgroundColor: '#9e419b', color: '#ffffff'}} type="secondary">
										Publish
									</Button>
								</Col>
							</Row>
							<Row>
								<Col span={24} style={{ textAlign: 'left' }}>
									{this.renderComments()}
								</Col>
							</Row>
						</div>
					</Wrapper>
				</Spin>
			</div>
		);
	}
}

ViewNews.propTypes = {
	dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
	viewNews: makeSelectViewNews(),
	globalState: makeSelectGlobalState()
});

function mapDispatchToProps(dispatch) {
	// var ac = 3
	// console.log("payload",ac);
	// console.log("componentDidMount",this.username_token)
	return {
		dispatch,
		viewPost: (id, name_payload) => dispatch(a.viewPost(id, name_payload)),
		comment: (data) => dispatch(a.comment(data)),
		update: (id, payload) => dispatch(a.updatePost(id, payload)),
		fetchPostComments: (id) => dispatch(a.fetchPostComments(id)),
		unmount: () => dispatch(a.unmountRedux()),
		setPostReaction: (data) => dispatch(a.setPostReaction(data)),
		getPostReactions: (postID) => dispatch(a.getPostReactions(postID)),
		saveAsSavedPost: (data) => dispatch(a.saveAsSavedPost(data))
	};
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'viewNews', reducer });
const withSaga = injectSaga({ key: 'viewNews', saga });

export default compose(withReducer, withSaga, withConnect)(ViewNews);
