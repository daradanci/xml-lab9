const sql = require('mssql')


const config = {
    user: 'user1',
    password: 'sa',
    database: 'daSBERbotDB',
    server: 'DARADANCIPC',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        trustServerCertificate: true // change to true for local dev / self-signed certs
    }
}


async function getUserInfo(ChatId) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query(`select * from users where ChatId=${ChatId}`);
        console.log(res['recordset']);
        sql.close();
        return res['recordset'];
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}

async function insertUserInfo(ChatId, UserName) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query(`insert into users (UserName, ChatId) values('${UserName}', '${ChatId}')`);
        console.log(res['recordset']);
        sql.close();
        return 0;
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
async function updateUserInfo(ChatId, State) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query(`update users set [State]=${State} where ChatId='${ChatId}'`);
        console.log(res['recordset']);
        sql.close();
        return 0;
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}


async function getUserState(ChatId) {
    try {
        let pool = await sql.connect(config);
        let res = await pool.request().query(`select [State] from users where ChatId=${ChatId}`);
        console.log(res['recordset'][0]['State']);
        sql.close();
        return res['recordset'][0]['State'];
    } catch (error) {
        console.log(error.message);
        sql.close();
    }
}
module.exports = {
    getUserInfo: getUserInfo,
    insertUserInfo: insertUserInfo,
    updateUserInfo: updateUserInfo,
    getUserState: getUserState
}