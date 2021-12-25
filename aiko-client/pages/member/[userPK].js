import React from 'react';
import PropTypes from 'prop-types';
import { strings } from 'web-snippets';
import { post } from 'axios';
import { useRouter } from 'next/router';

// * Container Component
export default function CComp({ data }) {
    const router = useRouter();
    const { userPK } = router.query;
    console.log('🚀 ~ file: [userPK].js ~ line 6 ~ CComp ~ userPK', userPK);
    return <PComp userInfo={data} />;
}
CComp.propTypes = {
    data: PropTypes.object.isRequired,
};

// * Presentational Component
function PComp({ userInfo }) {
    console.log('🚀 ~ file: [userPK].js ~ line 17 ~ PComp ~ userInfo', userInfo);
    return <div>{JSON.stringify(userInfo)}</div>;
}

PComp.propTypes = {
    userInfo: PropTypes.object.isRequired,
};

// * Data Fetch
export async function getServerSideProps(context) {
    const userPK = Number(context.params.userPK);
    console.log('🚀 ~ file: [userPK].js ~ line 26 ~ getServerSideProps ~ userPK', userPK);
    const cookiesObj = strings.parseCookieString(context.req.headers.cookie);
    const { TOKEN } = cookiesObj;
    let data;
    console.log('🚀 ~ file: [userPK].js ~ line 28 ~ getServerSideProps ~ TOKEN', TOKEN);

    if (userPK && TOKEN) {
        const url = 'http://localhost:5001/api/account/getUserInfo';
        const config = {
            headers: {
                'content-type': 'application/json',
            },
        };
        const packet = {
            userPK: userPK,
            TOKEN: TOKEN,
        };
        data = (await post(url, packet, config)).data;
        console.log('🚀 ~ file: [userPK].js ~ line 43 ~ getServerSideProps ~ data', data);
    }
    return {
        props: { data },
    };
}

// export async function getStaticPaths() {
//     const { data } = await get('http://localhost:5001/api/getPath/userPKList');
//     console.log('🚀 ~ file: [userPK].js ~ line 21 ~ getStaticPaths ~ data', data);
//     const paths = data.map((curr) => ({
//         params: { userPK: curr.USER_PK.toString() },
//     }));

//     return { paths, fallback: false };
// }

// export async function getStaticProps(context) {
//     const { userPK } = context.params;
//     const url = `http://localhost:5001/api/account/getUser?userPK=${userPK}`;
//     const { data } = await get(url);

//     return {
//         props: {
//             userInfo: data,
//         },
//     };
// }
