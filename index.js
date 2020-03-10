const EventEmitter = require('events');

class APP extends EventEmitter {

    constructor(config) {
        super();
        this.MODULE = require("./lib/mod")(this);
        this.crypto = require('./lib/crypto')(this);
        this.config = {};
        this.config = Object.assign(this.config, this.getDefaultConfig(), config);

        if (!this.PEER)
            this.PEER = require("./lib/peer")(this);

        if (!this.DATA)
            this.DATA = require("./lib/data")(this);

        if (!this.ELECTION)
            this.ELECTION = require("./lib/election")(this);

        if (!this.PEERMANAGER)
            this.PEERMANAGER = require("./lib/mappers/peer")(this);

        if (!this.DATAMANAGER)
            this.DATAMANAGER = require("./lib/mappers/data")(this);

    }
    definePeerClass(man) {
        this.PEER = man;
    }
    definePeerManagerClass(man) {
        this.PEERMANAGER = man;
    }
    setPeerManager(man) {
        this.peerManager = man;
    }
    defineElectionClass(man) {
        this.ELECTION = man;
    }
    start(election) {
        this.emit("app.config", this.config);

        if (!this.peerManager)
            this.peerManager = new this.PEERMANAGER();
        this.emit("app.peermanager");

        if (!this.dataManager)
            this.dataManager = new this.DATAMANAGER();
        this.emit("app.datamanager");

        this.initAlgorithm(this.config.algorithm, election);
    }

    initAlgorithm(algorithm_name, algoritm_fnc) {

        if (typeof algoritm_fnc == 'string')
            algorithm_name = algoritm_fnc.toString();

        if (algoritm_fnc instanceof Function) {
            this.election = new (algoritm_fnc(this));
        } else {
            let cls = null;
            if (algorithm_name == 'simple')
                cls = this.ELECTION.SIMPLE;

            if (!cls)
                this.election = new this.ELECTION();
            else
                this.election = new cls();
        }

        this.election_name = this.election.election_config_field;
        this.emit("app.selected_election", this.election_name);
        this.election.init();
    }
    getElection() {
        return this.election;
    }
    getDefaultConfig() {
        return {
            'election': {
                'majority': 0.75
            },
            'node': {
                'privateKey': '',
                'publicKey': ''
            }
        };
    }

}

module.exports = APP;