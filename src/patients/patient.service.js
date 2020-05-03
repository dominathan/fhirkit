const { resolveSchema } = require('@asymmetrik/node-fhir-server-core')
const pool = require('../data-access-layer/mysql/')
const { patientSelectStatement, generatePatientWhereClause } = require('../data-access-layer/mysql/query-mapper')
const BundleEntry = require(resolveSchema('4_0_0', 'bundleentry'))
const Bundle = require(resolveSchema('4_0_0', 'bundle'))
const Patient = require(resolveSchema('4_0_0', 'patient'))

module.exports.search = async (args, context) => {
  // GET [base]/Patient?_id=1032702
  // GET [base]/Patient?identifier=http://hospital.smarthealthit.org|1032702
  // GET [base]/Patient?name=Shaw
  // GET [base]/Patient?birthdate=[date]&name=[string]
  // GET [base]/Patient?gender={[system]}|[code]&name=[string]
  // debugger
  const whereClause = generatePatientWhereClause(args)
  return new Promise((resolve, reject) => {
    pool.query(`SELECT ${patientSelectStatement} from patients ${whereClause} limit 100`, (error, results, fields) => {
      if (error) return reject(error)
      results = results.map(patientFhirMapper)
      const patients = results.map((result) => new Patient(result))
      const entries = patients.map((patient) => new BundleEntry({ resource: patient, search: { mode: 'include' } }))
      return resolve(new Bundle({ entry: entries, type: 'searchset', total: entries.length }))
    })
  })
}

module.exports.searchById = async (args, context) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT ${patientSelectStatement} from patients WHERE id = ?`, [args.id], (error, [result], fields) => {
      if (error) return reject(error)
      //TODO: operation outcome if 404
      if (!result) {
        return resolve({})
      }
      return resolve(new Patient(patientFhirMapper(result)))
    })
  })
}

function patientFhirMapper(patient) {
  return {
    name: [
      {
        family: patient.family,
        given: [patient.given, patient.mi].filter((elm) => elm),
      },
    ],
    identifier: [{ system: 'http://www.eirenerx.com', value: patient.id }],
    gender: patient.gender,
    address: [
      {
        line: patient.addressFullStreetName.split(','),
        city: patient.addressCity,
        state: patient.addressState,
        postalCode: patient.addressZip,
      },
    ],
    telecom: [
      {
        system: 'phone',
        value: patient.homePhone,
        use: 'home',
      },
      {
        system: 'phone',
        value: patient.cellPHone,
        use: 'mobile',
      },
      {
        system: 'email',
        value: patient.email,
      },
    ].filter((elm) => elm.value),
  }
}
