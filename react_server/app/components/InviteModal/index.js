import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import avatar from '../../images/avatar.png';
import moment from 'moment';
import { get, _, debounce } from 'lodash';
import axios from '../../utils/http';
import { Row, Button, Input, Modal, notification, Select, Spin } from 'antd';
const { TextArea } = Input;
import './style.css';
import { element } from 'prop-types';

const { Option } = Select;

const openNotificationWithIcon = (type, message, description) => {
	notification[type]({
		message,
		description
	});
};
export default class InviteModal extends React.Component {
	constructor(props) {
		super(props);
		this.fetchUser = debounce(this.fetchUser, 800);
	}
	state = { data: [], value: [], fetching: false };
	componentDidMount() {}
	fetchUser = (value) => {
		console.log('fetching user', value);
		let group = window.location.href.split('/')[window.location.href.split('/').length - 1].split('#')[0];
		this.setState({ data: [], fetching: true });
		axios.get(`/api/search_invite_users/?query=${value}&group=${group}`).then((response) => {
			const data = response.data.map((user) => ({
				text: user.uID,
				value: user.id
			}));
			console.log('search results:', data);
			this.setState({ data, fetching: false });
		});
	};

	handleChange = (value) => {
		this.setState({
			value,
			data: [],
			fetching: false
		});
		console.log(value);
	};
	handleOk = async () => {
		let group = window.location.href.split('/')[window.location.href.split('/').length - 1].split('#')[0];
		let users = this.state.value.map((v) => {
			return v.key;
		});
		let data = new FormData();
		data.append('group', group);
		data.append('users', users);
		await axios.post('/api/add_users_to_group/', data).then((response) => {
			this.props.onClose();
		});
		this.setState({ value: [] });
	};
	render() {
		const { fetching, data, value } = this.state;
		return (
			<Modal
				className={'invite-modal'}
				centered
				visible={this.props.visible}
				title="Select people to invite"
				onOk={this.props.onOk}
				onCancel={this.props.onClose}
				footer={[
					<Button key="1" type="primary" onClick={() => this.handleOk()}>
						Ok
					</Button>
				]}
			>
				<Select
					mode="multiple"
					labelInValue
					value={value}
					placeholder="Please type user ID"
					notFoundContent={fetching ? <Spin size="small" /> : null}
					filterOption={false}
					onSearch={this.fetchUser}
					onChange={this.handleChange}
					style={{ width: '100%' }}
				>
					{data.map((d) => <Option key={d.value}>{d.text}</Option>)}
				</Select>
			</Modal>
		);
	}
}
