import { Cooperation } from '../lib/cooperation';

const co = new Cooperation({
  baseURL: 'https://cooperation.uniontech.com',
  appKey: 'fc2fdd7675b0b6ea',
  sign: 'ZmRmZjc5NzE0ZDY1NjU4Y2M0NDQyMjdiODJmZDZjMTlkOWQ1N2M0OTQ1ZjQ1ZjgxMDI4ZGNkNGM0ZjA2MDMzYQ',
  worksheetId: '62bbc3694f0cd46903d9aeef',
});

(async () => {
  try {
    console.log(await co.getRecord('1'));
  } catch (err) {
    console.error(err);
  }
})();