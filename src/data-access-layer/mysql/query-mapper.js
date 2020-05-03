const clientConfig = require('../../../config/client.config')

const patientTableAndColumnToFHIR = tableAndColumnToFhir(clientConfig.patient)
const patientSelectStatement = selectStatementGenerator(patientTableAndColumnToFHIR)
const medicationRequestTableAndColumnToFhir = tableAndColumnToFhir(clientConfig.medication)
const medicationSelectStatement = selectStatementGenerator(medicationRequestTableAndColumnToFhir)

function tableAndColumnToFhir(fhirResourceType) {
  return Object.keys(fhirResourceType).map((elm) => Object.assign({ key: elm }, fhirResourceType[elm]))
}

function selectStatementGenerator(tableAndColumnToFhirObject) {
  return tableAndColumnToFhirObject
    .map((elm) => {
      if (elm['columnname'].includes(',')) {
        return `CONCAT_WS(",",${elm['tablename']}.${elm['columnname']}) AS ${elm['key']}`
      }
      return `${elm['tablename']}.${elm['columnname']} AS ${elm['key']}`
    })
    .join(',')
}

function generateWhereClause(tableAndColumnToFhirObject) {
  return function (queryParamsObject) {
    let nameWhereArray = []
    let birthdateWhereClause = ''
    let genderWhereClause = ''
    if (queryParamsObject['name']) {
      const familyName = tableAndColumnToFhirObject.find((elm) => elm.key === 'family')
      const givenName = tableAndColumnToFhirObject.find((elm) => elm.key === 'given')
      const middleNames = tableAndColumnToFhirObject.find((elm) => elm.key === 'middleName')
      nameWhereArray.push(`${familyName.tablename}.${familyName.columnname} LIKE '%${queryParamsObject.name}%'`)
      nameWhereArray.push(`${givenName.tablename}.${givenName.columnname} LIKE '%${queryParamsObject.name}%'`)
      nameWhereArray.push(`${middleNames.tablename}.${middleNames.columnname} LIKE '%${queryParamsObject.name}%'`)
    }

    if (queryParamsObject['gender']) {
      const gender = tableAndColumnToFhirObject.find((elm) => elm.key === 'gender')
      //TODO: what if boolean? what if m/f?
      genderWhereClause = `${gender.tablename}.${gender.columnname} = '${queryParamsObject['gender']}'`
    }

    if (queryParamsObject['birthdate']) {
      const birthdate = tableAndColumnToFhirObject.find((elm) => elm.key === 'birthDate')
      birthdateWhereClause = `${birthdate.tablename}.${birthdate.columnname} = '${queryParamsObject['birthdate']}'`
    }
    let whereStr = ''
    if (nameWhereArray.length) {
      whereStr += `WHERE (${nameWhereArray.length ? nameWhereArray.join(' OR ') : ''})`
    }

    if (birthdateWhereClause.length) {
      whereStr += whereStr ? ` AND ${birthdateWhereClause}` : `WHERE ${birthdateWhereClause}`
    }

    if (genderWhereClause) {
      whereStr += whereStr ? ` AND ${genderWhereClause}` : `WHERE ${genderWhereClause}`
    }
    debugger
    return whereStr
  }
}

const generatePatientWhereClause = generateWhereClause(patientTableAndColumnToFHIR)

module.exports = { patientSelectStatement, medicationSelectStatement, generatePatientWhereClause }

// generateWhereClauses(patientTableAndColumnToFHIR, 'name=Mark&birthdate=1987-09-17&gender=female')
