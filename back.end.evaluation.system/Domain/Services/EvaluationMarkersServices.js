require('express-async-errors');
var shared = require('../../Shared/Constants.js');
var moment = require('moment');
var _shared = new shared();

function EvaluationMarkersServices() {}

//#region  métodos principais DAO
EvaluationMarkersServices.prototype.Update = async(req, res, _markersRepository) => {
    let _enumStatus = _shared.GetEnumStatus();

    if (req.body.statusCode == _enumStatus.enabled) {

        if (req.body.isChangePeriod) {

            let dataInWaiting = await _markersRepository.Get(_enumStatus.inWaiting);
            dataInWaiting = (dataInWaiting.length >= 1) ? dataInWaiting[0] : undefined;

            if (dataInWaiting != undefined) {
                UpdateStatus(_enumStatus.disabled, dataInWaiting.id, _markersRepository)
            }

            let isCurrentMarker = true;

            let object = GetObjectFinal(req.body.id, req.body.period, undefined, isCurrentMarker)

            _markersRepository.UpdateDates(object);

        } else
            await _markersRepository.Update(req.body);

        res.json(_shared.NotificationTemplate(true, [], `Dados cadastrados com sucesso!`));
    }

    if (req.body.statusCode == _enumStatus.inWaiting) {

        if (req.body.isChangePeriod) {
            let dataEnabled = await _markersRepository.Get(_enumStatus.enabled);
            dataEnabled = (dataEnabled.length >= 1) ? dataEnabled[0] : undefined;

            if (dataEnabled != undefined) {

                let isCurrentMarker = false;

                let object = GetObjectFinal(req.body.id, req.body.period, dataEnabled.endDate, isCurrentMarker)

                _markersRepository.UpdateDates(object);

            } else
                res.json(_shared.NotificationTemplate(false, [], `Para alterar o "Próximo marcador" é preciso existir o "marcador atual"!`));


        } else
            _markersRepository.Update(req.body);

        res.json(_shared.NotificationTemplate(true, [], `Dados cadastrados com sucesso!`));
    }
};

EvaluationMarkersServices.prototype.Get = async(res, _markersRepository) => {
    let _enumStatus = _shared.GetEnumStatus();

    let dataInWaiting = await _markersRepository.Get(_enumStatus.inWaiting);
    let dataEnabled = await _markersRepository.Get(_enumStatus.enabled);

    if (dataInWaiting.length > 0)
        dataEnabled.push(dataInWaiting[0]);

    res.json(
        _shared.NotificationTemplate(
            true,
            dataEnabled,
            "Lista de marcadores avaliativos cadastrados!"
        )
    );
};

//#region métodos de acesso ao banco auxiliares

var UpdateStatus = async function(status, id, _markersRepository) {
    await _markersRepository.UpdateStatus(status, id);
};

//#endregion métodos de acesso ao banco auxiliares


//#region métodos logicos

var GetObjectFinal = function(id, period, endDate, currentMarker) {
    let newMarkerDate = (currentMarker) ? GetCurrentMarkerDate() : GetNewMarkerDate(endDate);

    let description = GetDescription({ period: period, dateNewMarker: newMarkerDate.date });

    let dates = _shared.
    GetPeriodDates(
        description, {
            period: period,
            endDate: newMarkerDate.date
        },
        currentMarker);

    let object = {};

    object.id = id;
    object.description = description;
    object.period = period;
    object.initialDate = dates.initialDate;
    object.limiteDate = dates.limiteDate;
    object.endDate = dates.endDate;
    return object;
}

var GetNewMarkerDate = function(date) {
    let Dates = _shared.GetMonthAndYearInIntegerValues(date);
    let _enumMonths = _shared.GetEnumMonth();

    let object = {};

    object.dateDay = 1;
    object.dateMonth = (Dates.dateMonth == _enumMonths.december) ? _enumMonths.january : Dates.dateMonth + 1;
    object.dateYear = (Dates.dateMonth == _enumMonths.decdecember) ? Dates.dateYear + 1 : Dates.dateYear;

    object.date = _shared.GetDateFormtPatter(object.dateDay, object.dateMonth, object.dateYear);

    return object;
}

var GetCurrentMarkerDate = function() {
    datenow = moment().locale('pt-br');

    let object = {};

    object.date = datenow.format('L');

    return object;
}

var GetDescription = function(object) {

        let enumDates = _shared.GetEnumMonth();
        let enumPeriod = _shared.GetEnumPeriod();

        datenow = moment().locale('pt-br');

        newMarkerDates = _shared.GetMonthAndYearInIntegerValues(object.dateNewMarker);
        nowDates = _shared.GetMonthAndYearInIntegerValues(datenow.format('L'));

        let period =
            (object.period > newMarkerDates.dateMonth && object.period == enumPeriod.semester) ? 1 :
            (object.period < newMarkerDates.dateMonth && object.period == enumPeriod.semester) ? 2 :
            (enumDates.january <= newMarkerDates.dateMonth && enumDates.march >= newMarkerDates.dateMonth && object.period == enumPeriod.quarter) ? 1 :
            (enumDates.april <= newMarkerDates.dateMonth && enumDates.june >= newMarkerDates.dateMonth && object.period == enumPeriod.quarter) ? 2 :
            (enumDates.july <= newMarkerDates.dateMonth && enumDates.september >= newMarkerDates.dateMonth && object.period == enumPeriod.quarter) ? 3 :
            (enumDates.october <= newMarkerDates.dateMonth && enumDates.december >= newMarkerDates.dateMonth && object.period == enumPeriod.quarter) ? 4 : 0;

        let year = (period != 1) ? nowDates.dateYear : nowDates.dateYear + 1;

        let descriptionMarker = `${period}º periodo de ${year}`;

        return descriptionMarker;
    }
    //#endregion métodos logicos

module.exports = () => {
    return EvaluationMarkersServices;
};