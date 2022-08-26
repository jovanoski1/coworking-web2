const { Client } = require("pg")
var fs = require('fs');
const dotenv = require("dotenv")
dotenv.config()

const connectDb = async () => {
    try {
        const client = new Client({
            user: "doadmin",
            host: "db-postgresql-fra1-41066-do-user-12314691-0.b.db.ondigitalocean.com",
            database: "defaultdb",
            password: "AVNS_UWQZw6h-0tsoanjAf2Z",
            port: 25060,
            ssl: {
                ca: fs.readFileSync('ca-certificate.crt')
            }
        })

        await client.connect()
        const res = await client.query('SELECT * FROM tickets')
        console.log(res)
        await client.end()
    } catch (error) {
        console.log(error)
    }
}

connectDb()