import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import avatar from '../../images/avatar.png';
import axios from '../../utils/http';
import { get } from 'lodash';
import { Row, Input, Modal, Switch, notification } from 'antd';
const { TextArea } = Input;
import './style.css';
const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};

export default class CreateGroupModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = { name: '', description: '', privacy: true, visible: true };
	}
	onCreate = () => {
		const user = JSON.parse(localStorage.getItem('user')) || {};
		const currentUser = get(user, 'id', null);
		let data = new FormData();
		if (currentUser) {
			data.append('user', currentUser);
		} else {
			data.append('user', -1);
		}
		if (this.state.name == '') {
			openNotificationWithIcon('error', 'Failed to create a new group', 'Please enter your group name.');
			return;
		} else {
			data.append('name', this.state.name);
		}
		data.append('privacy', this.state.privacy);
		data.append('visible', this.state.visible);
		data.append('description', this.state.description);
		console.log('create group');
		axios
			.post('/api/create_new_group/', data)
			.then((response) => {
				this.props.onClose();
				console.log(response);
				if (response.status == 200) {
					openNotificationWithIcon('success', 'Success', `${this.state.name} group is created successfully.`);
					this.props.onCreate();
				} else openNotificationWithIcon('error', 'Failed to create a new group', 'Server error ocurred.');
			})
			.catch(function(error) {
				console.log(error);
			});
	};
	onChangeName = (event) => {
		this.setState({
			name: event.target.value
		});
	};
	onChangePrivate = (checked) => {
		this.setState({ privacy: checked });
	};
	onChangeVisible = (checked) => {
		this.setState({ visible: checked });
	};

	onChangeDescription = (e) => {
		if (e.target.value.length <= 1000) this.setState({ description: e.target.value });
	};

	componentDidMount() {}
	render() {
		return (
			<Modal
				className={'create-group-modal'}
				title="Add New Group"
				centered
				visible={this.props.visible}
				onOk={this.props.onClose}
				onCancel={this.props.onClose}
				footer={[
					<div key="1" className="footer-button" onClick={this.onCreate}>
						Create New Group
					</div>
				]}
			>
				<Row>
					<label className={'field-required create-group-modal-label'}>Name of the Group</label>
					<Input placeholder="" className={''} value={this.state.name} onChange={this.onChangeName} />
				</Row>
				<Row className={'mt-20'}>
					<label className={'create-group-modal-label'}>Description of the Group</label>
					<TextArea
						placeholder="(optional, 1000 characters maximum)"
						className={''}
						autosize={{ minRows: 2 }}
						value={this.state.description}
						onChange={this.onChangeDescription}
					/>
				</Row>

				<Row className={'mt-20'}>
					<label className={'create-group-modal-label'}>Select Privacy</label>
				</Row>
				<Row className={'mt-20'}>
					<label className={'create-group-modal-description'}>
						Private Group (only members can read & post)
					</label>
					<Row className={'create-group-modal-description'}>
						<Switch defaultChecked size="default" onChange={this.onChangePrivate} />
						&nbsp; Shown
					</Row>
				</Row>
				<Row className={'mt-20'}>
					<label className={'create-group-modal-description'}>
						Visible (shown in my profile, but people won't be able to join, read, or post)
					</label>
					<Row className={'create-group-modal-description'}>
						<Switch defaultChecked onChange={this.onChangeVisible} /> &nbsp; Shown
					</Row>
				</Row>
			</Modal>
		);
	}
}
