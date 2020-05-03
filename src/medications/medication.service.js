const { resolveSchema } = require('@asymmetrik/node-fhir-server-core')
const pool = require('../data-access-layer/mysql/')
const { medicationSelectStatement } = require('../data-access-layer/mysql/query-mapper')
const BundleEntry = require(resolveSchema('4_0_0', 'bundleentry'))
const Bundle = require(resolveSchema('4_0_0', 'bundle'))
const MedicationRequest = require(resolveSchema('4_0_0', 'medicationrequest'))

// debugger
module.exports.search = async (args, context) => {
  // GET [base]/MedicationRequest?patient=14676&intent=order
  // GET [base]/MedicationRequest?patient=14676&intent=order&_include=MedicationRequest:medication

  // GET [base]/MedicationRequest?patient=1137192&intent=order&status=active
  // GET [base]/MedicationRequest?patient=1137192&intent=order&status=active&_include=MedicationRequest:medication
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT ${medicationSelectStatement} from patient_medications ORDER BY created_at DESC LIMIT 100 `,
      (error, results, fields) => {
        console.log('ERROR: ', error)
        if (error) return reject(error)
        results = results.map(medicationRequestFhirMapper)
        const medicationRequests = results.map((result) => new MedicationRequest(result))
        const entries = medicationRequests.map(
          (medreq) => new BundleEntry({ resource: medreq, search: { mode: 'include' } })
        )
        return resolve(new Bundle({ entry: entries, total: entries.length, type: 'searchset' }))
      }
    )
  })
}

module.exports.searchById = async (args, context) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT ${medicationSelectStatement} from patient_medications WHERE id = ?`,
      [args.id],
      (error, [result], fields) => {
        if (error) return reject(error)
        //TODO: operation outcome if 404
        if (!result) {
          return resolve({})
        }
        return resolve(new MedicationRequest(medicationRequestFhirMapper(result)))
      }
    )
  })
}

function medicationRequestFhirMapper(medication) {
  return {
    id: medication.id,
    status: 'active',
    intent: 'order',
    medicationCodeableConcept: {
      coding: [
        {
          system: 'http://ndc.com',
          code: medication.ndc,
        },
        {
          system: 'http://rxnorm.com',
          code: medication.rxnorm,
        },
      ].filter((elm) => elm.code),
      text: medication.name,
    },
    subject: {
      reference: `Patient/${medication.patientId}`,
    },
    requester: {
      reference: `Practitioner/${medication.requester}`,
    },
    authoredOn: medication.authoredOn,
  }
  // {
  //   "resourceType" : "MedicationRequest",
  //   "id" : "uscore-mo1",
  //   "meta" : {
  //     "profile" : [
  //       "http://hl7.org/fhir/us/core/StructureDefinition/us-core-medicationrequest"
  //     ]
  //   },
  //   "text" : {
  //     "status" : "generated",
  //     "div" : "<div xmlns=\"http://www.w3.org/1999/xhtml\"><p><b>Generated Narrative with Details</b></p><p><b>id</b>: uscore-mo1</p><p><b>meta</b>: </p><p><b>status</b>: active</p><p><b>intent</b>: order</p><p><b>medication</b>: Nizatidine 15 MG/ML Oral Solution [Axid] <span style=\"background: LightGoldenRodYellow\">(Details : {RxNorm code '582620' = 'Nizatidine 15 MG/ML Oral Solution [Axid]', given as 'Nizatidine 15 MG/ML Oral Solution [Axid]'})</span></p><p><b>subject</b>: <a href=\"Patient-example.html\">Amy Shaw. Generated Summary: id: example; Medical Record Number = 1032702 (USUAL); active; Amy V. Shaw ; ph: 555-555-5555(HOME), amy.shaw@example.com; gender: female; birthDate: 2007-02-20</a></p><p><b>authoredOn</b>: 05/04/2008 12:00:00 AM</p><p><b>requester</b>: <a href=\"Practitioner-practitioner-1.html\">Ronald Bone, MD. Generated Summary: id: practitioner-1; 9941339108, 25456; Ronald Bone </a></p><p><b>dosageInstruction</b>: </p><h3>DispenseRequests</h3><table class=\"grid\"><tr><td>-</td><td><b>NumberOfRepeatsAllowed</b></td><td><b>Quantity</b></td><td><b>ExpectedSupplyDuration</b></td></tr><tr><td>*</td><td>1</td><td>480 mL<span style=\"background: LightGoldenRodYellow\"> (Details: UCUM code mL = 'mL')</span></td><td>30 days<span style=\"background: LightGoldenRodYellow\"> (Details: UCUM code d = 'd')</span></td></tr></table></div>"
  //   },
  //   "status" : "active",
  //   "intent" : "order",
  //   "medicationCodeableConcept" : {
  //     "coding" : [
  //       {
  //         "system" : "http://www.nlm.nih.gov/research/umls/rxnorm",
  //         "code" : "582620",
  //         "display" : "Nizatidine 15 MG/ML Oral Solution [Axid]"
  //       }
  //     ],
  //     "text" : "Nizatidine 15 MG/ML Oral Solution [Axid]"
  //   },
  //   "subject" : {
  //     "reference" : "Patient/example",
  //     "display" : "Amy Shaw"
  //   },
  //   "authoredOn" : "2008-04-05",
  //   "requester" : {
  //     "reference" : "Practitioner/practitioner-1",
  //     "display" : "Ronald Bone, MD"
  //   },
  //   "dosageInstruction" : [
  //     {
  //       "text" : "10 mL bid",
  //       "timing" : {
  //         "repeat" : {
  //           "boundsPeriod" : {
  //             "start" : "2008-04-05"
  //           }
  //         }
  //       }
  //     }
  //   ],
  //   "dispenseRequest" : {
  //     "numberOfRepeatsAllowed" : 1,
  //     "quantity" : {
  //       "value" : 480,
  //       "unit" : "mL",
  //       "system" : "http://unitsofmeasure.org",
  //       "code" : "mL"
  //     },
  //     "expectedSupplyDuration" : {
  //       "value" : 30,
  //       "unit" : "days",
  //       "system" : "http://unitsofmeasure.org",
  //       "code" : "d"
  //     }
  //   }
  // }
}
