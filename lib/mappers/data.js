module.exports = function (app) {

    class DataMapper extends app.MODULE {

        constructor() {
            super();
            this.list = {};
            this.answers = {};
        }

        getDataList() {
            return this.list;
        }

        //get votes by Data
        //get votes by pubKey

        getElectionVoteByPeer(election_id, peer_id) {
            if (this.answers[election_id])
                return this.answers[election_id][peer_id];
            return false;
        }

        getElectionPeers(election_id) {
            if (!this.answers[election_id])
                this.answers[election_id] = {};
            return Object.keys(this.answers[election_id]) || [];
        }

        getElectionVotes(election_id) {
            return Object.values(this.answers[election_id] || {}) || [];
        }

        removeData(data) {
            delete this.list[data.getId()];
        }

        addData(data) {
            if (data.isValid()) {
                return this._addDataToList(data);
            } else
                throw new Error('Invalid data');
        }

        _addDataToList(data) {
            if (data.getType() == 'vote') {
                if (!this.answers[data.getId()])
                    this.answers[data.getId()] = {};
                this.answers[data.getId()][data.getPublicKey()] = data;
            } else
                this.list[data.getId()] = data;
        }

        getData(id) {
            return this.list[id];
        }

        saveData(data) {
            this.list[data.getId()] = data;
        }

    }

    return DataMapper;

}