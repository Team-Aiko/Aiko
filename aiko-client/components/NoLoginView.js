import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/NoLoginView.module.css';
import ReactFullpage from '@fullpage/react-fullpage';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Tooltip, IconButton } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import Developer from '../public/images/developers.png';
import Image from 'next/image';

const FirstContent = () => {
    return (
        <div className={styles.firstContainer}>
            <div className={styles.descContainer}>
                <h1>Aiko</h1>
                <div>하이</div>
                <div>하이ㅋ</div>
            </div>
        </div>
    );
};

const SecondContent = () => {
    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
    };
    return (
        <Slider {...settings} className={styles.slider}>
            <div>
                <h3>1</h3>
            </div>
            <div>
                <h3>2</h3>
            </div>
            <div>
                <h3>3</h3>
            </div>
        </Slider>
    );
};

const ThirdContent = () => {
    return (
        <div className={styles.thirdContainer}>
            <h2 style={{ fontFamily: 'sans-serif' }}>Contributors !</h2>
            <Image
                className='image'
                src='/../public/images/developers.png'
                alt='Contributors'
                width={700}
                height={300}
            />
            <a target='_blank' href='https://github.com/Team-Aiko/Aiko' rel='noreferrer'>
                <Tooltip title='개발자 깃허브로 이동'>
                    <IconButton>
                        <GitHubIcon style={{ width: 100, height: 100 }} />
                    </IconButton>
                </Tooltip>
            </a>
        </div>
    );
};

const NoLoginView = () => {
    const [sectionsColor, setsectionsColor] = useState(['rgba(206,235,251)', '#0798ec', 'rgba(183,175,163)']);
    const [fullpages, setfullpages] = useState([
        { content: <FirstContent /> },
        { content: <SecondContent /> },
        { content: <ThirdContent /> },
    ]);

    return (
        <div>
            <ReactFullpage
                navigation
                scrollHorizontally={true}
                sectionsColor={sectionsColor}
                render={() => (
                    <ReactFullpage.Wrapper>
                        {fullpages.map(({ content }) => (
                            <div key={content} className='section'>
                                <div>
                                    <h2>{content}</h2>
                                </div>
                            </div>
                        ))}
                    </ReactFullpage.Wrapper>
                )}
            />
        </div>
    );
};

export default NoLoginView;
