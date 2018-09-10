const { exec } = require('child_process');
const { GraphQLClient } = require('graphql-request');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNlcnZpY2UiOiJkZWZhdWx0QGRlZmF1bHQiLCJyb2xlcyI6WyJhZG1pbiJdfSwiaWF0IjoxNTM2NTk0MjU3LCJleHAiOjE1MzcxOTkwNTd9.k7KX_HDxz5pDkRVN8fyYn0VOCD1GhAFWyVr0li9ibRs';


const client = new GraphQLClient('http://localhost:4466/linkedList/dev', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

const createChain = `mutation {
  chain0: createItem(data: {
    next: {create: {
      next: {create: {
        next: {create: {}}
        }}
      }}
  })
  {
    id
    previous {id}
    next {
      id
      previous {id}
      next {
        id
        previous {id}
        next {
          id
          previous {id}
          next {
            id
          }
        }
      }
    }
  }
}`;


async function deleteOne(updateLink, item) {
  if (updateLink && item.previous && item.next) {
    await client.request(`mutation {
      updateItem(data: {previous: {connect: {id: "${item.previous.id}"} } }, where: {id: "${item.next.id}"}) {id}
    }`);
  }
  return client.request(`mutation {
    deleteItem(where: {id: "${item.id}"}) {id}
  }`);
}

async function deleteChain(updateLink, data) {
  const promises = [];
  promises.push(deleteOne(updateLink, data.chain0));
  promises.push(deleteOne(updateLink, data.chain0.next));
  promises.push(deleteOne(updateLink, data.chain0.next.next));
  promises.push(deleteOne(updateLink, data.chain0.next.next.next));
  return Promise.all(promises);
}

async function stats(updateLink, loops) {
  const stats = {noNode: 0, internalError: {deadlock: 0, constraint: 0, other:0}, unknownError: 0, success: 0};
  for(var i = 0; i < loops; i++) {
    const data = await client.request(createChain);
    try {
      await deleteChain(updateLink, data);
      console.debug(`[${updateLink?'LINKS':'RAW'}#${i}/${loops}][SUCCESS]`);
      stats.success++;
    } catch(e) {
      for(const {message} of e.response.errors) {
        if (message.startsWith("Whoops. Looks like an internal server error. Search your server logs for request ID: local:api:")) {
          const api = message.slice(-25);
          await exec(`docker inspect --format='{{.LogPath}}' linkedlist_prisma_1 | xargs sudo grep ${api}`, (err, stdout) => {
            if (err) return console.error(err)
            if (stdout.includes("Deadlock found when trying to get lock; try restarting transaction")) {
              console.debug(`[${updateLink?'LINKS':'RAW'}#${i}/${loops}][INTERNAL ERROR] ${api} => DEADLOCK`);
              stats.internalError.deadlock++;
            } else if (stdout.includes("Cannot add or update a child row: a foreign key constraint fails")) {
              console.debug(`[${updateLink?'LINKS':'RAW'}#${i}/${loops}][INTERNAL ERROR] ${api} => CONSTRAINT`);
              stats.internalError.constraint++;
            } else {
              console.debug(`[${updateLink?'LINKS':'RAW'}#${i}/${loops}][INTERNAL ERROR] ${api} => OTHER`);
              stats.internalError.other++;
            }
          });
        } else if (message.startsWith("No Node for the model Item with value")) {
          console.debug(`[${updateLink?'LINKS':'RAW'}#${i}/${loops}][NO NODE]`)
          stats.noNode++;
        } else {
          stats.unknownError++;
        }
      }
    } 
  }
  return `Stats ${updateLink?'when updating links before deletion':'when deleting items without maintaining chain consistency'}:\n ${JSON.stringify(stats, null, 2)}`;
}

async function main() {
  const resWithLink = await stats(true, 100);
  const resWithoutLink = await stats(false, 100);
  console.log(resWithLink);
  console.log(resWithoutLink);
}

main();