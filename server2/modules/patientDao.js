const mysql = require("mysql2/promise");

module.exports = class PatientDao {
    #adder
    #writer
    #reader

    constructor() {
        if(PatientDao.__instance) {
            return PatientDao.__instance
        }

        this.#adder = mysql.createPool({
            host: "localhost",
            user: "comp4537_lab_4_adder",
            password: "123456",
            database: "comp4537_lab_4",
        })

        this.#writer = mysql.createPool({
            host: "localhost",
            user: "comp4537_lab_4_writer",
            password: "123456",
            database: "comp4537_lab_4",
        })

        this.#reader = mysql.createPool({
            host: "localhost",
            user: "comp4537_lab_4_reader",
            password: "123456",
            database: "comp4537_lab_4",
        })
    }

    async createTable() {
        return await this.#adder.query(`
            CREATE TABLE IF NOT EXISTS patient ( 
	            patientId INT(8) AUTO_INCREMENT PRIMARY KEY,
	            name VARCHAR(100),
                dateOfBirth DATETIME
            );`.trim())
    }

    async deleteTable() {
        return await this.#adder.query(`DROP TABLE IF EXISTS patient`)
    }

    async insertPatients(values) {
        await this.createTable()
        return await this.#writer.query(`INSERT INTO patient (name, dateOfBirth) VALUES ?`, values)
    }

    async getPatients(query) {
        await this.createTable()
        return await this.#reader.query(query)
    }
}