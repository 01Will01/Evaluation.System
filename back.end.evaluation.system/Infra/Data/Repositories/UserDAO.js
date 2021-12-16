const dbConn = require("../../../Shared/DbConnectionMySQL");
const uuid = require("uuid");
var shared = require('../../../Shared/Constants.js');

var _shared = new shared();

function UserDAO() {}

UserDAO.prototype.Include = async function(req) {
    let user = req.body;
    user.id = uuid.v1();

    let conn = new dbConn(true);

    query = `INSERT INTO tb_usuarios  
                    (
                      id_usuario,
                      nome,
                      email,
                      senha,
                      id_avaliador,
                      id_cargo,
                      id_area,
                      dt_cadastro,
                      dt_alteracao,
                      id_status
                    )
                    VALUES 
                    (
                        '${user.id}',
                        '${user.name}',
                        '${user.email}',
                        '${user.password}',
                        '${user.evaluatorId}',
                        '${user.responsibilityId}',
                        '${user.areaId}',
                        curdate(),
                        curdate(),
                        1
                    );`;

    conn.query(query).then(() => {});
};

UserDAO.prototype.IncludeUserEvaluation = async function(req) {
    let user = req.body;
    user.id = uuid.v1();

    let conn = new dbConn(true);

    query = `INSERT TB_AVALIACAO 
    (
    ID_AVALIACAO
    ,ID_MARCADOR
    ,ID_USUARIO
    ,ID_AVALIADOR
    ,DT_CADASTRO
    ,DT_ALTERACAO
    ,ID_STATUS
    ) 
    VALUES 
    ('1','1','2','1',CURDATE(), CURDATE(),4);`;

    conn.query(query).then(() => {});
    conn.close();
};

UserDAO.prototype.GetIdByEmail = async function(email) {
    let conn = new dbConn(true);

    query = `SELECT Id_usuario as id
             FROM TB_USUARIOS
             WHERE EMAIL = "${email}";`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data[0].id;
};

UserDAO.prototype.GetPermissions = async(responsibilityId, areaId) => {
    let conn = new dbConn(true);
    let query = `SELECT 
    TCP.ID_PERMISSAO  		  AS id		
    FROM TB_CARGOS_PERMISSOES AS TCP
    INNER JOIN TB_CARGOS_AREA AS TCA
    ON TCA.ID_CARGO = '${responsibilityId}'
    AND TCA.ID_AREA = '${areaId}'
    AND TCA.ID_CARGO_AREA = TCP.ID_CARGO_AREA`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};


UserDAO.prototype.Authenticator = async(email) => {
    let conn = new dbConn(true);

    let query = `SELECT 
    TU.id_usuario AS id,
    TU.nome       As name,
    TU.email      AS email,
    TU.senha      AS password,
    TU.id_cargo   AS responsibilityId,
    TU.id_area    AS areaId,
    TU.id_status  AS status

    FROM TB_USUARIOS AS TU
    WHERE TU.EMAIL = "${email}";`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return {
        result: [...data],
        analysis: _shared.AnalyzeResult(data)
    };
};

UserDAO.prototype.Get = async(userActive) => {

    let filter = (userActive == 'true') ? `WHERE USER.id_status = 1` : `WHERE USER.id_status = 2`;

    let conn = new dbConn(true);
    let query = `SELECT 
                      USER.id_usuario      AS id,
                      USER.nome            AS name,
                      USER.email           AS email,
                      USER.senha           AS password,
                      USER.id_avaliador    AS evaluatorId,
                      AVALIATOR.nome       AS evaluatorName,
                      CARGO.id_cargo       AS responsibilityId,
                      CARGO.ds_cargo       AS nameReponsability,
                      USER.id_area         AS areaId,
                      AREA.ds_area         AS nameArea,
                      DPT.id_departamento  AS department,
                      DPT.ds_departamento  AS nameDepartament,
                      USER.dt_cadastro     AS registerDate,
                      USER.dt_alteracao    AS changeDate,
                      USER.id_status       AS statusCode,
                      STATUS.ds_status     AS typeStatus
                    FROM tb_usuarios AS USER
                    LEFT JOIN tb_cargos AS CARGO
                    ON USER.id_cargo = CARGO.id_cargo
                    LEFT JOIN tb_status as STATUS
                    ON USER.id_status = STATUS.id_status
                    LEFT JOIN tb_areas as AREA
                    ON USER.id_area = AREA.id_area
                    LEFT JOIN tb_departamentos AS DPT
                    ON AREA.id_departamento = DPT.id_departamento
                    LEFT JOIN tb_usuarios as AVALIATOR
                    ON USER.id_avaliador = AVALIATOR.id_usuario
                    ${filter};`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};

UserDAO.prototype.GetEvaluator = async() => {
    let conn = new dbConn(true);

    let query = `SELECT DISTINCT
                    TA.ID_USUARIO AS id,
                    TA.NOME AS name,
                    TA.ID_AREA AS areaId
                FROM TB_USUARIOS TU
                INNER JOIN TB_USUARIOS TA
                ON TU.ID_AVALIADOR = TA.ID_USUARIO;`;
    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};

UserDAO.prototype.UpdateStatus = async(status, id) => {
    let conn = new dbConn(true);
    let query = `UPDATE TB_USUARIOS 
                 SET ID_STATUS = ${status} 
                 WHERE ID_USUARIO = '${id}'`;
    conn.query(query).then(() => {});
    conn.close();
};

UserDAO.prototype.Update = async function(req, isChangePassword) {
    let user = req.body;
    let parameter = (isChangePassword) ? `senha = '${user.password}',` : "";
    let conn = new dbConn(true);

    query = `UPDATE TB_USUARIOS SET
              ${parameter}
              nome = '${user.name}',
              email = '${user.email}',
              id_avaliador = '${user.evaluatorId}',
              id_cargo = '${user.responsibilityId}',
              id_area = '${user.areaId}',
              dt_alteracao = curdate()              
              WHERE ID_USUARIO = '${user.id}'
              `;

    conn.query(query).then(() => {});
    conn.close();
};

UserDAO.prototype.ExistenceValidationByEmail = async function(email) {
    let conn = new dbConn(true);

    let query = `SELECT 
                    ID_STATUS AS status
                    FROM TB_USUARIOS
                    WHERE EMAIL = "${email}";`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return _shared.AnalyzeResult(data);
};

module.exports = () => {
    return UserDAO;
};