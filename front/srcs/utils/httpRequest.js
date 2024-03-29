

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
    fetch(url, {
        method: method,
        headers: {
            Authorization: "Bearer " + localStorage.getItem("access_token"),
            "Content-Type": "application/json"
        },
        body: body
    })
    .then((res) => {
        if (res.status === 200 || res.status == 201){
            return success(res.json());
        }
        const refresh_token = localStorage.getItem("refresh_token")
        // access_token 이 만료되어 권한이 없고, 리프레시 토큰이 있다면 그 리프레시 토큰을 이용해서 새로운 access token 을 요청
        if (res.status === 401 && refresh_token) {
            const GET_TOKEN_URI = `http://${window.location.hostname}:8000/api/token`;
            fetch(GET_TOKEN_URI, {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + localStorage.getItem("access_token"),
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    refresh_token
                })
            }).then((res) => {
                return res.json()
            }).then((result) => {
                localStorage.setItem("access_token", result.accessToken)
                httpRequest(method, url, body, success, fail)
            });
        }
        else {
            return fail(url);
        }
    })
}