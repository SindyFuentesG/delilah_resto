const host = "localhost";
const name = "delilah_resto";
const port = "3306";
const user = "root";
const password = "sasa";

const path = `mysql://${user}:${password}@${host}:${port}/${name}`;
module.exports = { path };
