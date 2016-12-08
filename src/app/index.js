'use strict';

const debug = require('debug')('boilerplate:app');
const config = require('boilerplate/lib/config');


class App {

    /**
     * Do initalization stuff like connecting to db, starting http server etc.
     * @return {Promise}
     */
    init() {
        this.server = require('boilerplate/app/server');
        return this.server
            .init()
            .then(() => {
                this.run();
            });
    }


    /**
     * This is the run phase. Consume some queue etc.
     */
    run() {

    }
}


module.exports = new App();
