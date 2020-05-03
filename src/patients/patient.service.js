const { resolveSchema } = require('@asymmetrik/node-fhir-server-core')
const pool = require('../data-access-layer/mysql/')
const queryMapper = require('../data-access-layer/mysql/query-mapper')
const BundleEntry = require(resolveSchema('4_0_0', 'bundleentry'))
const Bundle = require(resolveSchema('4_0_0', 'bundle'))
const Patient = require(resolveSchema('4_0_0', 'patient'))

module.exports.search = async (args, context) => {
  return new Promise((resolve, reject) => {
    pool.query(`SELECT ${queryMapper} from patients limit 10`, (error, results, fields) => {
      if (error) reject(error)
      results = results.map((patient) => {
        return {
          // resourceType: 'Patient',
          // active: true,
          name: [
            {
              family: patient.family,
              given: [patient.given],
            },
          ],
          // identifier: [{ system: 'http://www.eirenerx.com', value: '23423' }],
          // gender: 'male',
        }
      })
      // debugger
      const patients = results.map((result) => new Patient(result))
      // debugger
      const entries = patients.map((patient) => new BundleEntry({ resource: patient }))
      // debugger
      return resolve(new Bundle({ entry: entries }))
      // console.log('RESULTS: ', results)
    })
  })

  // // You will need to build your query based on the sanitized args
  // let query = myCustomQueryBuilder(args)
  // let results = await db.patients.find(query).toArray()
  // let patients = results.map((result) => new Patient(result))
  // let entries = patients.map((patient) => new BundleEntry({ resource: patient }))
  // return new Bundle({ entry: entries })
  // return []
}

module.exports.searchById = async (args, context) => {
  // let result = await db.patients.find({ _id: args.id })
  // return new Patient(result)
  return {}
}
