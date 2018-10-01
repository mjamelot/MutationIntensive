# MutationIntensive
Some results could be found in results.log for various environment (prisma 15.3 vs 13.3, mySql vs PostgreSql)


Test Performance (internal Server Error when doing "intensive" concurrent mutation)
First test  Creation of 3000 Item objet synchronously, peuso code:
 for (var i = 0; i < userIdList.length; i++) { await mutation(userIdList[i],false) }

Second test Creation of 2084 Item objet instead of 3000 concurrently, peuso code:
 await Promise.all(userIdList.map(userId => mutation(userId,false)));

For this test run :
node index.js




