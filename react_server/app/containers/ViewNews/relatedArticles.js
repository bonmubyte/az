import React, { Component } from 'react';
import InfiniteCarousel from 'react-leaf-carousel';
// import leo from './leo.jpeg';
import './relatedArticles.css';

class Leaf extends Component {
  state = {};
  render() {
    return (
      <InfiniteCarousel
        breakpoints={[
          {
            breakpoint: 500,
            settings: {
              slidesToShow: 2,
              slidesToScroll: 2,
            },
          },
          {
            breakpoint: 768,
            settings: {
              slidesToShow: 3,
              slidesToScroll: 3,
            },
          },
        ]}
        dots={true}
        // showSides={true}
        sidesOpacity={0.5}
        sideSize={0.1}
        slidesToScroll={4}
        slidesToShow={4}
        scrollOnDevice={true}
      >
        <a href="#">
          <div className="gallery link">
            <img src="https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215" />

            <div className="desc">
              Add a description of the image here hehehehehf
            </div>
          </div>
        </a>

        <a href="#">
          <div className="gallery link">
            <img src="https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215" />

            <div className="desc">
              Add a description of the image here hehehehehf
            </div>
          </div>
        </a>

        <a href="#">
          <div className="gallery link">
            <img src="https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215" />

            <div className="desc">
              Add a description of the image here hehehehehf
            </div>
          </div>
        </a>

        <a href="#">
          <div className="gallery link">
            <img src="https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215" />

            <div className="desc">
              Add a description of the image here hehehehehf
            </div>
          </div>
        </a>

        <a href="#">
          <div className="gallery link">
            <img src="https://placeholdit.imgix.net/~text?txtsize=20&bg=904098&txtclr=ffffff&txt=215%C3%97215&w=215&h=215" />

            <div className="desc">
              Add a description of the image here hehehehehf
            </div>
          </div>
        </a>
      </InfiniteCarousel>
    );
  }
}

export default Leaf;
