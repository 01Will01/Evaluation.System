/* Application/Controllers/EvaluationController.js */

var shared = require('../../Shared/Constants.js');

var _shared = new shared();

module.exports = (application) => {
    application.post("/avaliacao", (req, res) => {
        let _evaluationServices = new application.Domain.Services.EvaluationService();
        let _repositories = application.Infra.Data.Repositories;
        try {
            _evaluationServices.RegisterOrChange(req, res, _repositories);
        } catch (err) {
            res = _shared.NotificationTemplate(
                false, [],
                `Ocorreu uma exceção no processo de cadastro. error: ${err.message}`
            );
        }
    });

    application.get("/questoes-avalicao/:evaluatorId", (req, res) => {
        let _evaluationServices = new application.Domain.Services.EvaluationService();
        let _repositories = application.Infra.Data.Repositories;
        try {
            _evaluationServices.GetQuestions(req, res, _repositories);
        } catch (err) {
            res = _shared.NotificationTemplate(
                false, [],
                `Ocorreu uma exceção no processo de cadastro. error: ${err.message}`
            );
        }
    });

    application.get("/avaliacao/relatorio/:evaluatorId", (req, res) => {
        let _evaluationServices = new application.Domain.Services.EvaluationService();
        let _repositories = application.Infra.Data.Repositories;
        try {
            _evaluationServices.GetEvaluationCompleted(req, res, _repositories);
        } catch (err) {
            res = _shared.NotificationTemplate(
                false, [],
                `Ocorreu uma exceção no processo de cadastro. error: ${err.message}`
            );
        }
    });

    application.get("/escalas", (req, res) => {
        let _evaluationServices = new application.Domain.Services.EvaluationService();
        let _repositories = application.Infra.Data.Repositories;
        try {
            _evaluationServices.GetScales(req, res, _repositories);
        } catch (err) {
            res = _shared.NotificationTemplate(
                false, [],
                `Ocorreu uma exceção no processo de cadastro. error: ${err.message}`
            );
        }
    });

    application.put("/escalas", (req, res) => {
        let _evaluationServices = new application.Domain.Services.EvaluationService();
        let _repositories = application.Infra.Data.Repositories;
        try {
            _evaluationServices.UpdateScales(req, res, _repositories);
        } catch (err) {
            res = _shared.NotificationTemplate(
                false, [],
                `Ocorreu uma exceção no processo de cadastro. error: ${err.message}`
            );
        }
    });
};