import fs from 'fs';

import { Configuration } from './ConfigTypes';

import config_loaded = require('./config.js');

function deepPathLoad(innerConfig: Record<string, any>) {
  Object.keys(innerConfig).forEach((key) => {
    const value: unknown = (innerConfig as Record<string, any>)[key];
    if (typeof value == 'object') {
      deepPathLoad(value as Record<string, any>);
    } else if (key.endsWith('_path') && typeof value == 'string') {
      if (!fs.existsSync(value)) throw new Error(`file does not exist: '${value}'`);
      innerConfig[key.substr(0, key.length - '_path'.length)] = fs.readFileSync(value).toString();
    }
  });
}

// This is not a deep copy and does not necessarily provide the properties you may expect from one.
function deepAssign(target: Record<string, any>, source: Record<string, any>) {
  Object.keys(source).forEach((key) => {
    const target_subobj: unknown = (target as Record<string, any>)[key];
    const source_subobj: unknown = (source as Record<string, any>)[key];

    if (typeof target_subobj == 'object') {
      deepAssign(target_subobj as Record<string, any>, source_subobj as Record<string, any>);
    } else {
      (target as Record<string, any>)[key] = source_subobj;
    }
  });

  return target;
}

const config_defaults: Record<string, any> = {
  authn: {
    samlUserAttributeNameMap: {
      upi: 'upi',
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      numericId: 'numericId',
    },
  },
};

let config: Record<string, any> = config_loaded;
deepPathLoad(config);
config = deepAssign(config_defaults, config);

export default (config as unknown) as Configuration;
