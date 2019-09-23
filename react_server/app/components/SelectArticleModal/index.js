import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import avatar from '../../images/avatar.png';
import moment from 'moment';
import { get, _ } from 'lodash';
import axios from '../../utils/http';
import { Row, Button, Input, Modal, notification, Avatar } from 'antd';
const { TextArea } = Input;
import './style.css';
import { element } from 'prop-types';
const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};
export default class SelectArticleModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = { name: '', posts: [], orignalPosts: [], search: '' };
		this.selectPost = this.selectPost.bind(this);
	}
	selectPost = (index) => {
		let postTitle = this.props.posts[index].title;
		this.props.onSelectArticle(this.props.posts[index]);
		openNotificationWithIcon('success', 'Article is selected', `${postTitle}`);
	};

	onSearch = (e) => {
		this.setState({ search: e.target.value });
	};
	componentDidMount() {}
	render() {
		return (
			<Modal
				className={'select-article-modal'}
				centered
				visible={this.props.visible}
				onOk={this.props.onClose}
				onCancel={this.props.onClose}
				footer={[ <div /> ]}
			>
				<Row className={'select-article-modal-heading'}>Select article to share</Row>
				<Row className={'select-article-searchbar'}>
					<Input placeholder="Search bar" onChange={this.onSearch} value={this.state.search} />
				</Row>

				<Row className={'select-article-modal-posts'}>
					{this.props.posts
						.filter((element) => element.title.toLowerCase().includes(this.state.search.toLowerCase()))
						.map((post, index) => {
							return (
								<Row className={'select-article-modal-row'} key={index} type="flex">
									<div className={'select-artcle-modal-avatar'}>
										<img src={post.avatar || avatar} />
									</div>
									<div className={'select-article-modal-content'}>
										<Row type="flex">
											<div className={'select-article-modal-author'}>{post.author}</div>
											<div className={'select-article-modal-time'}>{post.time}</div>
										</Row>
										<Row className={'select-article-modal-title'}>{post.title}</Row>
										<Row className={'select-article-modal-info'}>
											{post.views} Views &nbsp; {post.comments} Comments
										</Row>
									</div>
									<div>
										<Button
											style = {{backgroundColor: '#9e419b', color: '#ffffff'}}
											type="secondary"
											
											className={'select-article-modal-button'}
											onClick={() => this.selectPost(index)}
										>
											Select
										</Button>
									</div>
								</Row>
							);
						})}
				</Row>
			</Modal>
		);
	}
}
