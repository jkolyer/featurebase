require 'gherkin/parser'
require 'gherkin/pickles/compiler'
require 'rails_helper'
require 'byebug'

module Feab
  RSpec.describe FeatureElement, type: :model do
    let(:feab_version) {
      '0.1.0'
    }
    let(:site_roles) {
      [ :anon, admin: { subscriber: :person } ]
    }
    let(:adhoc_roles) {
      { owner: { leader: { member: :observer } } }
    }
    let(:config) {
      {
        :site => site_roles,
        :adhoc => adhoc_roles
      }
    }
    let(:feature_tree) {
      {
        anon: ['view landing page',
               { 'login to the site' => [
                   { 'view login page' => [
                       'enter login information',
                       'view forgot password page'
                     ]
                   },
                   { 'view register page' => [
                       'enter registration information',
                     ]
                   }
                 ]
               },
              ],
      }
    }
    let(:feature_doc) {
      fdoc =<<DOC
#
@ffw_version_0.1.0
@top_level_feature:<cmpt>
Feature:  Feature Framework
  As a ::role:: 
  In order to 
  I want to 

  Background: ::role::
    Given
    When
    Then

  @first_scenario:<cmpt>
  Scenario: Scenario Number 1
    Given Foo
    When Bar
    Then FooBar

  @second_scenario_A:<cmpt>
  @second_scenario_B:<cmpt>
  Scenario: Scenario Number 2
    Given Foo123
    When Bar123
    Then FooBar321
DOC
    }
    let(:feature_doc_v2) {
      fdoc =<<DOC
#{feature_doc}

@third_scenario:<cmpt>

Scenario: Scenario Number 3
  Given FooFoo
  When BarBar
  Then FooBarFooBar
DOC
    }
    
    def loaded_feature(doc)
      fdoc = Gherkin::Parser.new.parse(doc)
      role = Role.mnemonic(:anon)
      role.load_feature_doc(fdoc, 'filename')
    end

    before do
      allow(Role).to receive(:role_configuration) { config }
      Role.add_roles!(config)
    end

    describe 'evaluating feature roles' do
      it 'features loaded properly' do
        feature = Role.mnemonic(:anon).make_feature({ name: 'My First Feature',
                                                      feab_version: feab_version})
        expect(feature.mnemonic).to eq('site_anon_v0-1-0-my-first-feature')
        expect(feature.feab_version).to eq(feab_version)
      end
      
      it 'loads feature tree' do
        feature_tree.each do |role, features|
          features = Role.mnemonic(role).load_feature_tree(features,
                                                           nil,
                                                           feab_version)
          expect(features.first.feab_version).to eq(feab_version)
          
          second = features.last
          expect(features.first.mnemonic).to eq('site_anon_v0-1-0-view-landing-page')
          expect(second.mnemonic).to eq('site_anon_v0-1-0-login-to-the-site')

          expect(second.child_records.count).to eq(2)
          view_login = second.child_records.first
          expect(view_login.mnemonic).to eq('site_anon_v0-1-0-view-login-page')
          
          view_register = second.child_records.last
          expect(view_register.mnemonic).to eq('site_anon_v0-1-0-view-register-page')
          
          expect(view_register.feab_version).to eq(feab_version)
        end
      end
      
      it 'load feature doc' do
        feature_root = loaded_feature(feature_doc)

        expect(feature_root.name).to eq('Feature Framework')
        expect(feature_root.child_records.count).to eq(3)
        expect(feature_root.tags.count).to eq(2)
        expect(feature_root.components.count).to eq(1)
        expect(feature_root.components.first).to eq('top_level_feature')
        
        child_elem = feature_root.child_records
        expect(child_elem[0].element_type).to eq('Background')
        expect(child_elem[1].element_type).to eq('Scenario')
        expect(child_elem[2].tags.count).to eq(2)
      end

      it 'feature doc value updates' do
        feature_root = loaded_feature(feature_doc)

        scenario1 = feature_root.child_records[1]
        expect(scenario1.steps_text.first).to eq('Given Foo')
        
        edited_doc = feature_doc.sub(/Given Foo\n/, "Given FFOOOO\n")
        feature_root_2 = loaded_feature(edited_doc)

        expect(feature_root_2.id).to eq(feature_root.id)

        scenario2_1 = feature_root_2.child_records[1]
        expect(scenario2_1.steps_text.first).to eq('Given FFOOOO')
      end

      it 'feature doc tag updates' do
        feature_root = loaded_feature(feature_doc)
        expect(feature_root.tags.last).to eq('@top_level_feature:<cmpt>')
        expect(feature_root.components.count).to eq(1)
        
        edited_doc = feature_doc.sub(/@top_level_feature:<cmpt>\n/,
                                     "@top_level_feature:<cmpt>\n@top_level_feature_2:<cmpt>\n")
        feature_root_2 = loaded_feature(edited_doc)
        expect(feature_root_2.tags.last).to eq('@top_level_feature_2:<cmpt>')
        expect(feature_root_2.components.count).to eq(2)
      end

      it 'feature doc added new scenarios' do
        feature_root = loaded_feature(feature_doc)
        expect(feature_root.child_records.count).to eq(3)

        feature_root_2 = loaded_feature(feature_doc_v2)
        expect(feature_root_2.id).to eq(feature_root.id)
        
        expect(feature_root_2.child_records.count).to eq(4)
      end

      it 'feature doc removed old scenarios' do
        feature_root_2 = loaded_feature(feature_doc_v2)
        felems = feature_root_2.child_records
        expect(felems.count).to eq(4)
        mne = felems.last.mnemonic
        expect(Feab::FeatureElement.mnemonic(mne)).to_not be_nil
        
        feature_root = loaded_feature(feature_doc)
        expect(Feab::FeatureElement.mnemonic(mne)).to be_nil
      end

      it 'feature doc scenarios ordered properly' do
        pending 'do this later'
        skip
      end

    end

    describe 'feature states' do
      let(:state_root) {
        loaded_feature(feature_doc)
      }
      it 'starts in conception state' do
        expect(state_root.conception?).to eq(true)
      end
      
      it 'transitions through states' do
        feature = state_root
        
        feature.conceive!
        expect(feature.development?).to eq(true)
        
        feature.trial!
        expect(feature.staging?).to eq(true)
        
        feature.live!
        expect(feature.production?).to eq(true)
        
        feature.retire!
        expect(feature.deprecated?).to eq(true)
      end

      it 'updates child states' do
        feature = state_root
        feature.conceive!
        
        feature.child_records.each do |child|
          expect(child.development?).to eq(true)
        end
      end  
    end

    describe 'feature versions' do
      let(:feature_root) {
        loaded_feature(feature_doc)
      }
      
      it 'creates FeatureVersion instance' do
        root = feature_root
        fv = FeatureVersion.create(root.feab_version)
        expect(root.feature_version).to eq(fv)
        expect(root.child_records.first.feature_version).to eq(fv)
      end
      
      it 'bumps FeatureVersion children' do
        root = feature_root
        orig_feabv = FeatureVersion.create(root.feab_version)

        FeatureVersion::PART_IDX.each do |part|
          bump_feabv = root.bump_version(part)
          expect(root.feab_version).to eq(bump_feabv.to_s)
          expect(root.child_records.first.feab_version).to eq(bump_feabv.to_s)
        end
      end
    end
    
  end
end
