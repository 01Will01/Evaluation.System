const dbConn = require("../../../Shared/DbConnectionMySQL");
const uuid = require("uuid");

function ResponsabilityDAO() {}

ResponsabilityDAO.prototype.Include = async function(req) {
    let responsability = req.body;
    responsability.id = uuid.v1();

    let conn = new dbConn(true);

    query = `INSERT INTO tb_cargos  
                    (
                      id_cargo,
                      ds_cargo,
                      dt_cadastro,
                      dt_alteracao,
                      id_status
                    )
                    VALUES 
                    (
                        '${responsability.id}',
                        '${responsability.description}',
                        
                        curdate(),
                        curdate(),
                        1
                    );`;

    conn.query(query).then(() => {});
};
ResponsabilityDAO.prototype.IncludeRelationResponsibilityArea = async function(
    element
) {
    let relation = element;
    relation.id = uuid.v1();

    let conn = new dbConn(true);

    query = `INSERT INTO tb_cargos_area 
                    (
                      id_cargo_area,
                      id_cargo,
                      id_area,
                      dt_criacao
                      
                    )
                    VALUES 
                    (
                        '${relation.id}',
                        '${relation.ResponsibilityId}',
                        '${relation.AreaId}',
                        
                        curdate()
                        
                    );`;

    conn.query(query).then(() => {});
};

ResponsabilityDAO.prototype.IncludeRelationResponsibilityPermission = async function(element) {
    let relation = element;
    let id = uuid.v1();

    let conn = new dbConn(true);

    query = `INSERT INTO TB_CARGOS_PERMISSOES
    (
                    ID_CARGO_PERMISSAO,
                    ID_CARGO_AREA,
                    ID_PERMISSAO,
                    DT_CRIACAO
      
                    )
                    VALUES 
                    (
                        '${id}',
                        '${relation.responsibilityAreaId}',
                        '${relation.PermissionId}',
    
                        curdate()
                        
                    );`;

    conn.query(query).then(() => {});
    conn.close();
};

ResponsabilityDAO.prototype.RemoveRelationResponsibilityArea = async function(element) {
    let relation = element;

    let conn = new dbConn(true);

    query = `DELETE FROM TB_CARGOS_AREA 
             WHERE ID_CARGO = '${relation.ResponsibilityId}'
             AND ID_AREA = '${relation.AreaId}';`;

    conn.query(query).then(() => {});
    conn.close();
};

ResponsabilityDAO.prototype.RemoveRelationResponsibilityPermission = async function(element) {
    let relation = element;

    let conn = new dbConn(true);

    query = `DELETE FROM TB_CARGOS_PERMISSOES 
             WHERE ID_CARGO_AREA = '${relation.responsibilityAreaId}'
             AND ID_PERMISSAO = '${relation.PermissionId}';`;

    conn.query(query).then(() => {});
    conn.close();
};

ResponsabilityDAO.prototype.Get = async() => {
    let conn = new dbConn(true);
    let query = `SELECT 
                  ID_CARGO AS id,
                    DS_CARGO AS name,
                    DATE_FORMAT(DT_CADASTRO ,'%d/%m/%Y') AS registerDate,
                    ID_STATUS AS statusCode
                FROM TB_CARGOS 
                WHERE ID_STATUS = 1;`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};

ResponsabilityDAO.prototype.GetPermissions = async() => {
    let conn = new dbConn(true);
    let query = ` SELECT 
                  ID_PERMISSAO AS id,
                  DS_PERMISSAO AS name
                  FROM TB_PERMISSOES;`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};

ResponsabilityDAO.prototype.GetResponsibilityArea = async() => {
    let conn = new dbConn(true);
    let query = `SELECT 
                    ID_CARGO_AREA AS id,
                    TG.ID_CARGO AS responsibilityId,
                    TG.DS_CARGO AS responsibilityName,
                    TA.ID_AREA AS areaId,
                    TA.DS_AREA AS areaName,
                    DATE_FORMAT(TGA.DT_CRIACAO ,'%d/%m/%Y') AS registerDate
                FROM TB_CARGOS_AREA TGA
                LEFT JOIN TB_AREAS TA 
                ON TGA.ID_AREA = TA.ID_AREA
                LEFT JOIN TB_CARGOS TG
                ON TGA.ID_CARGO = TG.ID_CARGO;`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};

ResponsabilityDAO.prototype.GetResponsibilityPermission = async() => {
    let conn = new dbConn(true);
    let query = `SELECT 
                    ID_CARGO_PERMISSAO AS id,
                    TGA.ID_CARGO_AREA AS responsibilityAreaId,
                    TG.DS_CARGO AS responsibilityName,
                    TP.ID_PERMISSAO AS permissionId,
                    TP.DS_PERMISSAO AS permissionName,
                    DATE_FORMAT(TGP.DT_CRIACAO ,'%d/%m/%Y') AS registerDate
                FROM TB_CARGOS_PERMISSOES TGP
                LEFT JOIN TB_PERMISSOES TP 
                ON TGP.ID_PERMISSAO = TP.ID_PERMISSAO
                LEFT JOIN TB_CARGOS_AREA TGA 
                ON TGA.ID_CARGO_AREA = TGP.ID_CARGO_AREA
                LEFT JOIN TB_CARGOS TG
                ON TGA.ID_CARGO = TG.ID_CARGO;`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return data;
};
ResponsabilityDAO.prototype.ValidateByName = async(description) => {
    let conn = new dbConn(true);
    let query = `  SELECT ID_STATUS AS status FROM TB_CARGOS  WHERE ds_cargo = '${description}'`;

    let data = await conn.query(query).then((result) => {
        return result;
    });

    conn.close();
    return _shared.AnalyzeResults(data);
};

ResponsabilityDAO.prototype.UpdateStatus = async(status, id) => {
    let conn = new dbConn(true);
    let query = `UPDATE TB_CARGOS 
                 SET ID_STATUS = ${status} 
                 WHERE ID_CARGO = '${id}'`;
    conn.query(query).then(() => {});
    conn.close();
};

module.exports = () => {
    return ResponsabilityDAO;
};