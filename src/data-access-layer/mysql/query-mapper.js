const clientConfig = require('../../../config/client.config')

const tableAndColumnToFHIR = Object.keys(clientConfig.patient).map((elm) =>
  Object.assign({ key: elm }, clientConfig.patient[elm])
)
const selectStatement = tableAndColumnToFHIR
  .map((elm) => {
    return `${elm['columnname']} AS ${elm['key']}`
  })
  .join(', ')
// debugger

module.exports = selectStatement
