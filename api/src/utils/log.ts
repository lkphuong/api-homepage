import * as fs from 'fs-extra';
import * as dayjs from 'dayjs';

import { LOG_PATH, LOG_RETENTION_DURATION } from '../constants';

export const readFile = (path) => {
  return new Promise((resolve, reject) => {
    try {
      const data = fs.readFileSync(path);
      console.log('#utils/log - readFile() - log: ' + data);
      return resolve(data);
    } catch (err) {
      console.log('#utils/log - readFile() - error: ' + err);
      return reject(err);
    }
  });
};

export const writeFile = (data) => {
  const now = dayjs(Date.now()).format('YYYYMMDD');
  const path = `${LOG_PATH}/${now}.lg`;
  if (fs.existsSync(path)) {
    // Append new data into log file!
    fs.appendFileSync(path, data);
  } else {
    // Delete old files in log directory!
    unlinkFiles(LOG_RETENTION_DURATION);
    // Create a new log file!
    fs.writeFileSync(path, data);
  }
};

export const unlinkFiles = (expired) => {
  fs.readdir(LOG_PATH, (err, items) => {
    if (err) console.log('#utils/index - deleteFiles() - error: ' + err);
    else {
      const n = new Date();
      const now = dayjs(new Date(n.getFullYear(), n.getMonth(), n.getDate()));
      for (let i = 0; i < items.length; i++) {
        const filename = `${LOG_PATH}/${items[i]}`;
        fs.stat(filename, (err, stats) => {
          if (err) {
            console.log('#utils/index - deleteFiles() - error: ' + err);
            return;
          }
          const ctime = new Date(stats['ctime']);
          const created_date = dayjs(
            new Date(ctime.getFullYear(), ctime.getMonth(), ctime.getDate()),
          );
          const days = convertMillisecondsToDays(now.diff(created_date));
          if (days >= expired) {
            fs.unlink(filename, (err) => {
              console.log('#utils/index - readFile() - error: ' + err);
            });
          }
        });
      }
    }
  });
};

function convertMillisecondsToDays(milliseconds) {
  const seconds = milliseconds / 1000;
  const minutes = seconds / 60;
  const hours = minutes / 60;
  const days = hours / 24;
  return days;
}
