var moment = require('moment');

class Constants {
    constructor() {}

    GetEnumMonth() {
        let object = {};

        object.january = 1;
        object.february = 2;
        object.march = 3;
        object.april = 4;
        object.may = 5;
        object.june = 6;
        object.july = 7;
        object.august = 8;
        object.september = 9;
        object.october = 10;
        object.november = 11;
        object.december = 12;

        return object;
    }

    GetEnumPeriod() {
        let object = {};

        object.semester = 6;
        object.quarter = 3;

        return object;
    }

    GetEnumStatus() {
        let object = {};

        object.enabled = 1;
        object.disabled = 2;
        object.rated = 3;
        object.pending = 4;
        object.inWaiting = 5;

        return object;
    }

    NotificationTemplate(_status, _data, _message) {
        return {
            success: _status,
            data: _data,
            msg: [{ text: _message }],
        };
    }

    AnalyzeResult(array) {
        /* 
          verifica o resultado em quantidade e status.
          qt:0  - id_status:indefinido -> false -> inexistente
          qt:1  - id_status:2          -> false -> inativo
          qt:1  - id_status:1          -> true  -> ativo
          qt:>1 - id_status:1ou2       -> false -> multiplos
          */
        let index = array[0] == undefined ? 0 : array.length;

        if (index == 0) return { status: false, count: index };

        return {
            status: index == 1 && array[index - 1].status == 1 ? true : false,
            count: index,
        };
    };

    AnalyzeResultEvaluation(array) {
        /* 
          verifica o resultado em quantidade e status.
          qt:0  - id_status:indefinido -> false -> inexistente
          qt:1  - id_status:2          -> false -> inativo
          qt:1  - id_status:4          -> false  -> pendente
          qt:1  - id_status:3          -> true  -> avaliado
          qt:>1 - id_status:1ou2       -> false -> multiplos
          */
        let index = array[0] == undefined ? 0 : array.length;

        if (index == 0) return { status: false, count: index };

        return {
            status: index == 1 && array[index - 1].status == 3 ? true : false,
            count: index,
            statusCode: array[index - 1].status
        };
    };

    GetMonthAndYearInIntegerValues = function(date) {
        let limitDateFormatted = moment(date, "DDMMYYYY");
        let data = {}

        data.dateDay = new Date(limitDateFormatted.format('L')).getDate();
        data.dateMonth = new Date(limitDateFormatted.format('L')).getMonth() + 1;
        data.dateYear = new Date(limitDateFormatted.format('L')).getFullYear();

        return data;
    }

    GetDateFormtPatter = function(day, month, year) {
        let newMonth = (month < 10) ? `0${month}` : month;

        return `${day}/${newMonth}/${year}`;
    }

    GetDateFormtPatterMysql = function(day, month, year) {
        let newMonth = (month < 10) ? `0${month}` : month;

        return `${year}-${newMonth}-${day}`;
    }

    GetMonthWithLastDay = function(month, year) {
        let _shared = new Constants();
        let newEndDate = moment(_shared.GetDateFormtPatter('01', month, year), "DDMMYYYY");

        newEndDate.locale('pt-br');
        newEndDate.subtract(1, 'days').format('L')

        let newEndDates = _shared.GetMonthAndYearInIntegerValues(newEndDate.subtract(1, 'days').format('L'))
        let newDay = (newEndDates.dateDay < 10) ? `0${newEndDates.dateDay}` : newEndDates.dateDay;

        return _shared.GetDateFormtPatterMysql(newDay, month, year);
    }

    GetPeriodDates = function(description, data, currentYear) {
        let _shared = new Constants();

        let enumPeriod = _shared.GetEnumPeriod();
        let enumDates = _shared.GetEnumMonth();

        let object = {}

        let period = description.substring(0, 1);

        let endDates = _shared.GetMonthAndYearInIntegerValues(data.endDate)
        let year = (period == '1' && currentYear == false) ? endDates.dateYear + 1 : endDates.dateYear;

        if (data.period == enumPeriod.semester) {
            // para semestre no primeiro periodo
            if (period == '1') {
                object.initialDate = _shared.GetDateFormtPatterMysql('01', enumDates.january, year);
                object.limiteDate = _shared.GetDateFormtPatterMysql('15', enumDates.may, year);
                object.endDate = _shared.GetMonthWithLastDay(enumDates.june, year);
            }
            // para semestre no segundo periodo
            else if (period == '2') {
                object.initialDate = _shared.GetDateFormtPatterMysql('01', enumDates.july, year);
                object.limiteDate = _shared.GetDateFormtPatterMysql('15', enumDates.november, year);
                object.endDate = _shared.GetMonthWithLastDay(enumDates.december, year);
            }

        } else if (data.period == enumPeriod.quarter) {

            // para trimestre no primeiro periodo 
            if (period == '1') {
                object.initialDate = _shared.GetDateFormtPatterMysql('01', enumDates.january, year);
                object.limiteDate = _shared.GetDateFormtPatterMysql('15', enumDates.february, year);
                object.endDate = _shared.GetMonthWithLastDay(enumDates.march, year);
            }
            // para trimestre no segundo periodo 
            else if (period == '2') {
                object.initialDate = _shared.GetDateFormtPatterMysql('01', enumDates.april, year);
                object.limiteDate = _shared.GetDateFormtPatterMysql('15', enumDates.may, year);
                object.endDate = _shared.GetMonthWithLastDay(enumDates.june, year);
            }
            // para trimestre no terceiro periodo 
            else if (period == '3') {
                object.initialDate = _shared.GetDateFormtPatterMysql('01', enumDates.july, year);
                object.limiteDate = _shared.GetDateFormtPatterMysql('15', enumDates.august, year);
                object.endDate = _shared.GetMonthWithLastDay(enumDates.september, year);
            }
            // para trimestre no quarto periodo 
            else if (period == '4') {
                object.initialDate = _shared.GetDateFormtPatterMysql('01', enumDates.october, year);
                object.limiteDate = _shared.GetDateFormtPatterMysql('15', enumDates.november, year);
                object.endDate = _shared.GetMonthWithLastDay(enumDates.december, year);
            }
        }
        return object;
    }
}

module.exports = Constants;