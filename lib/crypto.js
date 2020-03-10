const EC = require('elliptic').ec;
const ec = new EC('secp256k1')
const cr = require('crypto');

module.exports = function (app) {

    class CryptoStatic {
        static createKeyPair() {
            var privateKey, publicKey;
            var cf = new crypto();
            if (status = cf.init()) {
                privateKey = cf.private.priv.toJSON();
                publicKey = cf.private.getPublic(true, 'hex');
            }

            return {
                status: status,
                public: publicKey,
                private: privateKey
            }
        }
        static getPublicByPrivate(priv) {
            var cf = new crypto(priv);
            return cf.private.getPublic(true, 'hex');
        }
        static sign(priv, messageBinary) {
            var cf = new crypto(priv),
                sig = cf.ecdsa().sign(messageBinary, new Buffer(priv, 'hex'))

            return new Buffer(sig.toDER())
        }
        static verify(publicKey, sign, messageBinary) {
            var key = ec.keyFromPublic(publicKey, 'hex')
            return key.verify(messageBinary, sign, 'hex')
        }
        static sha256(message, output) {
            if (!output)
                output = '';
            return cr.createHash('sha256').update(message).digest(output);
        }
        static createKeyPair () {
            let privateKey, publicKey, status;
            let cf = new crypto();
            if (status = cf.init()) {
                privateKey = cf.private.priv.toJSON();
                publicKey = cf.private.getPublic(true, 'hex');
            }
    
            return {
                status: status,
                public: publicKey,
                private: privateKey
            }
        }
    }

    return CryptoStatic;

}

let crypto = function (privk, public) {
    this.ec = new EC('secp256k1');
    if (privk)
        this.private = this.ec.keyFromPrivate(privk, 16);

    if (!public && this.private)
        this.public = this.private.getPublic(true, 'hex');
    else if (public && this.private)
        this.public = public;
}

crypto.prototype = {
    ec: null,
    init: function () {


        if (!this.private) {
            this.private = this.ec.genKeyPair();
            this.public = this.private.getPublic(true);
            return 1;
        }


    },
    ecdsa: function () {
        return this.ec;
    }

}