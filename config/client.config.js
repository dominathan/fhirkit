module.exports = {
  patient: {
    rootTable: 'patients',
    family: {
      tablename: 'patients',
      columnname: 'last_name',
    },
    given: {
      tablename: 'patients',
      columnname: 'first_name',
    },
    middleName: {
      tablename: 'patients',
      columnname: 'mi',
    },
    addressFullStreetName: {
      tablename: 'patients',
      columnname: 'address,address2',
    },
    addressCity: {
      tablename: 'patients',
      columnname: 'city',
    },
    addressState: {
      tablename: 'patients',
      columnname: 'state',
    },
    addressZip: {
      tablename: 'patients',
      columnname: 'zip',
    },
    birthDate: {
      tablename: 'patients',
      columnname: 'dob',
    },
    gender: {
      tablename: 'patients',
      columnname: 'gender',
    },
    email: {
      tablename: 'patients',
      columnname: 'email',
    },
    cellPhone: {
      tablename: 'patients',
      columnname: 'cell_phone',
    },
    homePhone: {
      tablename: 'patients',
      columnname: 'home_phone',
    },
    id: {
      tablename: 'patients',
      columnname: 'id',
    },
    externalIdentifier: {
      tablename: 'patient_external_identifiers',
      fk: 'patient_id',
      fkTable: 'patients',
      columnname: 'name,identifier',
      fkColumn: 'id',
    },
  },
  medication: {
    rootTable: 'patient_medications',
    id: {
      tablename: 'patient_medications',
      columnname: 'id',
    },
    rxnorm: {
      tablename: 'patient_medications',
      columnname: 'rxnorm',
    },
    ndc: {
      tablename: 'patient_medications',
      columnname: 'product_ndc',
    },
    name: {
      tablename: 'patient_medications',
      columnname: 'name',
    },
    patientId: {
      tablename: 'patient_medications',
      columnname: 'patient_id',
    },
    // status: {
    //   tablename: 'patient_medications',
    //   columnname: '',
    // },
    // intent: {
    //   tablename: 'patient_medications',
    //   columnname: 'id',
    // },
    authoredOn: {
      tablename: 'patient_medications',
      columnname: 'created_at',
    },
    requester: {
      tablename: 'patient_medications',
      columnname: 'user_id',
    },
  },
}

//SAMPLE MEDICATION REQUEST
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
