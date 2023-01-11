import { expect } from 'chai';
import { camelize, capitalize } from './util.js';

describe('generator.util', () => {
  it('capitalize', () => {
    expect(capitalize('Sample Name')).to.equal('Sample Name');
    expect(capitalize('sample-name')).to.equal('Sample Name');
    expect(capitalize('Sample Name', { separator: '' })).to.equal('SampleName');
  });
  it('camelize', () => {
    expect(camelize('Sample Name')).to.equal('sampleName');
    expect(camelize('sample-name')).to.equal('sampleName');
    expect(camelize('sample_name')).to.equal('sampleName');
  });
});