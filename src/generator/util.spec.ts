import { expect } from 'chai';
import { capitalize } from './util.js';

describe('generator.util', () => {
  it('capitalize', () => {
    expect(capitalize('Sample Name')).to.equal('Sample Name');
    expect(capitalize('sample-name')).to.equal('Sample Name');
    expect(capitalize('Sample Name', { separator: '' })).to.equal('SampleName');
  });
});