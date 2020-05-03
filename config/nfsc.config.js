const { constants } = require('@asymmetrik/node-fhir-server-core')
const { VERSIONS } = constants

module.exports = {
  profiles: {
    patient: {
      service: './src/patients/patient.service.js',
      versions: [VERSIONS['4_0_0']],
    },
  },
}
