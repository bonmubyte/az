import React from 'react';
import { connect } from 'react-redux';

import axios from '../../utils/http';
import { Link } from 'react-router-dom';
import avatar from '../../images/avatar.png';
import {
	Row,
	Col,
	Card,
	Badge,
	message,
	Button,
	Input,
	List,
	Tabs,
	Icon,
	Modal,
	Switch,
	Dropdown,
	Menu,
	notification,
	Avatar
} from 'antd';
const { TextArea } = Input;
import './style.css';

const Group = (props) => {
	return (
		<Link to={`/group/${props.info.id}`}>
			<Row className={'my-panel-group-row'}>
				<Row className={'my-panel-group'}>
					<div>
						{props.info.alert == 'new' ? <div className={'my-panel-group-notification'}>!</div> : null}
						<div className={'my-panel-group-avatar'}>
							<img src={props.info.image || avatar} />
						</div>
					</div>
					<div className={'my-panel-group-name'}>{props.info.name}</div>
				</Row>
			</Row>
		</Link>
	);
};

class MyGroups extends React.Component {
	constructor(props) {
		super(props);
		//	this.handleClick = this.handleClick.bind(this);
	}
	componentDidMount() {}
	handleClick = (id) => {
		axios.get(`/api/check_group_alert/?group=${id}`);
		location.href = `/group/${id}`;
	};
	render() {
		return (
			<Row className={'my-groups-panel'}>
				<Row className={'my-groups-panel-name'}> My Groups </Row>
				<Row justify="center">
					<Button className={'my-groups-panel-create'} type="secondary" onClick={() => this.props.onCreate()} style = {{backgroundColor: '#9e419b', color: '#ffffff'}}>
						Create New
					</Button>
				</Row>
				<Row>
					{this.props.groups.map((group, index) => {
						return <Group info={group} key={index} />;
					})}
				</Row>
			</Row>
		);
	}
}

MyGroups.propTypes = {};

export default MyGroups;
