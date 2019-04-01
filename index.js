const { exec } = require('child_process');
const { GraphQLClient } = require('graphql-request');


const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJsaW5rZWRMaXN0QGRldiIsInJvbGVzIjpbImFkbWluIl19LCJpYXQiOjE1NTQxMDcwOTQsImV4cCI6MTU1NDcxMTg5NH0.9EYWDXkLEA7-wH8jr_02ix_PN2bxLFviEqbgmrMK7Y4"

const client = new GraphQLClient('http://localhost:4466/linkedList/dev', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})


var isDebugMode = false;

console.debug = function (args) {
  if (isDebugMode) {
    console.log(args);
  }
}


let createChain = (usersIds) => `mutation {
  item1: createItem(data: {
    name:"UsersIds ${usersIds}"
    label:"myLabel"  
  })
  {
    id
  }
}`;

async function deleteManyItmes() {
  return await client.request(`mutation{deleteManyItems{count}}`);
}

async function mutation(userId, sync) {
  let result;
  try {
    result = await client.request(createChain(userId));
    //console.log(JSON.stringify(result));
  } catch (e) {
    console.log(`error mutation prisma ${sync?'sync':'async'}` + JSON.stringify(e));

  }
  return result;
}

async function aSynchronousMutation(userIdList) {
  try {
    await Promise.all(userIdList.map(userId => mutation(userId,false)));
  } catch (e) {
    console.log("error" + JSON.stringify(e));
  }
  const deleteCount = await deleteManyItmes();
  console.log(`delete all aynchronous objet count${JSON.stringify(deleteCount)}`);
}


async function synchronousMutation(userIdList) {
  for (var i = 0; i < userIdList.length; i++) { await mutation(userIdList[i],false) }
  const deleteCount = await deleteManyItmes();
  console.log(`delete all synchronous objet count${JSON.stringify(deleteCount)}`);
}

async function main() {
  await deleteManyItmes();
  const loops = 4000;
  let userIdList = [];
  for (var i = 0; i < loops; i++) { userIdList.push(i); }

  await synchronousMutation(userIdList);

  await aSynchronousMutation(userIdList);


}

main();
