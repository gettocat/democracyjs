//with democracyjs you can change consensus settings
const AppClass = require("../index");

let app = new AppClass({
    "simple": {
        "node": 1,
        "key2": 3
    },
    "node": {
        "publicKey": "048fe216b4083f715d599d04412cd6f92813dee740c525db53cb06b93e5a1c90c2174e6d0945251aae2c38b4032f04a4c3ef3b43cf1289201dd3b8006b33a87027",
        "privateKey": "3e8708229df3813c561ec7357c681007cd768d44904e5319f1a1786426b21648"
    }
});

app.on("debug", (data) => {
    console.log("[" + new Date().toLocaleTimeString() + "]", "< " + data.level + " >", data.module, data.text);
});

app.defineElectionClass(((app) => {
    class SimpleElection extends app.ELECTION {
        constructor() {
            super("simple")
        }
        getVotersList() {
            return [
                '031678cb93e9c4538da23baae03626c43bdd34f0c4c731794a92d63cbbf1c7a818',
                '02cee7fe68e694dd453ae342354b53c066d2d347810875f299a980abea05bf8b9d',
                '037114b3a7a1c75102cea5c6a943539c1481a9f04047303ace152f686ce7a0e516',
                '0256675b4b668cdf68e70ffaad56162bf39e36ca92c712f8b07946840588319239'
            ]
        }
    }

    return SimpleElection;
})(app));


app.start('default');


let peer1 = new app.PEER({ id: '031678cb93e9c4538da23baae03626c43bdd34f0c4c731794a92d63cbbf1c7a818', private: '32faee3ef9c01e8e7b34d4a79efddb9f0bb24b2e9c6be4ea060241a803994b55' });
let peer2 = new app.PEER({ id: '02cee7fe68e694dd453ae342354b53c066d2d347810875f299a980abea05bf8b9d', private: '3a9eaadbd92180ab6537955d14fe28ef14c14930575a9c33c25568e5cf980bfe' });
let peer3 = new app.PEER({ id: '037114b3a7a1c75102cea5c6a943539c1481a9f04047303ace152f686ce7a0e516', private: 'd12570e2a1bee6724d39f0a384dab028950d3202203ff3ea319fa141879b8f5f' });
let peer4 = new app.PEER({ id: '0256675b4b668cdf68e70ffaad56162bf39e36ca92c712f8b07946840588319239', private: 'b664e2c534b3fbfddcbab5fe2cb49dbf5adf1856a529e449d3288f8b5ceaf286' });
app.peerManager.addPeers([peer1, peer2, peer3, peer4]);

let d = app.election.create('key2 change settings', [3, 2, 1, 5, null], Date.now() / 1000 + 5 * 60 * 60, 'updateSettings');

console.log('electionId: ', d.getId());

app.election.setOnEnd((electionId, status, data) => {
    console.log('election end ', electionId, 'status: ', status, 'balanced: ', data.getBalanced())
    if (data.getMethod() == 'updateSettings') {
        if (!data.getBalanced()) {
            console.log('settings not changed');
            return;
        }

        console.log('updateSettings(' + data.getBalanced() + ')');
    }
})

app.election.voteProcess(peer1, peer1.signVote({ answer: 1, id: d.getId() }));
app.election.voteProcess(peer2, peer2.signVote({ answer: 5, id: d.getId() }));
app.election.voteProcess(peer3, peer3.signVote({ answer: 1, id: d.getId() }));
app.election.voteProcess(peer4, peer4.signVote({ answer: null, id: d.getId() }));


