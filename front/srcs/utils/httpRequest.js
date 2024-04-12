import { NAVIGATE_DRIRECTION, route } from "@/router";

function fetch_failed(url, res) {
    console.error(`fetch to ${url} failed`, `result: ${res}`);
    // TODO: access 토큰 또는 refresh 토큰 유효하지 않을 경우 처리할 로직.
  route({
    path: "/login",
    direction: NAVIGATE_DRIRECTION.backward
  })
}

/**
 * httpRequest.
 * @param {string} method 
 * @param {string} url 
 * @param {object} body 
 * @param {function} success 
 * @param {function} fail
*/
export default function httpRequest(method, url, body, success, fail = fetch_failed) {
    const access = localStorage.getItem("access");
    const headers = {
        "Content-Type": "application/json"
    };
    if (access && access != 'undefined')
    {
        headers.Authorization = `Bearer ${access}`;
    }
    fetch(url, {
        method: method,
        mode: "cors",
        headers: headers,
        body: body
    })
    .then((res) => {
        if (res.status === 204)
        {
            return ;
        }
        if (200 <= res.status && res.status < 300) 
        {
            return res.json();
        }
        const refresh = localStorage.getItem("refresh")
        // access 토큰이 만료되어 권한이 없고, 리프레시 토큰이 있다면 그 리프레시 토큰을 이용해서 새로운 access token 을 요청
        if (res.status === 401 && refresh) {
            const GET_TOKEN_URI = `http://${window.location.hostname}:8000/token/refresh/`;
            const body = JSON.stringify({
                'refresh': `${refresh}`
            });
            console.log('body: ', body);
            fetch(GET_TOKEN_URI, {
                method: "POST",
                headers: headers,
                body: body
            })
            .then((res) => res.json())
            .then((result) => {
                console.log('jwt token: ', result)
                localStorage.setItem("access", result.access)
                localStorage.setItem("refresh", result.refresh)
            })
            .then(() => {
                httpRequest(method, url, body, success, () => {
                    throw new Error(`${res.status}`);
                })
            })
            .catch(() => {
                localStorage.removeItem('refresh');
                throw new Error('failed to refresh token.');
            })
        }
        else {
            console.log('res', res)
            throw new Error(`${res.status}`);
        }
    })
    .then((json) => {
        success(json);
    })
    .catch((res) => {
        fail(url, res);
    })
}
