import clone from 'clone';
import * as posts from './posts';

const db = {};

const defaultData = {
    '894tuq4ut84ut8v4t8wun89g': {
        id: '894tuq4ut84ut8v4t8wun89g',
        parentId: '8xf0y6ziyjabvozdd253nd',
        timestamp: 1468166872634,
        body: 'Hi there! I am a COMMENT.',
        author: 'thingtwo',
        voteScore: 6,
        deleted: false,
        parentDeleted: false
    },
    '8tu4bsun805n8un48ve89': {
        id: '8tu4bsun805n8un48ve89',
        parentId: '8xf0y6ziyjabvozdd253nd',
        timestamp: 1469479767190,
        body: 'Comments. Are. Cool.',
        author: 'thingone',
        voteScore: -5,
        deleted: false,
        parentDeleted: false
    }
};

const getData = token => {
    let data = db[token];
    if (data == null) {
        db[token] = clone(defaultData);
        data = db[token];
    }
    return data;
};

const getByParent = (token, parentId) => {
    return new Promise(res => {
        const comments = getData(token);
        const keys = Object.keys(comments);
        const filteredKeys = keys.filter(key => comments[key].parentId === parentId && !comments[key].deleted);
        res(filteredKeys.map(key => comments[key]));
    });
};

const get = (token, id) => {
    return new Promise(res => {
        const comments = getData(token);
        res(
            comments[id].deleted || comments[id].parentDeleted
                ? {}
                : comments[id]
        );
    });
};

const add = (token, comment) => {
    return new Promise(res => {
        const comments = getData(token);
        
        comments[comment.id] = {
            id: comment.id,
            timestamp: comment.timestamp,
            body: comment.body,
            author: comment.author,
            parentId: comment.parentId,
            voteScore: 1,
            deleted: false,
            parentDeleted: false
        };
        
        posts.incrementCommentCounter(token, comment.parentId, 1);
        res(comments[comment.id]);
    });
};

const vote = (token, id, option) => {
    return new Promise(res => {
        const comments = getData(token);
        const comment = comments[id];
        switch (option) {
            case 'upVote':
                comment.voteScore += 1;
                break;
            case 'downVote':
                comment.voteScore -= 1;
                break;
            default:
                console.log(`comments.vote received incorrect parameter: ${option}`);
        }
        res(comment);
    });
};

const disableByParent = (token, post) => {
    return new Promise(res => {
        const comments = getData(token);
        const keys = Object.keys(comments);
        const filteredKeys = keys.filter(key => comments[key].parentId === post.id);
        filteredKeys.forEach(key => {comments[key].parentDeleted = true;});
        res(post);
    });
};

const disable = (token, id) => {
    return new Promise(res => {
        const comments = getData(token);
        comments[id].deleted = true;
        posts.incrementCommentCounter(token, comments[id].parentId, -1);
        res(comments[id]);
    });
};

const edit = (token, id, comment) => {
    return new Promise(res => {
        const comments = getData(token);
        Object.keys(comment).forEach(prop => {
            comments[id][prop] = comment[prop];
        });
        res(comments[id]);
    });
};

export {
    get,
    getByParent,
    add,
    vote,
    disableByParent,
    disable,
    edit
};
