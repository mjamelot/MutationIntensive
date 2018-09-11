# LinkedList
Simplest doubly linked list prisma model that expose a deadlock issue with few concurrent deletes

to run the test (statistics for one hundred iteration, with and without taking care of maintaining list consistency):

node index.js

Some results could be found in results.log for various environment (prisma 15.3 vs 13.3, mySql vs PostgreSql)
