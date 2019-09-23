import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { createStructuredSelector } from 'reselect';
import { compose } from 'redux';
import { Layout, Avatar, Input, Row, Col, Icon, Divider, Tooltip } from 'antd';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import { get } from 'lodash';
import makeSelectHeaderr from './selectors';
import { selectGlobal } from '../App/selectors';
import Logo from '../../images/logo.png';
import reducer from './reducer';
import avatar from '../../images/avatar.png';
import logo from '../../images/logo.png';
import groupImage from '../../images/group.png';
import saga from './saga';
import moment from 'moment';
import { fetchUser } from '../App/api.js';
import { Button, Select, Dropdown, Menu, Card, Badge, AutoComplete } from 'antd';
import axios from '../../utils/http';
import alter from './alter.jpg';
import './style.css';
import MenuItem from 'antd/lib/menu/MenuItem';
import SubMenu from 'antd/lib/menu/SubMenu';
import isLogin from '../App/selectors';
const Search = Input.Search;
const { Header } = Layout;
const { Option } = AutoComplete;

/* eslint-disable react/prefer-stateless-function */
export class Headerr extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			username: '',
			query: '',
			trending: '',
			notification: false,
			notificationsData: [],
			notificationFlag: false,
			notificationFlagSet: true,
			image: '',
			searchDataSource: [],
			searchDropdownOpen: true,
			currentUser: -1,
			searchSelected: false
		};
	}
	handleRedirect2 = () => {
		this.props.history.push('/add-news');
	};

	handleRedirect = () => {
		const userID = get(this, 'props.global.user.id', null);
		const user = JSON.parse(localStorage.getItem('user')) || {};

		const currentUser = get(user, 'id', null);

		if (currentUser) {
			this.props.history.push(`/news-page/${currentUser}`);
		}
	};
	handleGroupRedirect = () => {
		const userID = get(this, 'props.global.user.id', null);
		const user = JSON.parse(localStorage.getItem('user')) || {};

		const currentUser = get(user, 'id', null);
		const data = { user: currentUser };
		axios
			.get(`/api/get_group_count_by_user/?user=${currentUser}`)
			.then((response) => {
				if (response.data.count > 0) {
					this.props.history.push(`/my-groups/${currentUser}`);
				} else {
					this.props.history.push(`/my-group-new/${currentUser}`);
				}
			})
			.catch(function(error) {});
	};

	componentDidMount() {
		this.fetchUser();
		let user = JSON.parse(localStorage.getItem('user')) || {};
		let currentUser = get(user, 'id', null);
		this.state.currentUser = currentUser;
		let data = new FormData();
		data.append('user', currentUser);

		axios
			.get(`/api/user-profile?user=${currentUser}&limit=1`)
			.then((response) => {
				localStorage.setItem('current_profile_image', response.data[0].image);
				this.setState({ image: response.data[0].image });
			})
			.catch(function(error) {});

		axios
			.post('/api/get_trending_search/')
			.then((response) => {
				this.setState({ trending: response.data });
			})
			.catch(function(error) {});

		axios
			.post('/api/get_notifications/', data)
			.then((response) => {
				this.setState({
					notificationsData: response.data.notifications,
					notificationFlag: response.data.new_notification
				});
				console.log('notification data', response.data);
			})
			.catch(function(error) {});
	}

	fetchUser = async () => {
		const email = localStorage.getItem('email');

		try {
			const response = await fetchUser(email);
			const u = get(response, 'data[0]', {});
			this.setState({ user: u });
		} catch (e) {}
	};

	logout = () => {
		localStorage.clear();
		this.props.history.push('/');
	};

	handleOption = (e) => {
		{
			this.setState({ query: `${e.key}` });
			this.props.history.push(`/search/?query=${e.key}`);
		}
	};
	handleNotification = (url) => {
		this.props.history.push(url);
	};
	menu = () => {
		return (
			<Menu onClick={this.handleOption}>
				{this.state.trending ? (
					this.state.trending &&
					this.state.trending.map((i) => {
						return (
							<Menu.Item className={'trending-menu'} key={i}>
								{i}
							</Menu.Item>
						);
					})
				) : null}
			</Menu>
		);
	};

	notificationMenu = () => {
		if (this.state.notificationFlagSet == true) {
			const { notificationFlag } = this.state;
			const { notificationFlagSet } = this.state;
			this.setState({ notificationFlag: false });
			this.setState({ notificationFlagSet: false });
		}
		return (
			<Menu style={{ width: 400, height: 400, marginBottom: 100 }}>
				<Menu.Item key={-1} style={{ textAlign: 'center' }}>
					<strong>Notifications</strong>
				</Menu.Item>
				<Menu.Divider />
				<div key={'sub1'} style={{ overflow: 'auto', height: 350 }}>
					{this.state.trending ? (
						this.state.notificationsData.map((i, index) => {
							return (
								<Menu.Item key={index}>
									<div
										style={{
											marginLeft: 10,
											marginRight: 10,
											borderBottom: '1px solid #e2e2e2'
										}}
									>
										<Row
											className={'notification-row'}
											onClick={() => this.handleNotification(i.url)}
										>
											<Col
												span={4}
												style={{
													paddingTop: 5,
													paddingLeft: 8
												}}
											>
												<img
													style={{ height: 50, width: 50, borderRadius: 10 }}
													src={i.img_url || avatar}
												/>
											</Col>
											<Col span={20} style={{ paddingLeft: 5 }}>
												<div>
													<strong>{i.user_name}</strong>
												</div>
												<div>{i.text}</div>
												<div>
													<small>{moment(+new Date(i.saved_at)).fromNow()}</small>
												</div>
											</Col>
										</Row>
									</div>
								</Menu.Item>
							);
						})
					) : null}
				</div>
			</Menu>
		);
	};
	onSearchSelect = (value, option, event) => {
		this.state.searchSelected = true;
	};

	handleSearch = (query) => {
		if (query.length > 0) {
			this.setState({
				searchDropdownOpen: false
			});
			this.props.history.push(`/search/?query=${query}`);
		}
	};
	onPopulateSearch = (value) => {
		axios.get(`/api/get_search_keywords/?query=${value}`).then((response) => {
			console.log('search candidates:', response.data);
			this.setState({
				searchDataSource: response.data
			});
		});
	};
	handleChange = (evt, option) => {
		if (option.props.value) {
			this.setState({ query: option.props.value, searchDropdownOpen: true });
		} else if (option.props.text) {
			this.setState({ query: option.props.text, searchDropdownOpen: true });
			this.handleSearch(option.props.text);
		} else {
			this.setState({ query: '', searchDropdownOpen: true });
		}
	};

	renderSearchOption = (item, index) => {
		if (this.state.query == '' && index == 0) {
			return (
				<Option key={-1} text={item} disabled>
					<div className="global-search-item">
						<span className="global-search-item-desc">
							<small style={{ color: 'gray' }}>RECENT SEARCHES</small>
						</span>
					</div>
				</Option>
			);
		} else {
			return (
				<Option key={index} text={item}>
					<div className="global-search-item">
						<span className="global-search-item-desc">{item}</span>
					</div>
				</Option>
			);
		}
	};
	checkNotification = () => {
		axios.get(`/api/check_notification/?user=${this.state.currentUser}`).then((r) => {});
	};
	render() {
	 let { user } = this.props.userInfo;
	  if (this.props.first_mode != undefined)
    user.first_mode  = this.props.first_mode;
		return (
			<Header className={'header'}>
				<Col xs={{ span: 3 }} sm={{ span: 3 }} md={{ span: 3 }} lg={{ span: 3 }}>
					<Link to="/home" className="logo-header">
						<img src={logo} style={{ width: '100%' }} />
					</Link>
				</Col>

				<Col xs={8} sm={8} md={9} lg={9} offset={1}>
					<div className="global-search-wrapper" style={{ width: '100%', color: '#9e419b', borderColor: '#9e419b' }}>
						<AutoComplete
							className="global-search"
							size="large"
							style={{ width: '100%', color: '#9e419b', borderColor: '#9e419b'}}
							dataSource={this.state.searchDataSource.map(this.renderSearchOption)}
							onSelect={this.onSearchSelect}
							onSearch={this.onPopulateSearch}
							onChange={this.handleChange}
							defaultActiveFirstOption={false}
							placeholder="Search Anything on Articlize"
							optionLabelProp="text"
							autoFocus={false}
							onBlur={() => {
								this.setState({ searchDropdownOpen: false });
							}}
							open={this.state.searchDropdownOpen}
						>
							<Input
								suffix={
									<Button
										className="search-btn"
										style={{ marginRight: -12, backgroundColor: '#9e419b', color: '#ffffff'}}
										size="large"
										type="secondary"
										onClick={() => this.handleSearch(this.state.query)}
									>
										<Icon type="search" />
									</Button>
								}
								onKeyDown={(event) => {
									if (event.key === 'Enter') {
										console.log('query::::::::', this.state.query);
										if (!this.state.searchSelected) this.handleSearch(this.state.query);
										this.state.searchSelected = false;
										this.setState({
											searchDropdownOpen: false
										});
									}
								}}
							/>
						</AutoComplete>
					</div>
				</Col>

				<Col xs={2} sm={2} md={2} lg={2} style={{ marginLeft: '1%' }}>
					<Dropdown overlay={this.menu}>
						<Button>Trending</Button>
					</Dropdown>
				</Col>
				<Col span={7} offset={1}>

					<Row style={{ display: 'flex' }}>
						<Col span={12} style={{ margin: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                 {user &&
									user &&
                     (user.is_superuser || user.first_mode) && (
										<Button style={{  width: 40, height: 40, padding: 0, marginTop: 2 }} onClick={this.handleRedirect2} type="" size="large">
                      <Icon type="plus" style={{ paddingBottom: 5 }}/>
										</Button>
									)}
							<Tooltip placement="bottom" title={<span>My Groups</span>}>
								<div className={'group-button'} style={{ marginLeft: 25 }} onClick={this.handleGroupRedirect} />
							</Tooltip>
						</Col>
						<Col span={12} offset={1} style={{ whiteSpace: 'nowrap', overflow: 'hidden', display: 'flex' }}>
							<Col span={8}>
								<Dropdown
									size={'large'}
									overlay={this.notificationMenu}
									placement="bottomCenter"
									trigger={[ 'click' ]}
								>
									<Badge dot={this.state.notificationFlag} style={{ color: 'white' }}>
										<Tooltip placement="bottom" title={<span>Notifications</span>}>
											<Icon
												type="bell"
												className={'notification-icon'}
												onClick={() => this.checkNotification()}
											/>
										</Tooltip>
									</Badge>
								</Dropdown>
							</Col>

							<div
								span={12}
								lg={{ offset: 4 }}
								onClick={this.handleRedirect}
								style={{ cursor: 'pointer', margin: 'auto' }}
							>
								<Tooltip placement="bottom" title={<span>User Profile</span>}>
									<div className={'header-user'}>
										<img className={'header-user-img'} src={this.state.image || avatar} />
									</div>
								</Tooltip>
							</div>
						</Col>
					</Row>
				</Col>
			</Header>
		);
	}
	s;
}

Headerr.propTypes = {
	dispatch: PropTypes.func.isRequired
};

const mapStateToProps = createStructuredSelector({
	headerr: makeSelectHeaderr(),
	userInfo: isLogin()
	// global: selectGlobal()
});

function mapDispatchToProps(dispatch) {
	return {
		dispatch
	};
}

const withConnect = connect(mapStateToProps, mapDispatchToProps);

const withReducer = injectReducer({ key: 'headerr', reducer });
const withSaga = injectSaga({ key: 'headerr', saga });

export default compose(withReducer, withSaga, withConnect)(Headerr);
