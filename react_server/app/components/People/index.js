import React from 'react';
import { Tooltip } from 'antd';
import avatar from '../../images/avatar.png';
import { Link } from 'react-router-dom';

const People = ({ keyword, description, image_url }) => {
  if (keyword) {
    return (
      <div className="info-block">
        <div className="holder">
          <Link to={'/search/?query=' + keyword}>
            <div className="img-holder">
              <Tooltip title={description || ''}>
                <img src={image_url || avatar} alt="" />
              </Tooltip>
            </div>{' '}
           <Tooltip title={keyword || ''}> <div style={{width: 160, whiteSpace: "nowrap", overflow:"hidden", textOverflow:"ellipsis"}}>{keyword}</div></Tooltip>
          </Link>
        </div>
      </div>
    );
  }
  return null;
};

export default People;
