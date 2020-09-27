//This file simply shows how the data will look like.

let db = { 
    offices: [
       {
           officeName: 'specno',
           officeLocation: 'paarl',
           officeEmail: 'specno@test.com',
           officeTellNumber: 71915214,
           officeMaxOcupant: 9,
           officeColor: 'grey',
           staffMembers: 9,
       }
    ]
};

const officeDetails = {
    //Redux data
  datas: {
    officeName: 'specno',
    officeLocation: 'paarl',
    officeMaxOcupant:  '9',
    officeTellNumber: '0719150214',
    officeEmail: 'specno@gmail.com',
    officeColor: 'blue',
    colorUrl: 'https://firebasestorage.googleapis.com/v0/b/manageofficeproj-23044.appspot.com/o/offceDefaultColor.jpg?alt=media', //This will replace to officeColor selection, to uploading of colorImg in the future.
    officeId: "WboKkcZ6Ehj1etQXK5mU",
  },
  staffs: [
      {
        id:'Pwnk8kkQdwbSa5KEPTCo',
        office_id: 'WboKkcZ6Ehj1etQXK5mU',
        staffName: 'Daniel'
      }
  ]
},


