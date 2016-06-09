module.exports = {
    database: {
        location: 'mongodb://localhost/sea-battle',
        options: {
            server: {
                socketOptions: {
                    keepAlive: 300000,
                    connectTimeoutMS: 30000
                }
            },
            replset: {
                socketOptions: {
                    keepAlive: 300000,
                    connectTimeoutMS: 30000
                }
            }
        }
    },
    secret: 'token_string'
};