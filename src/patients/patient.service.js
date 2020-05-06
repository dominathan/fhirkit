const { resolveSchema } = require('@asymmetrik/node-fhir-server-core')
const pool = require('../data-access-layer/mysql/')
const {
  patientSelectStatement,
  generatePatientWhereClause,
  patientJoinTableStatement,
} = require('../data-access-layer/mysql/query-mapper')
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
    pool.query(
      `SELECT ${patientSelectStatement} from patients ${patientJoinTableStatement} ${whereClause} ORDER BY patients.id limit 1000`,
      (error, results, fields) => {
        if (error) return reject(error)
        results = patientFhirMapper(results)
        const patients = results.map((result) => new Patient(result))
        const entries = patients.map((patient) => new BundleEntry({ resource: patient, search: { mode: 'include' } }))
        return resolve(new Bundle({ entry: entries, type: 'searchset', total: entries.length }))
      }
    )
  })
}

module.exports.searchById = async (args, context) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT ${patientSelectStatement} from patients ${patientJoinTableStatement} WHERE patients.id = ?`,
      [args.id],
      (error, results, fields) => {
        // debugger
        if (error) return reject(error)
        //TODO: operation outcome if 404
        if (!results.length) {
          return resolve({})
        }
        const patient = patientFhirMapper(results)
        return resolve(new Patient(patient[0]))
      }
    )
  })
}

function patientFhirMapper(patients) {
  return patients.reduce((accm, patient, idx) => {
    const extId = patient.externalIdentifier.split(',')

    if (accm[accm.length - 1]?.id === patient.id) {
      //update previous patient with any additional join items
      accm[accm.length - 1].identifier.push({ system: extId[0], value: extId[1] })
      return accm
    }
    const patObj = {
      id: patient.id,
      name: [
        {
          family: patient.family,
          given: [patient.given, patient.mi].filter((elm) => elm),
        },
      ],
      identifier: [
        { system: 'http://www.testdata.com/patients', value: patient.id },
        { system: extId[0], value: extId[1] },
      ].filter((elm) => elm.value),
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
    accm.push(patObj)
    return accm
  }, [])
}
