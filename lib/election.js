module.exports = function (app) {

    class Election extends app.MODULE {

        constructor(name) {
            super();

            this.f_end = function () { };
            this.election_config_name = name;
            this.majority = app.config[this.election_config_name].majority ? app.config[this.election_config_name].majority : Election.MAJORITY;
            this.config = this.extendConfig(name);
            this.debug("debug", "inited");
        }
        init() {
            this.keystore = app.config['node'];
        }
        setKeystore(ks) {
            this.keystore = ks;
        }
        setOnEnd(cb) {
            this.f_end = cb;
        }
        vote(electionId, answer) {//vote with current keystore
            let hash = app.crypto.sha256(new Buffer('vote' + electionId + "" + this.keystore.publicKey + "" + answer), 'hex');
            let sign = app.crypto.sign(this.keystore.privateKey, new Buffer(hash, 'hex')).toString('hex');
            return new app.DATA({
                type: 'vote',
                id: electionId,
                pub: this.keystore.publicKey,
                sign: sign,
                answer: answer
            });
        }
        isValidTime(time) {
            if ((Date.now() / 1000) > time)
                throw new Error('invalid time for voting');

            if (time - (Date.now() / 1000) < 60 * 60)
                throw new Error('invalid time for voting, minimum is 1 hour');

            if (time - (Date.now() / 1000) > 365 * 31 * 24 * 60 * 60)
                throw new Error('invalid time for voting, minimum is 1 hour');

            return true;
        }
        create(request, answers, until, method) {

            this.isValidTime(until);
            let d = {
                type: 'election',
                pub: this.keystore.publicKey,
                request: request,
                answers: answers,
                method: method,
                status: 'pending',
                until: until,//timestamp
                selected: false
            };

            let a = answers.sort();
            d.id = app.crypto.sha256(new Buffer('election' + this.keystore.publicKey + request + until + method + JSON.stringify(a)), 'hex');
            d.sign = app.crypto.sign(this.keystore.privateKey, new Buffer(d.id, 'hex')).toString('hex');

            let data = new app.DATA(d);
            app.dataManager.addData(data);
            return data;
        }
        voteProcess(peer, d) {
            let { id, answer, sign } = d;
            let data = app.dataManager.getData(id) || {};

            if (!app.crypto.verify(peer.getId(), sign, app.crypto.sha256(new Buffer('vote' + id + "" + peer.getId() + "" + answer))))
                throw new Error('Vote signature is not valid');

            if (!data)
                throw new Error('Election is not found');

            if (data.getStatus() == 'timeout' || data.getStatus() == 'reached') {
                throw new Error('Status of election is not pending');
            }

            if (data.getUntil() < Date.now() / 1000) {
                data.setStatus('timeout');
                data.setBalanced(false);
                app.dataManager.saveData(data);
                this.f_end(id, 'timeout', data);
                return;
            }

            let cnt = {};
            cnt['allnodes'] = this.getVotersList();
            cnt['allconnected'] = cnt['allnodes'].length;
            cnt['done'] = app.dataManager.getElectionPeers(id);
            cnt['answers'] = app.dataManager.getElectionVotes(id);
            cnt['answered'] = cnt['answers'].length;

            if (!app.dataManager.getElectionVoteByPeer(id, peer.getId())) {
                if (data.getAnswers().indexOf(answer) === -1)
                    throw new Error('Answer is not in list');

                let d = new app.DATA({
                    type: 'vote',
                    id: id,
                    pub: peer.getId(),
                    sign: sign,
                    answer: answer
                });

                app.dataManager.addData(d);

                if (!cnt['answered'])
                    cnt['answered'] = 0;
                cnt['answered']++;

                cnt['done'].push(peer.getId());
                cnt['answers'].push(answer)
            }

            let perсent = cnt['answered'] / cnt['allconnected'];
            this.debug('debug', "Election " + id + " percent " + (perсent * 100) + "%", cnt['answered'] + ' / ' + cnt['allconnected'])

            if (perсent >= this.majority && (!data['status'] || data['status'] == 'pending')) {
                data.setStatus('reached');
                let balanced_value = false;
                try {
                    balanced_value = this.balancing(id, data);
                } catch (e) {
                    this.debug('debug', e.message)
                }

                data.setBalanced(balanced_value);
                app.dataManager.saveData(data);
                this.f_end(id, 'reached', data);
            }
        }
        balancing(id, data) {
            let answers = app.dataManager.getElectionVotes(id);
            let arr = {};
            for (let i in answers) {
                if (!arr[answers[i].getAnswer()])
                    arr[answers[i].getAnswer()] = 0;
                arr[answers[i].getAnswer()]++;
            }

            let max = -1, maxvalue = '';
            for (let i in arr) {
                if (max < arr[i]) {
                    max = arr[i];
                    maxvalue = i;
                }
            }

            if (max < answers.length * Election.CONSENSUS)
                return false;

            return maxvalue;
        }
        getVotersList() {
            return [];
        }
        extendConfig(name) {

            let tree = [];
            let next = name;

            do {
                let parent = app.config[next];
                if (parent && tree.indexOf(next) === -1) {
                    tree.unshift(next);
                    let prevkey = next;
                    next = parent.extends;

                    if (next && (!app.config[next] || Object.keys(app.config[next]) < 1))
                        throw new Error("Extending " + prevkey + " with parent: " + next + " is failed, parent config section is not exist");

                } else
                    next = false;
            } while (next);

            let cnf = [];
            for (let i in tree) {
                cnf = Object.assign(cnf, app.config[tree[i]]);
            }

            cnf._extendsTree = tree;
            return cnf;
        }
        getConfig(field, defaultValue) {
            return field ? (this.config[field] ? this.config[field] : defaultValue) : this.config;
        }

    }

    Election.MAJORITY = .85;
    Election.CONSENSUS = .5;
    return Election;

}