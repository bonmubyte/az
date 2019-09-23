import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Header from '../Headerr/Loadable';
import MyGroupsPanel from '../../components/MyGroupsPanel';
import GroupFeed from '../../components/GroupFeed';
import { Link } from 'react-router-dom';
import avatar from '../../images/avatar.png';
import moment from 'moment';
import axios from '../../utils/http';
import { get } from 'lodash';
import CreateGroupModal from '../../components/CreateGroupModal';
import { Row, Col, Input, notification, Avatar } from 'antd';
const { TextArea } = Input;
import './style.css';

const GROUP_COLORS = [ 'red', 'green', 'blue', 'yellow' ];
const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};
export default class MyGroups extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visibleGroups: 3,
			createModalVisible: false,
			groupFeeds: [],
			myGroups: [],
			loaded: false
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
					group.color = GROUP_COLORS[group.id % GROUP_COLORS.length];
					group.notification = 0;
				});
				this.setState({ myGroups: response.data.groups });
				console.log('My groups', response);
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	fetchGroupFeeds = () => {
		const currentUser = this.props.match.params.id;
		axios
			.get(`/api/get_group_feeds_by_user/?user=${currentUser}`)
			.then((response) => {
				//	let data = response.data.feeds.filter((element, index) => index < this.state.visibleGroups);
				for (let i = 0; i < response.data.feeds.length; i++) {
					response.data.feeds[i]['group_color'] =
						GROUP_COLORS[response.data.feeds[i].group_id % GROUP_COLORS.length];
					if (
						response.data.feeds[i]['pinned'] == 'pinned' &&
						response.data.feeds[i]['group_creator'] == currentUser
					) {
						response.data.feeds.splice(0, 0, response.data.feeds.splice(i, 1)[0]);
					}
				}
				console.log('group feeds', response.data.feeds);
				this.setState({ groupFeeds: response.data.feeds });
			})
			.catch(function(error) {
				console.log(error);
			});
	};

	componentDidMount() {
		this.fetchMyGroups();
		this.fetchGroupFeeds();
	}
	componentDidUpdate() {}

	render() {
		return (
			<div>
				<Helmet>
					<title>My Group</title>
					<meta name="description" content="Description of My Group" />
				</Helmet>
				<Header history={this.props.history} />
				<div className="bg-white">
					<div className="container">
						<Row type="flex" justify="end">
							<Col className={'group-panel'}>
								<MyGroupsPanel
									onCreate={() =>
										this.setState({
											createModalVisible: true
										})}
									groups={this.state.myGroups}
								/>
								<CreateGroupModal
									visible={this.state.createModalVisible}
									onClose={() => this.setState({ createModalVisible: false })}
									onCreate={() => this.fetchMyGroups()}
								/>
							</Col>

							<Col className={'commentary-panel'}>
								<Row className={'left-panel'}>
									<Row type="flex" justify="start" style={{ margin: 10 }}>
										<h1>Group Feed</h1>
									</Row>
									<Row>
										{this.state.groupFeeds.map((element) => {
											return (
												<GroupFeed
													key={element.id}
													feed={element}
													refresh={() => this.fetchGroupFeeds()}
												/>
											);
										})}
									</Row>
								</Row>
							</Col>
						</Row>
					</div>
				</div>
			</div>
		);
	}
}
