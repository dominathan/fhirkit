const clientConfig = require('../../../config/client.config')

const patientRootTable = clientConfig.patient.rootTable
const medicationRootTable = clientConfig.medication.rootTable
const patientTableAndColumnToFHIR = tableAndColumnToFhir(clientConfig.patient)
const patientJoinTableStatement = joinTableGenerator(patientTableAndColumnToFHIR)
const patientSelectStatement = selectStatementGenerator(patientTableAndColumnToFHIR)
const medicationRequestTableAndColumnToFhir = tableAndColumnToFhir(clientConfig.medication)
const medicationSelectStatement = selectStatementGenerator(medicationRequestTableAndColumnToFhir)

function tableAndColumnToFhir(fhirResourceType) {
  return Object.keys(fhirResourceType)
    .filter((elm) => elm !== 'rootTable')
    .map((elm) => Object.assign({ key: elm }, fhirResourceType[elm]))
}

function selectStatementGenerator(tableAndColumnToFhirObject) {
  return tableAndColumnToFhirObject
    .map((elm) => {
      if (elm['columnname'].includes(',')) {
        const stringForUse = elm['columnname']
          .split(',')
          .map((col) => `${elm['tablename']}.${col}`)
          .join(',')
        return `CONCAT_WS(",",${stringForUse}) AS ${elm['key']}`
      }
      return `${elm['tablename']}.${elm['columnname']} AS ${elm['key']}`
    })
    .join(',')
}

function joinTableGenerator(tableAndColumnToFhirObject) {
  return tableAndColumnToFhirObject
    .filter((elm) => elm.fk)
    .map((elm) => {
      return `LEFT OUTER JOIN ${elm.tablename} ON ${elm.tablename}.${elm.fk} = ${elm.fkTable}.${elm.fkColumn}`
    })
    .join(' ')
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
      //what if type id DATETIME and not Date
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
    return whereStr
  }
}

function generateMedReqWhereClause(tableAndColumnToFhirObject) {
  return function (queryParamsObject) {
    let patientWhereClause
    if (queryParamsObject['patient']) {
      const patient = tableAndColumnToFhirObject.find((elm) => elm.key === 'patientId')
      patientWhereClause = `${patient.tablename}.${patient.columnname} = ${queryParamsObject['patient']}`
    }

    let whereStr = ''

    if (patientWhereClause) {
      whereStr += whereStr ? ` AND ${patientWhereClause}` : `WHERE ${patientWhereClause}`
    }
    return whereStr
  }
}

const generatePatientWhereClause = generateWhereClause(patientTableAndColumnToFHIR)
const medReqWhereClause = generateMedReqWhereClause(medicationRequestTableAndColumnToFhir)

module.exports = {
  patientSelectStatement,
  medicationSelectStatement,
  generatePatientWhereClause,
  patientJoinTableStatement,
  patientRootTable,
  medicationRootTable,
  medReqWhereClause,
}
