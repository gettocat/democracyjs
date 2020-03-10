# democracyjs
Democracy election for decentralized systems. 

## App
This application implements consensus algorithm work. You can reimplement classess, objects, methods for your application.

Have four modules, based on app.MODULE:

- Peer
- Data
- PeerManager
- DataManager
- Election

### Peer
Define connected node entry

```js
class Peer extends app.MODULE {
    constructor(data);//create new peer
    getId(); //get peer id
    signVote(vote); //vote = { id, answer }
}
```

### PeerManager
Define Mapper of Peer entries. Storing, sorting, searching, etc...

```js
class PeerMapper extends app.MODULE {
    getPeersList();//get list of all peers
    addPeer(peer);//add peer to list
    addPeers(peer_list);//add peers to list
    removePeerById(peerId);//remove peer by id
    removePeer(peer);//remove Peer
}
```

### Data
Define election data message (election/vote)

```js
class Data extends app.MODULE {
    constructor(data);//create new Data
    static getTypeFieldName()//type  field name, default "type"
    static getIdFieldName()//id  field name, default "id"
    static getPublicKeyFieldName()//publicKey  field name, default "pub"
    static getSignFieldName()//signature  field name, default "sig"
    static getAnswerFieldName()//answer  field name, default "answer"
    static getMethodFieldName()//method  field name, default "method"
    static getAnswersFieldName() //answers  field name, default "answes"
    static getStatusFieldName()//status field name, default "status"
    static getUntilFieldName() //until field name, default "until"
    static getBalancedFieldName()//balanced field name, default "balanced"
    getType()//type can be vote or election
    getId()//id of election
    getPublicKey()//public key of peer who create this data
    getSign()//EC signature
    getAnswer()//answer, only for type = vote
    getMethod()//method for callback, only for type = electin
    getAnswers()//answers list for election, only for type = election
    getStatus()//status can be pending, timeout, reached, only for type = election
    getUntil()//time when data will be timedout, only for type = election
    getBalanced()//balanced value, see method Election::balancing(), only for type = election and status = reached 
    isValid()//is valid data (signature and syntax)
    setStatus(newStatus)//set new status, only for type = election
    setBalanced(balanced)//set balanced value, only for type = election
}
```
### DataMapper
Define Mapper of Data entries. Storing, sorting, searching, etc...

```js
class DataMapper extends app.MODULE {

    getDataList();//get all data
    _addDataToList(data);//add data to list
    addData(data);//add data to list with verify (recive from network)
    getData(id);//get data by id
    removeData(data);//remove data 
    getElectionVoteByPeer(election_id, peer_id);//get peer vote in election
    getElectionPeers(election_id);//get publickeys of voted peers
    getElectionVotes(election_id);//get votes in election
    saveData(data);//save data with new parameters
}
```

### Election
Describe election algorithm. 

```js
class Election extends app.MODULE {

    constructor(election_config_field);//election_config_field - config section, with params for this election algorithm. See more: config sections 
    getConfig(field, defaultValue);//get config section param (or all if first param is null);
    init()//init
    setKeystore(ks);//set keystore {publicKey: 'hex', privateKey: 'hex'}
    setOnEnd(cb);//set callback on finish election (timeout, reached)
    vote(electionId, answer);//vote for electionId with answer for current keystore
    isValidTime(time);//check time for valid
    create(request, answers, until, method);//create new election with request (text), answers - array, until - time in future, when election will timeout
     voteProcess(peer, voteData);//use this method when get message from another peer with vote data. voteData = {id, answer, sign}
     balancing(id, data);//use this method for choose value when election is reached
     getVotersList();//must be extended for valid peer list, who can voting
}
```

## App.Extending

Any class in application can be redefined before start, for example we have app methods:

```js
definePeerClass(man);
definePeerManagerClass(man);
setPeerManager(man);
defineDataClass(man);
defineDataManagerClass(man);
setDataManager(man);
defineElectionClass(man);
```

To redefine class you need create you own class and extends one from default modules:

- app.PEER
- app.DATA
- app.PEERMANAGER
- app.DATAMANAGER
- app.ELECTION

For example we can create new election algorithm with another balancing algorithm and peer list:

```js
module.exports = function(app) {
    class NewElection extends app.ELECTION {
        constructor(){
            super('election_field')
        }
        getVotersList() {
            return [
                '0x0',
                '0x1',
                '0x2',
                '0x3',
                '0x4',
                '0x5',
            ];
        }   
        balancing(id, data){//use average of all values 
            let answers = app.dataManager.getElectionVotes(id);
            let avg = 0;
            for (let i in answers){
                avg += answers[i].getAnswer();
            }

            return avg/answers.length
        }
    }

    return NewElection
}
```

Put this code to file newcons.js, and require it:

```js

const newelect = require('newelect.js');
const DemocracyJs = require("democracyjs");
let config = {
    "election_field":{
        "majority": 0.5
    }
    "node":{ //required section
        ///...
    }
};
let app = new DemocracyJs(config);
app.defineElectionClass(newelect(app));
//now you can start app with new election
app.start();
```


## Config sections

You can create many config sections:
```js
"section1": {
    "param1": "value1",
    "param2": "value2"
    //etc
}
```

and use it in application: `app.config.section1.param1`
Any eection have default config section, defined in second param of constructor, for example:
```js
constructor(){
    super('newconsensus_config_field')
}
```

in this example we must have section `newconsensus_config_field` in config!

### node
Node section is required for application. Its describe keys of current peerm this keys will be used for signing messages
```js
"node": {
    "publicKey": '0x...<hex>',
    "privateKey": '0x...<hex>'
},
```

### extending sections

Config sections can be extending by existing sections:
```js
"section1": {
    "param1":'value1',
    "param2":'value2',
},
"section2":{
    "extends":"section1",
    "param3":"value3"
}
```

In this example section2 have next params: 
```js
"param1":'value1',
"param2":'value2',
"param3":"value3"
```

Extending can be nested:

```js
"section1": {
    "param1":'value1',
    "param2":'value2',
},
"section2":{
    "extends":"section1",
    "param3":"value3"
},
"section3": {
    "extends": "section2",
    "params5": 1,
}
```

it will be: 

```js
"param1":'value1',
"param2":'value2',
"param3":"value3",
"params5": 1,
```

Extending config sections is used for default election algorithms, see below.

### default config parameters:

Config default parameters, that can be extend and rewrite defined in `app.getDefaultConfig()`:
```js
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
```
