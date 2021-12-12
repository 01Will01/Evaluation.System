var cron = require('node-cron');
var moment = require('moment');
var shared = require('../../Shared/Constants.js');

var _shared = new shared();

module.exports = (application) => {

    //#region Métodos principais
    cron.schedule('*/5 * * * * *', async() => {

        let _markersRepository = new application.Infra.Data.Repositories.EvaluationMarkersDAO();

        let count = await _markersRepository.ValidadeSchemaTable();

        if (count > 0) {
            await Include(_markersRepository);
            await Activate(_markersRepository);
            await Disable(_markersRepository);
        }
    });

    //#endregion Métodos principais

    //#region  métodos auxiliares logicos

    var Disable = async function(_markersRepository) {
        let enumStatus = _shared.GetEnumStatus();
        let data = await _markersRepository.Get(enumStatus.enabled);

        data = (data.length >= 1) ? data[0] : undefined;

        if (data != undefined) {
            await DisableCurrentEvaluationMarker(data, _markersRepository)
        }
    }

    var Activate = async function(_markersRepository) {
        let enumStatus = _shared.GetEnumStatus();
        let data = await _markersRepository.Get(enumStatus.inWaiting);

        data = (data.length >= 1) ? data[0] : [];

        if (data != undefined || data.length > 0) {
            await ActivateNewEvaluationMarker(data, _markersRepository)
        }
    }

    var Include = async function(_markersRepository) {
        let enumStatus = _shared.GetEnumStatus();
        let data = await _markersRepository.Get(enumStatus.enabled);

        data = (data.length >= 1) ? data[0] : undefined;
        if (data != undefined) {
            await IncludeNewEvaluationMarker(data, _markersRepository);
        } else {
            let count = await _markersRepository.GetCount();
            if (count == 0)
                await FirstEvaluationMarker(_markersRepository)
        }
    }

    var FirstEvaluationMarker = async function(_markersRepository) {
        let _enumStatus = _shared.GetEnumStatus();

        let object = await GetObjectFirstEvaluationMarker();

        await _markersRepository.Include(object, _enumStatus.enabled);
    }

    var IncludeNewEvaluationMarker = async function(data, _markersRepository) {
        let _enumStatus = _shared.GetEnumStatus();

        let objectDescription = GetStatusAndDescription(data)

        if (objectDescription.status) {
            let analisy = await _markersRepository.ValidateByDescription(objectDescription.description)
            if (analisy.status == false && analisy.count == 0) {
                let object = await GetObjectFinal(objectDescription.description, data, _markersRepository);
                await _markersRepository.Include(object, _enumStatus.inWaiting)
            }
        }
    }

    var ActivateNewEvaluationMarker = async function(data, _markersRepository) {
        if (AnalyzeTimeToActivateOrDisable(data.initialDate)) {

            let enumStatus = _shared.GetEnumStatus();
            await _markersRepository.UpdateStatus(enumStatus.enabled, data.id)
        }
    }

    var DisableCurrentEvaluationMarker = async function(data, _markersRepository) {
        if (AnalyzeTimeToActivateOrDisable(data.endDate)) {

            let enumStatus = _shared.GetEnumStatus();
            await _markersRepository.UpdateStatus(enumStatus.disabled, data.id);
        }
    }

    var AnalyzeTimeToActivateOrDisable = function(date) {

        datenow = moment().locale('pt-br');

        let currentDates = _shared.GetMonthAndYearInIntegerValues(date);
        let nowDates = _shared.GetMonthAndYearInIntegerValues(datenow.format('L'));

        return (currentDates.dateDay <= nowDates.dateDay && currentDates.dateMonth <= nowDates.dateMonth && currentDates.dateYear <= nowDates.dateYear)

    }

    var GetStatusAndDescription = function(object) {

        let enumDates = _shared.GetEnumMonth();
        let enumPeriod = _shared.GetEnumPeriod();

        datenow = moment().locale('pt-br');

        limitDates = _shared.GetMonthAndYearInIntegerValues(object.limiteDate);
        nowDates = _shared.GetMonthAndYearInIntegerValues(datenow.format('L'));

        let data = {}

        if (limitDates.dateMonth <= nowDates.dateMonth) {

            let period =
                (object.period < limitDates.dateMonth && object.period == enumPeriod.semester) ? 1 :
                (object.period > limitDates.dateMonth && object.period == enumPeriod.semester) ? 2 :
                (enumDates.october <= limitDates.dateMonth && enumDates.december >= limitDates.dateMonth && object.period == enumPeriod.quarter) ? 1 :
                (enumDates.january <= limitDates.dateMonth && enumDates.march >= limitDates.dateMonth && object.period == enumPeriod.quarter) ? 2 :
                (enumDates.april <= limitDates.dateMonth && enumDates.june >= limitDates.dateMonth && object.period == enumPeriod.quarter) ? 3 :
                (enumDates.july <= limitDates.dateMonth && enumDates.september >= limitDates.dateMonth && object.period == enumPeriod.quarter) ? 4 : 0;

            let year = (period != 1) ? nowDates.dateYear : nowDates.dateYear + 1;

            let descriptionMarker = `${period}º periodo de ${year}`;

            data.description = descriptionMarker;
            data.status = true;
            return data;
        }

        data.status = false;
        return data;
    }

    var GetObjectFinal = async function(description, data, _markersRepository) {
        let object = {};
        let currentYear = false;
        let dates = _shared.GetPeriodDates(description, data, currentYear);

        object.description = description;
        object.period = data.period;
        object.initialDate = dates.initialDate;
        object.limiteDate = dates.limiteDate;
        object.endDate = dates.endDate;

        return object;
    }

    var GetObjectFirstEvaluationMarker = async function() {
            datenow = moment().locale('pt-br');

            let nowDates = _shared.GetMonthAndYearInIntegerValues(datenow.format('L'));
            let _enumPeriod = _shared.GetEnumPeriod();

            let midleCalendar = 6;
            let currentYear = true;

            let referenceDate = { endDate: datenow.format('L'), period: _enumPeriod.semester }

            let period = (midleCalendar > nowDates.dateMonth) ? 1 : 2;

            let description = `${period}º periodo de ${nowDates.dateYear}`;

            let dates = _shared.GetPeriodDates(description, referenceDate, currentYear)

            let object = {};

            object.description = description;
            object.period = _enumPeriod.semester;
            object.initialDate = dates.initialDate;
            object.limiteDate = dates.limiteDate;
            object.endDate = dates.endDate;

            return object;
        }
        //#endregion métodos auxiliares logicos
}