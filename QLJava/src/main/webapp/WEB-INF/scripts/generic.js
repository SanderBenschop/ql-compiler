ql = {};
ql.variableMap = {};
ql.questionControllerList = [];

ql.messageBus = Base.extend({
    initialize:function () {
        this.variableListeners = {};
    },

    subscribeToVariable:function (variable, listener) {
        if (!this.variableListeners[variable]) {
            this.variableListeners[variable] = [];
        }
        this.variableListeners[variable].push(listener);
    },

    signalVariableChanged:function (variable) {
        if (this.variableListeners[variable]) {
            jQuery.each(this.variableListeners[variable], function (index, value) {
                value.triggerEvaluation();
            });
        }
    }
}).new();

ql.ajaxUtil = {
    doPost:function (urlPostfix, data, successCallback) {
        $.ajax({
            type:"POST",
            url:$(location).attr('href') + urlPostfix,
            data:JSON.stringify(data),
            success:successCallback,
            error:function (jqXHR) {
                alert(jqXHR.responseText);
            },
            contentType:'application/json'
        });
    }
}

ql.QuestionController = Base.extend({
    initialize:function (questionName) {
        this.questionName = questionName;
        this.view = $("#" + this.questionName);
    },

    getName:function () {
        return this.questionName;
    },

    bind:function () {
        var that = this;
        this.view.on("change", function () {
            that.validateInput(function () {
                var value = that.getParsedValue();
                ql.variableMap[that.questionName] = value;
                ql.messageBus.signalVariableChanged(that.questionName);
            });
        });
    },

    validateInput:function (successCallback) {
        var urlPostfix = "validate/" + this.getValidationSuffix() + "/", data = {identifierName:this.questionName, value:this.getValue()};
        ql.ajaxUtil.doPost(urlPostfix, data, successCallback);
    }
});

ql.IntegerTypeQuestionController = ql.QuestionController.extend({
    getParsedValue:function () {
        return parseInt(this.getValue());
    },

    getValidationSuffix:function () {
        return "integer";
    },

    getValue:function () {
        return this.view.val();
    }
});

ql.BooleanTypeQuestionController = ql.QuestionController.extend({
    getParsedValue:function () {
        return this.getValue();
    },

    getValidationSuffix:function () {
        return "boolean";
    },

    getValue:function () {
        return this.view.is(":checked");
    }
});

ql.StringTypeQuestionController = ql.QuestionController.extend({
    getParsedValue:function () {
        return this.getValue();
    },

    getValidationSuffix:function () {
        return "string";
    },

    getValue:function () {
        return this.view.val();
    }
});

ql.ComputationController = Base.extend({
    initialize:function (computationName) {
        this.computationName = computationName;
        this.view = $("#" + this.computationName);
    },

    triggerEvaluation:function () {
        var expressionOutcome = this.evaluateExpression();
        this.view.val(expressionOutcome);
        if (expressionOutcome !== "") {
            ql.variableMap[this.computationName] = expressionOutcome;
            ql.messageBus.signalVariableChanged(this.computationName);
        }
    }
});

ql.ConditionalController = Base.extend({
    initialize:function (conditionalName) {
        this.conditionalName = conditionalName;
        this.view = $("#" + this.conditionalName);
    },

    triggerEvaluation:function () {
        var booleanOutcome = this.evaluateExpression();
        this.toggle(booleanOutcome);
    },

    toggle:function (booleanValue) {
        if (booleanValue) {
            this.onConditionalTrue();
        } else {
            this.onConditionalFalse();
        }
    },

    resetElementBlock:function (elementBlock) {
        elementBlock.find("input:text").val("");
        elementBlock.find("input:checkbox").removeAttr('checked');
    }
});

ql.IfStatementController = ql.ConditionalController.extend({
    initialize:function (conditionalName) {
        ql.ConditionalController.initialize.call(this, conditionalName);
        this.successBody = this.view.find(".successBody");
    },

    onConditionalTrue:function () {
        this.successBody.removeClass("hidden");
    },

    onConditionalFalse:function () {
        this.successBody.addClass("hidden");
        this.resetElementBlock(this.successBody);
    }
});

ql.IfElseStatementController = ql.ConditionalController.extend({
    initialize:function (conditionalName) {
        ql.ConditionalController.initialize.call(this, conditionalName);
        this.successBody = this.view.find(".successBody"), this.failureBody = this.view.find(".failureBody");
    },

    onConditionalTrue:function () {
        this.successBody.removeClass("hidden");
        this.failureBody.addClass("hidden");
        this.resetElementBlock(this.failureBody);
    },

    onConditionalFalse:function () {
        this.successBody.addClass("hidden");
        this.failureBody.removeClass("hidden");
        this.resetElementBlock(this.successBody);
    }
});