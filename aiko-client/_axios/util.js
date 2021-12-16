import { get, post } from '.';

export function sendPost(url, contentType, json) {
    try {
        let config = {
            header: {
                'content-type': '',
            },
        };

        switch (contentType) {
            case 'json': {
                config.header['content-type'] = 'application/json';

                return post(url, json, config);
            }
            case 'multipart': {
                config.header['content-type'] = 'multipart/form-data';
                const form = new FormData();
                Object.keys(json).forEach((key) => form.append(key, json[key]));

                return post(url, form, config);
            }
        }
    } catch (err) {
        throw err;
    }
}

export function sendGet(url, json) {
    try {
        let queryString = '';
        const keyList = Object.keys(json);

        keyList.forEach((key, idx) => {
            if (idx === 0) queryString += '?';
            queryString += `${key}=${json[key]}`;
            if (idx !== keyList.length - 1) queryString += '&';
        });

        return get(url + queryString);
    } catch (err) {
        throw err;
    }
}
