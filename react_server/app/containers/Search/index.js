import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Input, Timeline, List, Row, Col, Card, Icon, Avatar, notification, Button } from 'antd';
import 'antd/lib/timeline/style/css';
import alter from './alter.jpg';
import 'antd/dist/antd.css';
import { Layout } from 'antd';
import { Helmet } from 'react-helmet';
import Header from '../Headerr/Loadable';
import * as api from './api';
import { compose } from 'redux';
import axios from '../../utils/http';
import moment from 'moment';
import { Link } from 'react-router-dom';
const { Content } = Layout;
const { Meta } = Card;
const Search = Input.Search;
import ShareArticleModal from '../../components/ShareArticleModal';
import SearchCommentaryCarousel from '../../components/SearchCommentaryCarousel';
import ReadMoreAndLess from 'react-read-more-less';
import './style.css';
import { node } from 'prop-types';
const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};
const GROUP_COLORS = [ 'red', 'green', 'blue', 'yellow' ];
class Searchbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			query: '',
			result: [],
			trending: '',
			activeUser: this.props.activeUser,
			groups: [],
			originGroups: [],
			carousel: '',
			isShareOpen: []
		};
	}

	componentDidUpdate(prevProps) {
		//Typical usage, don't forget to compare the props
		if (this.props !== prevProps) {
			let q = this.props.location.search.replace('?query=', '');
			q = decodeURIComponent(q).replace(/%20/g, '+');
			console.log('fond');
			this.setState({
				query: q
			});

			let s = this.props.location.search.replace('?query=', '');

			s = decodeURIComponent(q).replace(/%20/g, '+');

			let data = new FormData();
			data.append('query', q);
			axios
				.post('/api/search/', data)
				.then((response) => {
					this.setState({ result: response }, () => {});
					ReactDOM.unmountComponentAtNode(document.getElementById('commentaries-carousel'));
					ReactDOM.render(
						<SearchCommentaryCarousel
							history={this.props.history}
							commentaries={response.data.search_commentary_result}
						/>,
						document.getElementById('commentaries-carousel')
					);
				})
				.catch(function(error) {
					console.log(error);
				});

			this.fetchMyGroups(q);
			// api for trending search
			axios
				.post('/api/get_trending_search/')
				.then((response) => {
					this.setState({ trending: response });
					// console.log(response.data);
				})
				.catch(function(error) {
					console.log(error);
				});
		}
	}
	searchGroups = (q) => {
		axios
			.post(`/api/search_group_by_name/?query=${q}`)
			.then((response) => {
				console.log('search groups', response.data.groups);
				this.setState({ groups: response.data.groups });
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	fetchMyGroups = (q) => {
		axios
			.get(`/api/get_all_groups/?user=${JSON.parse(localStorage.getItem('user')).id}`)
			.then((response) => {
				//let data = response.data.groups.filter((group) => group.visible);
				this.state.groups = [];
				response.data.groups.map((group) => {
					group.color = GROUP_COLORS[group.id % GROUP_COLORS.length];
					group.searchPrivacy = group.privacy ? 'public group' : 'private group';
					group.searchVisible = group.visible ? 'visible group' : 'invisible group';
					group.notification = 0;
					if (group.name.toLowerCase().includes(q.toLowerCase()) && group.visible == true) {
						console.log('names', group.name.toLowerCase(), q.toLowerCase());
						console.log('names', group.searchPrivacy.toLowerCase(), q.toLowerCase());
						this.state.groups = [ group, ...this.state.groups ];
					}
				});
				console.log('groups', response.data.groups);
				this.setState({ originGroups: response.data.groups });
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	componentDidMount() {
		console.log('mount');
		if (this.props.location.search) {
			let q = this.props.location.search.replace('?query=', '');
			q = decodeURIComponent(q).replace(/%20/g, '+');
			console.log('fond');
			this.setState({
				query: q
			});
			this.fetchMyGroups(q);
			// Post request
			let s = this.props.location.search.replace('?query=', '');
			s = decodeURIComponent(q).replace(/%20/g, '+');
			{
				console.log('decoded query: ', q);
			}

			let data = new FormData();
			data.append('query', q);
			axios
				.post('/api/search/', data)
				.then((response) => {
					this.setState({ result: response });
					ReactDOM.render(
						<SearchCommentaryCarousel
							history={this.props.history}
							commentaries={response.data.search_commentary_result}
						/>,
						document.getElementById('commentaries-carousel')
					);
				})
				.catch(function(error) {
					console.log(error);
				});
			axios
				.post('/api/get_trending_search/')
				.then((response) => {
					this.setState({ trending: response });
				})
				.catch(function(error) {
					console.log(error);
				});
		}
	}
	handleJoinGroup = (group) => {
		this.state.originGroups.map((el) => {
			if (el.id == group.id) el.joined = !el.joined;
			return el;
		});
		this.setState({ originGroups: this.state.originGroups });
		const user = JSON.parse(localStorage.getItem('user')).id;
		let url = `/api/join_group/?group=${group.id}&user=${user}`;
		if (!group.joined) url = `/api/unjoin_group_by_user/?group=${group.id}&user=${user}`;
		axios.get(url).then((response) => {}).catch(function(error) {});
		console.log(this.state.originGroups);
	};
	render() {
		let carousel = '';
		if (this.state.result.data) {
		}
		console.log('carousel', carousel);
		return (
			<div>
				<Helmet>
					<title>Search</title>
					<meta name="description" content="Description of Home" />
				</Helmet>

				<Header history={this.props.history} />

				<Layout>
					<Content className="content">
						{this.state.result.data ? (
							<div>
								<Row>
									<Row>
										<Col span={21} offset={2} id="commentaries-carousel" />
									</Row>
									<Col sm={22} md={22} lg={14} offset={1}>
										<Card title="Search Result:" style={{ marginTop: 20 }}>
											<List
												itemLayout="vertical"
												pagination={{ pageSize: 10 }}
												dataSource={this.state.result.data.search_result}
												renderItem={(item, index) => (
													<List.Item
														key={index}
														extra={
															<div
																key="1"
																style={{
																	display: 'flex',
																	flexDirection: 'column',
																	marginRight: 30
																}}
															>
																<p style={{ color: '#9e419b' }}>
																	{item.total_comments} Comments
																</p>
																<Link
																	style={{ color: 'black' }}
																	to={'/view/' + item.id}
																>
																	<img
																		style={{ width: 100, height: 100 }}
																		src={item.img_url || alter}
																	/>
																</Link>
																<Button
																	type="primary"
																	style={{ marginTop: 10, backgroundColor: '#9e419b' }}
																	onClick={() => {
																		this.setState({
																			isShareOpen: { [index]: true }
																		});
																	}}
																>
																	Take
																</Button>
																<ShareArticleModal
																	visible={this.state.isShareOpen[index] || false}
																	posts={[
																		{
																			id: item.id,
																			avatar: item.image_url,
																			title: item.title,
																			author: item.author,
																			time: moment(
																				+new Date(item.created_at)
																			).fromNow(),
																			views: item.total_views
																		}
																	]}
																	commentId={-1}
																	kind={2}
																	onClose={() =>
																		this.setState({
																			isShareOpen: {
																				[index]: false
																			}
																		})}
																/>
															</div>
														}
													>
														<List.Item.Meta
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
															description={'By   @' + item.post_user}
														/>
														<Link style={{ color: 'black' }} to={'/view/' + item.id}>
															{item.main_sentence}
														</Link>
													</List.Item>
												)}
											/>
										</Card>
									</Col>

									<Col sm={22} md={22} lg={8} offset={1}>
										<Card title="Group Search Result:" style={{ marginTop: 20 }}>
											<List
												itemLayout="vertical"
												pagination={{ pageSize: 3 }}
												dataSource={this.state.groups}
												renderItem={(item) => (
													<List.Item
														key={item.id}
														extra={
															<React.Fragment>
																<a
																	style={{
																		color: '#4286f4',
																		fontSize: 25,
																		marginRight: 50
																	}}
																	onClick={() => this.handleJoinGroup(item)}
																>
																	{item.joined ? 'Unjoin' : 'Join'}
																</a>

																<Link
																	style={{ color: 'black' }}
																	to={'/view/' + item.id}
																>
																	<img
																		style={{ width: 100, height: 100 }}
																		src={item.image || alter}
																	/>
																</Link>
															</React.Fragment>
														}
													>
														<List.Item.Meta
															title={
																<React.Fragment>
																	{item.title}
																	{item.privacy || item.joined ? (
																		<Link to={'/group/' + item.id}>
																			<h2>{item.name}</h2>
																		</Link>
																	) : (
																		<h2
																			onClick={() =>
																				openNotificationWithIcon(
																					'warning',
																					'Warning',
																					`${item.name} is a Private Group.`
																				)}
																		>
																			{item.name}
																		</h2>
																	)}
																</React.Fragment>
															}
															description={
																item.members + ' members  ' + item.posts + ' posts'
															}
														/>
													</List.Item>
												)}
											/>
										</Card>
									</Col>
								</Row>
							</div>
						) : null}
					</Content>
				</Layout>
			</div>
		);
	}
}

export default Searchbar;
