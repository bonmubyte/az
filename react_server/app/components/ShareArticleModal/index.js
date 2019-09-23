import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesome } from 'react-fontawesome';
import avatar from '../../images/avatar.png';
import moment from 'moment';
import { get, _ } from 'lodash';
import axios from '../../utils/http';
import { Row, Col, Button, Input, Modal, notification, Icon, Checkbox } from 'antd';
const { TextArea } = Input;
import './style.css';
import { element } from 'prop-types';
const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};

export default class ShareArticleModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			commentId: -1,
			comment: '',
			myGroups: [],
			selectedGroups: 0,
			saveToGroup: false,
			saved: false,
			moreGroups: false,
			checkPrivate: true
		};
	}
	fetchMyGroups = () => {
		console.log('fetch groups');
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		axios
			.get(`/api/get_groups_by_user/?user=${currentUser}`)
			.then((response) => {
				response.data.groups.map((group, index) => {
					group.selected = false;
				});
				this.setState({
					myGroups: response.data.groups
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	onCreate = () => {
		this.onClose();
		openNotificationWithIcon('success', 'Success', `${this.state.name} group is created.`);
	};
	onChangePrivate = (e) => {
		this.setState({
			checkPrivate: e.target.checked
		});
	};
	onChangeName = (event) => {
		this.setState({ name: event.target.value });
	};
	onChangeComment = (e) => {
		this.setState({ comment: e.target.value });
	};
	sharePostStories = (id) => {
		if (this.state.comment == '') {
			openNotificationWithIcon('warning', 'Warning', 'Please type your comment.');
			return;
		}
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		let data = new FormData();
		data.append('id', id);
		data.append('user', currentUser);
		data.append('comment', this.state.comment);
		data.append('kind', 2);
		data.append('post', this.props.posts[0].id);
		axios.post(`/api/add_comment/`, data).then((response) => {}).catch(function(error) {
			console.log(error);
		});

		if (this.state.checkPrivate) {
			let data = new FormData();
			if (this.props.commentId == -1) {
				if (this.props.kind != 2) {
					data.append('id', id);
					data.append('user', currentUser);
					data.append('comment', this.state.comment);
					data.append('kind', this.props.kind);
					data.append('post', this.props.posts[0].id);
					axios
						.post(`/api/add_comment/`, data)
						.then((response) => {
							this.setState({
								commentId: response.data.comment,
								saved: true
							});
							openNotificationWithIcon('success', 'Success', `${this.props.posts[0].title} is saved.`);
						})
						.catch(function(error) {
							console.log(error);
						});
				} else {
					this.setState({
						saved: true
					});
				}
			} else {
				data.append('user', currentUser);
				data.append('comment', this.props.commentId);
				data.append('reply', this.state.comment);

				axios
					.post(`/api/comment-reply/`, data)
					.then((response) => {
						this.setState({
							saved: true
						});
						openNotificationWithIcon('success', 'Success', `${this.props.posts[0].title} is saved.`);
					})
					.catch(function(error) {
						console.log(error);
					});
			}
		} else {
			this.setState({
				saved: true
			});
		}
	};
	onSave = () => {
		if (this.state.comment.length > 0) {
			this.sharePostStories(this.props.posts[0].id);
		} else {
			openNotificationWithIcon('error', 'Warning', 'Please enter comment.');
		}
	};
	onSelectGroupDone = () => {
		this.saveComment();
	};
	saveComment = () => {
		if (this.state.comment == '') {
			openNotificationWithIcon('warning', 'Warning', 'Please type your comment.');
			return;
		}
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);

		let data = new FormData();
		if (currentUser) {
			data.append('user', currentUser);
		} else {
			data.append('user', -1);
		}
		let groups = [];
		if (this.state.saveToGroup) {
			groups = '';
			this.state.myGroups.map((e) => {
				if (e.selected) {
					groups = [ e.id, ...groups ];
				}
			});
		}
		console.log('form data group', groups, this.props.posts[0].id, currentUser);
		data.append('groups', groups);
		data.append('user', currentUser);
		data.append('comment', this.state.comment);
		data.append('post', this.props.posts[0].id);
		console.log('form data', data);
		axios
			.post(`/api/add_group_comment/`, data)
			.then((response) => {
				openNotificationWithIcon('success', 'Success', `${this.props.posts[0].title} is shared.`);
				this.onClose();
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	onSaveGroup = () => {
		this.setState({
			saveToGroup: !this.state.saveToGroup,
			moreGroups: false
		});
	};
	onGroupsMore = () => {
		this.setState({
			moreGroups: !this.state.moreGroups
		});
	};
	onSelectGroup = (index) => {
		this.state.myGroups[index].selected = !this.state.myGroups[index].selected;
		this.setState({
			myGroups: this.state.myGroups
		});
		this.setState({
			selectedGroups: this.state.myGroups.filter((element) => element.selected).length
		});
	};
	onClose = () => {
		this.props.onClose();
		this.state.myGroups.map((item) => {
			return (item.selected = false);
		});
		this.setState({
			comment: '',
			saved: false,
			saveToGroup: false,
			moreGroups: false,
			myGroups: this.state.myGroups
		});
	};
	componentDidMount() {
		this.fetchMyGroups();
	}
	render() {
		return (
			<Modal
				className={'share-article-modal'}
				centered
				visible={this.props.visible}
				onOk={this.onClose}
				onCancel={this.onClose}
				footer={[]}
			>
				<Row justify="end" type="flex" onClick={() => this.onClose()} key="1">
					<Icon type="close" style={{ cursor: 'pointer' }} />
				</Row>
				<Row className={'selected-article-row'} type="flex" key="2">
					<div>Selected Article:</div>
					{this.props.posts.map((post, index) => {
						return (
							<Row key={index} className={'share-post-card'}>
								<Col className={'share-post-avatar'} span={1} key="1">
									<img src={post.avatar || avatar} alt="PostImage" />
								</Col>
								<Col className={'share-post-content'} key="2">
									<Row className={'share-post-title'}>{post.title}</Row>
									<Row className={'share-post-info'}>
										<span className={'share-post-author'}>{post.author}</span>
										&nbsp;&nbsp;
										<span className={'share-post-time'}>{post.time} </span>
										&nbsp;&nbsp;
										<span className={'share-post-views'}>{post.views} Views</span>
									</Row>
								</Col>
							</Row>
						);
					})}
				</Row>
				<Row key="3">
					<TextArea
						className={'share-post-comment'}
						placeholder="Add your take on this article."
						value={this.state.comment}
						onChange={this.onChangeComment}
					/>
				</Row>
				<Row type="flex" justify="center" className={'share-post-buttons-row'} key="4">
					{this.state.saved ? (
						<Button className={'share-post-button'}>Taken</Button>
					) : (
						<Button className={'share-post-button'} type="primary" onClick={this.onSave}>
							Take
						</Button>
					)}

					{this.state.saveToGroup ? (
						<Button className={'share-post-button'} onClick={this.onSaveGroup}>
							Select Group
						</Button>
					) : (
						<Button className={'share-post-button'} type="primary" onClick={this.onSaveGroup}>
							Take to Group
						</Button>
					)}
				</Row>
				{this.state.saveToGroup ? (
					<Row className={'recommended-groups'} key="5">
						<Row className={'recommended-groups-title'} key="1">
							Your Group(s):
						</Row>
						{this.state.myGroups.map((group, index) => {
							if (this.state.moreGroups || index < 4)
								return (
									<Button
										className={'recommended-group'}
										{...(group.selected ? { type: 'primary' } : '')}
										onClick={() => {
											this.onSelectGroup(index);
										}}
										key={index}
									>
										{' '}
										{group.name}
									</Button>
								);
						})}

						<Row className={'recommended-groups-more'} onClick={this.onGroupsMore} key="2">
							{this.state.moreGroups ? 'Less...' : 'More...'}
						</Row>
						<Row type="flex" justify="center" key="3">
							{this.state.selectedGroups > 0 ? (
								<Button
									type="primary"
									className={'selected-groups-done-button'}
									onClick={this.onSelectGroupDone}
								>
									Done
								</Button>
							) : null}
						</Row>
					</Row>
				) : (
					<Row key="5" />
				)}

				<Row className={'share-article-modal-footer'} type="flex" justify="end" key="6">
					<Checkbox
						className={'share-post-comment-check'}
						checked={this.state.checkPrivate}
						onChange={this.onChangePrivate}
					/>
					<span>Also Post as Comment</span>
					<div className={'share-post-comment-help'}>?</div>
				</Row>
			</Modal>
		);
	}
}
