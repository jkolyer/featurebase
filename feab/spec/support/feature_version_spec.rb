require 'rails_helper'
require 'feature_version'

RSpec.describe FeatureVersion do
  
  it 'creates new instance' do
    featurev = FeatureVersion.create('0.0.0')
    expect(featurev).to_not be_nil
  end
  
  it 'has correct parts' do
    featurev_123 = FeatureVersion.create('1.2.3')
    expect(featurev_123.major).to eq('1')
    expect(featurev_123.minor).to eq('2')
    expect(featurev_123.patch).to eq('3')
  end

  it 'bumps patch part' do
    featurev_123 = FeatureVersion.create('1.2.3')
    featurev_124 = featurev_123.bump_part(FeatureVersion::PATCH)
    expect(featurev_124.patch).to eq('4')
  end
  
  it 'bumps minor part' do
    featurev_123 = FeatureVersion.create('1.2.3')
    featurev_130 = featurev_123.bump_part(FeatureVersion::MINOR)
    expect(featurev_130.patch).to eq('0')
    expect(featurev_130.minor).to eq('3')
  end
  
  it 'bumps major part' do
    featurev_123 = FeatureVersion.create('1.2.3')
    featurev_20 = featurev_123.bump_part(FeatureVersion::MAJOR)
    expect(featurev_20.patch).to eq('0')
    expect(featurev_20.minor).to eq('0')
  end
  
end
