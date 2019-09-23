import React from 'react';
import { connect } from 'react-redux';
import { Helmet } from 'react-helmet';
import Header from '../Headerr/Loadable';
import { Link } from 'react-router-dom';
import moment from 'moment';
import axios from '../../utils/http';
import avatar from '../../images/avatar.png';
import CreateGroupModal from '../../components/CreateGroupModal';
import { Row, Col, Button, Input, notification } from 'antd';
const { TextArea } = Input;
import './style.css';
const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};

const GROUP_COLORS = [ 'red', 'green', 'blue', 'yellow' ];
const GroupCard = (props) => {
	return (
		<Row className={'group-card'}>
			<Link to={`/group/${props.group.id}`}>
				<Col
					className={'group-avatar'}
					style={{ backgroundColor: GROUP_COLORS[props.group.id % GROUP_COLORS.length] }}
					span={1}
				/>
				<Col className={'group-content'} span={12}>
					<Row className={'group-title'}>{props.group.name}</Row>
					<Row className={'group-description'}>{props.group.description}</Row>
					<Row className={'group-info'}>
						{props.group.members} Members &nbsp; {props.group.posts} Posts
					</Row>
				</Col>

				<Col className={'group-button'} span={4}>
					<Row type="flex" justify="space-around" align="middle">
						<Button type="primary" onClick={props.onJoin}>
							Join
						</Button>
					</Row>
				</Col>
			</Link>
		</Row>
	);
};

export default class MyGroupNew extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			visibleGroups: 3,
			createModalVisible: false,
			recommendedGroups: [
				{
					id: 1,
					name: 'JavascriptFo rumASFASD FASDFA FASDFAASDF',
					description:
						'Descript ionasdfk jasdlfjas dlkfjalskd jfalksdjflaksdjflaksjdflaksdjflaksdjflaksdjflksadjflaksjdflakdsjflaksjdflaksjdflaksjdflaksfasdfasdfasdowieurkjknlkfpqq',
					members: 12345,
					posts: 34542
				}
			],
			loaded: false
		};
		// this.handleJoinGroup = this.handleJoinGroup.bind(this);
		this.handleCreateNewGroup = this.handleCreateNewGroup.bind(this);
	}
	fetchGroups = () => {
		console.log('fetch groups');
		const user = JSON.parse(localStorage.getItem('user')) || {};
		axios
			.get('/api/get_all_groupinfo')
			.then((response) => {
				console.log('groups', response.data.groups);
				response.data.groups.map((group, index) => {
					group.selected = false;
				});
				this.setState({ recommendedGroups: response.data.groups });
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	componentDidMount() {
		this.fetchGroups();
	}
	componentDidUpdate() {}
	handleCreateNewGroup = () => {};
	handleJoinGroup = (index) => {
		let groupName = this.state.recommendedGroups[index].name;
		let id = this.state.recommendedGroups[index].id;
		const user = JSON.parse(localStorage.getItem('user')).id;
		axios
			.get(`/api/join_group/?group=${id}&user=${user}`)
			.then((response) => {
				this.state.recommendedGroups.splice(index, 1);
				this.setState(
					{
						recommendedGroups: this.state.recommendedGroups
					},
					() => {
						openNotificationWithIcon('success', 'Success', `Joined to ${groupName} successfully.`);
					}
				);
			})
			.catch(function(error) {
				openNotificationWithIcon('error', 'Error', 'Server error occured!');
			});
	};
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
						<Row>
							<Col span={16} className={'main-panel'}>
								<Row className={'top-panel'}>
									<Row type="flex" justify="center">
										<h1>Welcome to Groups!</h1>
									</Row>
									<Row type="flex" justify="center">
										<Button
											type="primary"
											size="large"
											shape="round"
											onClick={() => {
												this.setState({ createModalVisible: true });
											}}
										>
											Create New Group
										</Button>
										<CreateGroupModal
											onCreate={() => {}}
											visible={this.state.createModalVisible}
											onClose={() => this.setState({ createModalVisible: false })}
										/>
									</Row>
								</Row>
								<Row className={'bottom-panel'}>
									<Row type="flex" justify="center">
										<h1>Discover Groups</h1>
									</Row>

									<Row>
										{this.state.recommendedGroups.map((element, index) => {
											if (index < this.state.visibleGroups)
												return (
													<GroupCard
														key={index}
														group={element}
														onJoin={this.handleJoinGroup.bind(this, index)}
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
