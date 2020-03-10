module.exports = function (app) {

    class Peer extends app.MODULE {

        constructor(data) {
            super();
            this.data = data;
            this._private = data.private;//debug only
            this.f_onmessage = null;
        }

        getId() {
            return this.data.id;
        }

        signVote(vote) {

            if (!this._private)
                throw new Error('Peer dont have private key to sign message');

            let { id, answer } = vote;
            let sign = app.crypto.sign(this._private, app.crypto.sha256(new Buffer('vote' + id + "" + this.getId() + "" + answer))).toString('hex');

            return {
                id, answer, sign
            }
        }

    }

    return Peer;

}