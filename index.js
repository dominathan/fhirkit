const { initialize, loggers, constants } = require('@asymmetrik/node-fhir-server-core')
const nfscConfig = require('./config/nfsc.config')

let server = initialize(nfscConfig)
let logger = loggers.get('default')

server.listen(3000, () => logger.info('Starting the FHIR Server at localhost:3000'))
