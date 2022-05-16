const path = require('path');
const migrate = require('migrate');

const stateStore = require('../src/persistence/postgres-state-storage');

const migrationsDirectory = path.resolve(__dirname, '../src/migrations');

const [command] = process.argv.slice(2);

new Promise((resolve, reject) => {
  migrate.load(
    {
      stateStore,
      migrationsDirectory,
    },
    (error, set) => {
      if (error) {
        reject(error);
      }

      if (typeof set[command] !== 'function') {
        reject(new Error('Command is not a function'));
      }

      set[command]((error) => {
        if (error) reject(error);
        resolve();
      });
    },
  );
})
  .then(() => {
    console.log(`migrations "${command}" successfully ran`);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(0);
  })
  .catch((error) => {
    console.error(error.stack);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  });
