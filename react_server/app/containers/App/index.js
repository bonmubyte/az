/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { withRouter } from 'react-router';
import { Switch, Route, BrowserRouter } from 'react-router-dom';
import 'antd/dist/antd.css';

import { connect } from 'react-redux';
import Login from 'containers/Login/Loadable';
import Signup from 'containers/Signup/Loadable';
import Home from 'containers/Home/Loadable';
import Footer from 'components/Footer/Loadable';
import NewsPage from 'containers/NewsPage/Loadable';
import Profile from 'containers/NewsPage/profile';
import ViewNews from 'containers/ViewNews/Loadable';
import Group from 'containers/Group/Loadable';
import AddNews from 'containers/AddNews/Loadable';
import AddPostFromResource from 'containers/AddPostFromResource/Loadable';
import ResetPassword from 'containers/ResetPassword/Loadable';
import SocialLoginDone from 'containers/SocialLoginDone/Loadable';
import MyGroupNew from 'containers/MyGroupNew/Loadable';
import MyGroups from 'containers/MyGroups/Loadable';
import { compose } from 'redux';
import ForgetPassword from 'containers/ForgetPassword/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import { createStructuredSelector } from 'reselect';
import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import reducer from './reducer';
import saga from './saga';
import * as a from './actions';

// import Searchbar from 'containers/Search/index';
import Searchbar from 'containers/Search/Loadable';

import MergedNews from 'containers/MeggedAddNews/Loadable';

// import { selectGlobal } from './selectors';

import GlobalStyle from '../../global-styles';

export class App extends React.Component {
	componentDidMount() {
		this.props.fetchUser(window.localStorage.getItem('email'));
		// is_profile_data = true;
	}

	render() {
		return (
			<BrowserRouter>
				<div>
					<Switch>
						{/* <Route path="/news-page" component={NewsPage} /> */}
						<Route path="/news-page/:id" component={NewsPage} />
						<Route path="/my-group-new/:id" component={MyGroupNew} />
						<Route path="/my-groups/:id" component={MyGroups} />
						<Route path="/group/:id" render={(props) => <Group {...props} />} />
						<Route path="/view/:id" component={ViewNews} />
						<Route path="/home" component={Home} />
						<Route path="/merge" component={AddNews} />
						<Route path="/add-resource" component={AddPostFromResource} />
						<Route path="/profile/:id" component={Profile} />
						<Route path="/signup" component={Signup} />
						<Route path="/reset-password" component={ResetPassword} />
						<Route path="/forget-password" component={ForgetPassword} />
						<Route path="/social-login-done" component={SocialLoginDone} />
						<Route exact path="/" component={Login} />
						<Route path="/search" component={Searchbar} />
						<Route path="/add-news" component={MergedNews} />
						<Route path="/search/:key" name="searchBar" component={Searchbar} />
						<Route component={NotFoundPage} />
					</Switch>
					<GlobalStyle />
					{/* <Footer /> */}
				</div>
			</BrowserRouter>
		);
	}
}

const mapStateToProps = createStructuredSelector(
	{
		// app: selectGlobal(),
	}
);

function mapDispatchToProps(dispatch) {
	return {
		dispatch,
		fetchUser: (payload) => dispatch(a.fetchUser(payload))
	};
}

const withReducer = injectReducer({ key: 'app', reducer });
const withSaga = injectSaga({ key: 'app', saga });

const withConnect = connect(mapStateToProps, mapDispatchToProps);

export default compose(
	// withRouter,
	withReducer,
	withSaga,
	withConnect
)(App);
