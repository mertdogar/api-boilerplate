const ClientError = require('./clienterror');


class HttpError extends ClientError {
    constructor(status, message, payload) {
        super(message, payload);
        this.status = status;
    }


    toJSON() {
        return {
            message: this.message,
            payload: this.payload,
            name: this.name,
            status: this.status
        };
    }
}


module.exports = HttpError;
