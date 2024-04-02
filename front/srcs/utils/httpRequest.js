

function fetch_failed(url) {
    console.error(`fetch to ${url} failed`);
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
    const headers = {
        Authorization: "Bearer " + localStorage.getItem("access_token"),
        "Content-Type": "application/json"
    };
    console.log('header: ', headers);

    fetch(url, {
        method: method,
        headers: headers,
        body: body
    })
    .then((res) => {
        if (res.status === 200 || res.status == 201){
            return res.json();
        }
        const refresh_token = localStorage.getItem("refresh_token")
        // access_token 이 만료되어 권한이 없고, 리프레시 토큰이 있다면 그 리프레시 토큰을 이용해서 새로운 access token 을 요청
        if (res.status === 401 && refresh_token) {
            const GET_TOKEN_URI = `http://${window.location.hostname}:8000/refresh`;

            fetch(GET_TOKEN_URI, {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    refresh_token
                })
            })
            .then((res) => res.json())
            .then((result) => {
                localStorage.setItem("access_token", result.accessToken)
                httpRequest(method, url, body, success, fail)
            })
            .catch(() => {
                fail(url);
            })
        }
        else {
            throw  new Error('failed to refresh token.');
        }
    })
    .then((json) => {
        success(json);
    })
    .catch(() => {
        fail(url);
    })
}