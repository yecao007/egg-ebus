'use strict';

/**
 * egg-bullMq-egg default config
 * @member Config#bullMqEgg
 * @property {String} SOME_KEY - some description
 */
exports.ebus = {
    app: true,
    agent: true,
    debug: true,
    concurrency: 1,
    listener: {
        baseDir: 'event',
        options: {
            attempts: 5,
            backoff: {
                delay: 3000,
                type: 'fixed',
            },
        },
    },
    limiter: {
        max: 10,
        duration: 1000
    },
    redis: {
        host: 'localhost',
        port: 6379,
        password: "",
        db: 0,
    },
    queue: {
        default: 'debus', // 默认队列名称
        prefix: 'ebus', // 队列前缀
    },
    queues: {
        worker: {
            concurrency: 2,
        },
    },
};
