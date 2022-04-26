import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/components/NoLoginView.module.css';
import ReactFullpage from '@fullpage/react-fullpage';

const FirstContent = () => {
    return <div>First Content.</div>;
};

const SecondContent = () => {
    return <div>Second Content</div>;
};

const ThirdContent = () => {
    return <div>Third Content.</div>;
};

const NoLoginView = () => {
    const [sectionsColor, setsectionsColor] = useState(['#ff5f45', '#0798ec', '#fc6c7c']);
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
                                <div style={{ display: 'flex', width: '100px', height: '100px', margin: '0 auto' }}>
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
