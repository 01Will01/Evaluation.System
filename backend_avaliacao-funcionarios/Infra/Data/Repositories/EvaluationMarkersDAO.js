const dbConn = require("../../../Shared/DbConnectionMySQL");
const uuid = require("uuid");

function EvaluationMarkersDAO() {}

EvaluationMarkersDAO.prototype.Include = async function(element) {
    let eMarker = element;
    eMarker.id = uuid.v1();

    let conn = new dbConn(true);

    query = `INSERT INTO TB_MARCADORES_AVALIATIVOS   
    (
        ID_MARCADOR,
        DS_MARCADOR,
        PERIODO,
        DT_INICIO,
        DT_FIM,
        DT_LIMITE,
        DT_CADASTRO,
        DT_ALTERACAO,
        ID_STATUS
    )
    VALUES 
    (
        '${eMarker.id}',
        '${eMarker.description}',
        ${eMarker.period},
        '${eMarker.initialDate}',
        '${eMarker.endDate}',
        '${eMarker.limiteDate}',
        curdate(),
        curdate(),
        5
    );`;

    conn.query(query).then(() => {});
};

EvaluationMarkersDAO.prototype.Get = async(statusId) => {
    let conn = new dbConn(true);
    let query = `SELECT 
                ID_MARCADOR AS id,
                DS_MARCADOR AS  description,
                PERIODO AS period,
                DATE_FORMAT(DT_INICIO,'%d/%m/%Y') AS initialDate,
                DATE_FORMAT(DT_FIM,'%d/%m/%Y') AS endDate,
                DATE_FORMAT(DT_LIMITE,'%d/%m/%Y') AS limiteDate,
                DATE_FORMAT(DT_CADASTRO,'%d/%m/%Y') AS registerDate,
                DATE_FORMAT(DT_ALTERACAO,'%d/%m/%Y') AS changeDate,
                ID_STATUS AS statusCode
                FROM TB_MARCADORES_AVALIATIVOS
                WHERE ID_STATUS = ${statusId}`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};

EvaluationMarkersDAO.prototype.ValidateByDescription = async(description) => {
    let conn = new dbConn(true);
    let query = `  SELECT ID_STATUS AS status FROM TB_MARCADORES_AVALIATIVOS  WHERE ds_marcador = '${description}'`;
    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return AnalyzeResult(data);
};

EvaluationMarkersDAO.prototype.UpdateStatus = async(status, id) => {
    let conn = new dbConn(true);
    let query = `UPDATE TB_MARCADORES_AVALIATIVOS
                 SET ID_STATUS = ${status} 
                 WHERE ID_MARCADOR = '${id}'`;
    conn.query(query).then(() => {});
};

//#region Metodos Auxiliares
var AnalyzeResult = function(array) {
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

//#endregion

module.exports = () => {
    return EvaluationMarkersDAO;
};