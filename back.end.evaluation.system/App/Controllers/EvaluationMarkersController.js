/* Application/Controllers/evaluationMarkerController.js */
require('express-async-errors');
var shared = require('../../Shared/Constants.js');

var _shared = new shared();

module.exports = (application) => {
    application.put("/marcador/modificacao", async(req, res) => {
        let _EvaluationMarkersServices =
            new application.Domain.Services.EvaluationMarkersServices(application);
        let _markerRepository =
            new application.Infra.Data.Repositories.EvaluationMarkersDAO();
        try {
            await _EvaluationMarkersServices.Update(req, res, _markerRepository);
        } catch (err) {
            res = _shared.NotificationTemplate(
                false, [],
                `Ocorreu uma exceção no processo de cadastro. error: ${err.message}`
            );
        }
    });

    application.get("/marcador", (req, res) => {
        let _EvaluationMarkersServices =
            new application.Domain.Services.EvaluationMarkersServices(application);
        let _markerRepository =
            new application.Infra.Data.Repositories.EvaluationMarkersDAO();
        try {
            _EvaluationMarkersServices.Get(res, _markerRepository);
        } catch (err) {
            res = _shared.NotificationTemplate(
                false, [],
                `Ocorreu uma exceção no processo consulta. error: ${err.message}`
            );
        }
    });
};