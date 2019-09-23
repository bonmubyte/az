import React from 'react';

import moment from 'moment';
import alter from '../../containers/Search/alter.jpg';
import avatar from '../../images/avatar.png';
import { Row, Card, Col, Avatar } from 'antd';
const { Meta } = Card;
import { Link } from 'react-router-dom';
import InfiniteCarousel from 'react-leaf-carousel';
import ReadMoreAndLess from 'react-read-more-less';
import './style.css';

export default class SearchCommentaryCarousel extends React.Component {
	constructor(props) {
		super(props);
		this.state = { name: '', description: '', privacy: true, visible: true };
	}
	limitName = (name) => {
		let count = name.length;
		if (count > 5) {
			name = name.substring(0, 4) + '.. ';
			return name;
		} else {
			return name + ' ';
		}
	};
	componentWillReceiveProps() {}
	componentDidUpdate(prevProps) {
		console.log('search commentary carousel update');
	}
	handleNavigate = (url) => {
		this.props.history.push(url);
	};
	handleNavigateArticle = (id, e) => {
		e.stopPropagation();
		this.props.history.push(`/view/${id}`);
	};
	componentDidMount() {}
	render() {
		return (
			<InfiniteCarousel
				breakpoints={[
					{
						breakpoint: 900,
						settings: { slidesToShow: 1, slidesToScroll: 1 }
					},
					{
						breakpoint: 1200,
						settings: { slidesToShow: 2, slidesToScroll: 2 }
					},
					{
						breakpoint: 1500,
						settings: { slidesToShow: 2, slidesToScroll: 2 }
					}
				]}
				showSides={
					true // dots={true}
				}
				sidesOpacity={0.5}
				lazyload={false}
				sideSize={0.1}
				slidesToScroll={3}
				slidesToShow={(1, 2, 3)}
				scrollOnDevice={true}
				responsive={true}
			>
				{this.props.commentaries.map((item, index) => {
					return (
						<Card
							className={'search-commentary'}
							key={item.id}
							onClick={() => this.handleNavigate(item.url)}
						>
							<Meta
								avatar={
									<img
										style={{
											height: 40,
											width: 40,
											borderRadius: 10
										}}
										src={item.current_profile.img_url || avatar}
									/>
								}
								title={[
									<h4
										style={{
											height: 20,
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											whiteSpace: 'initial'
										}}
									>
										{this.limitName(item.current_profile.name)}

										{moment(+new Date(item.saved_at)).fromNow()}
									</h4>
								]}
								description={[
									item.commentary ? (
										<div
											key="1"
											style={{
												width: '100%',
												wordBreak: 'break-word'
											}}
										>
											<ReadMoreAndLess
												ref={this.ReadMore}
												className="read-more-content"
												charLimit={100}
												readMoreText="Read More"
												readLessText="Read Less"
											>
												{item.commentary}
											</ReadMoreAndLess>
										</div>
									) : null
								]}
							/>
							<div
								className={'search-commentary-post'}
								onClick={(e) => this.handleNavigateArticle(item.post_id, e)}
							>
								<Row type="flex">
									<Col>
										<img
											style={{
												height: 50,
												width: 50,
												borderRadius: 10,
												paddingTop: 10,
												paddingLeft: 10
											}}
											src={item.img_url || alter}
										/>
									</Col>
									<Col span={18} offset={1}>
										<h4
											style={{
												fontWeight: 'bold',
												marginTop: 10,
												width: 190,
												height: 37,
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												whiteSpace: 'initial'
											}}
										>
											{item.title}
										</h4>

										<h4
											style={{
												display: 'inline',
												width: 10,
												height: 20,
												whiteSpace: 'nowrap',
												overflow: 'hidden',
												whiteSpace: 'initial'
											}}
										>
											{this.limitName(item.publisher.name)}
											{moment(+new Date(item.created_at)).fromNow()}
										</h4>
										<span style={{ color: '#767676' }}>{item.total_views} Views</span>
									</Col>
								</Row>
							</div>
						</Card>
					);
				})}
			</InfiniteCarousel>
		);
	}
}
