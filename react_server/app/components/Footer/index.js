/**
 *
 * Footer
 *
 */

import React from 'react';
import { Layout } from 'antd';

//const { Footer } = Layout;
// import PropTypes from 'prop-types';
// import styled from 'styled-components';

function Footer() {
	return (
		<Layout.Footer
			style={{
				textAlign: 'center',
				position: 'absolute !important',
				bottom: 0,
				width: '100%'
			}}
		>
			All rights reserved ©2018.
		</Layout.Footer>
	);
}

Footer.propTypes = {};

export default Footer;
