/*!
 * Copyright (c) 2020 SAP SE or an SAP affiliate company. All rights reserved.
 */

jest.mock('cli-ux', () => ({
  default: {
    confirm: jest.fn().mockResolvedValue(true)
  }
}));
jest.retryTimes(3);

import * as fs from 'fs-extra';
import * as path from 'path';
import GenerateODataClient from '../src/commands/generate-odata-client';
import { deleteAsync, getTestOutputDir, TimeThresholds } from './test-utils';

describe('generate-odata-client', () => {
  const pathForTests = getTestOutputDir(__filename);

  beforeAll(async () => {
    await deleteAsync(pathForTests, 6);
    const pathForResources = path.resolve(__dirname, 'resources', 'template-generator-odata-client');
    await fs.copy(pathForResources, pathForTests);
  }, TimeThresholds.LONG);

  test(
    '[E2E] should generate a OData client',
    async () => {
      const result = await GenerateODataClient.run(['-i', 'edmxSource', '-o', 'output', '--projectDir', pathForTests]);
      expect(result.exitCode).toBe(0);

      return fs.readdir(path.resolve(pathForTests, 'output')).then(file => expect(file).toHaveLength(1));
    },
    TimeThresholds.LONG
  );
});
