import fs from 'fs';

import { Configuration } from './ConfigTypes';

import config = require('./config.js');

function recursivePathLoad(innerConfig: Record<string, any>) {
  Object.keys(innerConfig).forEach((key) => {
    const value: unknown = (innerConfig as Record<string, any>)[key];
    if (typeof value == 'object') {
      recursivePathLoad(value as Record<string, any>);
    } else if (key.endsWith('_path') && typeof value == 'string') {
      if (!fs.existsSync(value)) throw new Error(`file does not exist: '${value}'`);
      innerConfig[key.substr(0, key.length - '_path'.length)] = fs.readFileSync(value).toString();
    }
  });
}

recursivePathLoad(config);

export default (config as unknown) as Configuration;
