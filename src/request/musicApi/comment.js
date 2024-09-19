import musicApi from "../music";

// 获取当前时间戳
const getTimestamp = () => Date.now();

// 获取评论
export const getComments = async (id, type, sortType, pageSize = 10, pageNo = 1, cursor) => {
    try {
        let url = `/comment/new?id=${id}&type=${type}&sortType=${sortType}&timestamp=${getTimestamp()}`;
        if(pageNo && pageSize) {
            url+=`&pageSize=${pageSize}&pageNo=${pageNo}`
        }
        if(sortType === 3 && pageNo !== 1 && cursor) {
            url+=`&cursor=${cursor}`
        }
        return musicApi.get(url).catch(error => {
            console.error('获取评论时发生错误:',error)
            throw error;
        });
    } catch (error) {
        console.log(error)
        throw error;
    }
}

// 获取楼层评论
export const getFloorComments = async (id, type, parentCommentId, limit, time) => {
    try {
        let url = `/comment/floor?id=${id}&type=${type}&parentCommentId=${parentCommentId}&timestamp=${getTimestamp()}`
        if(limit) {
            url+=`&limit=${limit}`
        }
        if(time) {
            url+=`&time=${time}`
        }
        return musicApi.get(url).catch(error => {
            console.error('获取楼层评论时发生错误:',error)
            throw error;
        });
    } catch (error) {
        console.log(error)
        throw error;
    }
}

// 删除/发送/回复评论
export const operateComment = async (id, type, commentId, t, content, cookie) => {
    try {
        let url = `/comment?id=${id}&type=${type}&t=${t}&content=${content}&timestamp=${getTimestamp()}`;
        if(commentId && t === 2) {
            url+=`&commentId=${commentId}`
        }
        return musicApi.post(url,{
            cookie:cookie
        })
    } catch (error) {
        console.log(error)
        throw error;
    }
}

//  评论点赞/取消点赞
export const likeComment = async (id, type, cid, t, cookie) => {
    try {
        let url = `/comment/like?id=${id}&type=${type}&cid=${cid}&t=${t}&timestamp=${getTimestamp()}`;
        return musicApi.post(url,{
            cookie:cookie
        })
    } catch (error) {
        console.log(error)
        throw error;
    }
}