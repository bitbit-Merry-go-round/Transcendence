import { NAVIGATE_DRIRECTION, route } from "@/router";

function fetch_failed(url, res) {

}

/** @type {{
 *  method: string,
 *  url: URL | string,
 *  body: Object,
 *  success: any,
 *  id: number,
 *  call: boolean,
 *  refresh: boolean,
 *  done: boolean
 * }[]} 
 * */
let serverCallQueue = [];
let lastCallId = 0;

function addQueue({method, url, body, success, fail}) {

    let id = lastCallId;
    if (serverCallQueue.length > 0) {
     id = serverCallQueue[serverCallQueue.length - 1].id + 1;
    }
    lastCallId = id;

    serverCallQueue.push({
        method, url, body, success, id, fail,
        call: false, refresh: false, done: false
    });
    return serverCallQueue[serverCallQueue.length - 1];
}

export async function requestRefresh()
{
    const GET_TOKEN_URI = `${window.location.protocol}//${window.location.host}/api/token/refresh/`;
    const bodyOnlyRefresh = JSON.stringify({
        'refresh': `${window.localStorage.getItem('refresh')}`
    });
    try {
        const res = await fetch(GET_TOKEN_URI, {
            method: "POST",
            headers: getHeader(),
            body: bodyOnlyRefresh
        })
        if (!res.ok)
            return false;
        const result = await res.json();
        localStorage.setItem("access", result.access)
        localStorage.setItem("refresh", result.refresh)
        return true;
    }
    catch(error) {
      //  console.error('refresh error', error)
        return (false);
    };
}
let refreshing = false;

/**
 * httpRequest.
 * @param {string} method 
 * @param {string} url 
 * @param {object} body 
 * @param {function} success 
 * @param {function} fail
*/
export default function httpRequest(method, url, body, success, fail = fetch_failed) {
 
    const newCall = addQueue({method, url, body, success, fail});
    let refreshing = false;
    clearQueue();
    setTimeout(() => {
        if (serverCallQueue.filter(e => !e.done).length != 0)
            clearQueue();
    }, 1000);
   
} 

function clearQueue() {
    for (const queuedCall of serverCallQueue.filter(e => !e.done)) {
        try {
            getResult(queuedCall)
            .then((res) => {
               if (queuedCall.refresh) {
                return  fetch(queuedCall.url, {
                        method: queuedCall.method,
                        headers: getHeader(),
                        body: queuedCall.body
                    });
               } else if (res) {
                queuedCall.done = true;
                 queuedCall.success(res);
               }else {
                queuedCall.fail(queuedCall.url);
               }
            })
        }
        catch (error) {
            // console.log('error', error);
            queuedCall.fail(queuedCall.url);
        }
    }
}
function getHeader() {
    const access = localStorage.getItem("access");
    if (!access || access == "undefined") {
        return ({
        "Content-Type": "application/json"
        })
    }
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access}`
    }
}

export async function getResult(call) {
    const { method, url, body, success } = call;
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh")

    const headers = getHeader();
    let res;
    res = await fetch(url, {
        method: method,
        mode: "cors",
        headers: headers,
        body: body
    });

    if (res.ok) {
        return res.json();
    }
    else if (res.status === 401 && refresh) {
        call.refresh = true;
        refreshing = true;
        const refreshed = await requestRefresh();
        refreshing = false;
        
    }
    else if (res.status == 404) {
        call.done = true;
    }
    return null;
}
