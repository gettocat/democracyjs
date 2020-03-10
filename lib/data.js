module.exports = function (app) {

    class Data extends app.MODULE {

        constructor(data) {
            super();
            this.data = data;
        }

        static getTypeFieldName() {
            return 'type';
        }

        static getIdFieldName() {
            return 'id';
        }

        static getPublicKeyFieldName() {
            return 'pub';
        }

        static getSignFieldName() {
            return 'sig';
        }

        static getAnswerFieldName() {
            return 'answer';
        }

        static getMethodFieldName() {
            return 'method';
        }

        static getAnswersFieldName() {
            return 'answers';
        }

        static getStatusFieldName() {
            return 'status';
        }

        static getUntilFieldName() {
            return 'until';
        }

        static getBalancedFieldName() {
            return 'balanced';
        }

        getType() {
            return this.data[app.DATA.getTypeFieldName()];
        }
        getId() {
            return this.data[app.DATA.getIdFieldName()];
        }
        getPublicKey() {
            return this.data[app.DATA.getPublicKeyFieldName()];
        }
        getSign() {
            return this.data[app.DATA.getSignFieldName()];
        }
        getAnswer() {
            return this.data[app.DATA.getAnswerFieldName()];
        }
        getMethod() {
            return this.data[app.DATA.getMethodFieldName()];
        }
        getAnswers() {
            return this.data[app.DATA.getAnswersFieldName()];
        }
        getStatus() {
            return this.data[app.DATA.getStatusFieldName()];
        }
        getUntil() {
            return this.data[app.DATA.getUntilFieldName()];
        }
        getBalanced() {
            return this.data[app.DATA.getBalancedFieldName()];
        }
        isValid() {
            if (this.getId())
                return true;

            return false;
        }
        setStatus(newStatus) {
            this.data[app.DATA.getStatusFieldName()] = newStatus;
        }
        setBalanced(balanced) {
            this.data[app.DATA.getBalancedFieldName()] = balanced;
        }

    }

    return Data;

}