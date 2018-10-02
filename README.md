## MutationIntensive
Some results could be found in results.log for various environment (prisma 15.3 vs 13.3, mySql vs PostgreSql)


Test Performance (internal Server Error when doing "intensive" concurrent mutation)
Valid test Creation of 3000 Item objet synchronously, peuso code:
 for (var i = 0; i < userIdList.length; i++) { await mutation(userIdList[i],false) }

Invalid test Creation of 2084 Item objet instead of 3000 concurrently, peuso code:
 await Promise.all(userIdList.map(userId => mutation(userId,false)));

## To reproduce:
**Clone the repository:**
git clone https://github.com/mjamelot/MutationIntensive.git
cd MutationIntensive/
npm install

**Start the server**
npm-run prisma deploy


**get prisma token and copy in the index.js**
npm-run prisma token



**run test**
node index.js

**result of test**
**Test1**
create 3000 synchronous objet **OK** :
delete all synchronous objet count{"deleteManyItems":{"count":3000}}

**test2**
create 2764 instead of 3000 asynchronous objet **KO** :
delete all aynchronous objet count{"deleteManyItems":{"count":2764}}

observe trace:
error mutation prisma async{"response":{"data":null,"errors":[{"message":"Whoops. Looks like an internal server error. Search your server logs for request ID: local:api:cjmres0t4xgdv0939a3m94ctd","path":["item1"],"locations":[{"line":2,"column":3}],"requestId":"local:api:cjmres0t4xgdv0939a3m94ctd"}],"status":200},"request":{"query":"mutation {\n  item1: createItem(data: {\n    name:\"UsersIds 1622\"\n    label:\"myLabel\"  \n  })\n  {\n    id\n  }\n}"}}
