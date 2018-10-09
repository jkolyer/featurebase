require 'rails_helper'

module Feab
  RSpec.describe DomainSpace, type: :model do

    describe 'loading domains' do

      let(:config) {
        {
          adhoc: {
            transport: [ :carpool ],
            study: [ :acim, :class ],
            real_estate: [ :board, :group_rental ],
          },
          site: {
          }
        }
      }

      before do
        allow(DomainSpace).to receive(:domain_configuration) { config }
      end
      
      it 'config read in properly' do
        expect(DomainSpace.domain_configuration).to eq(config)
      end
      
      it 'domains loaded properly' do
        DomainSpace.add_domains!(config)
        expect(DomainSpace.count > 0).to be_truthy
        roots = DomainSpace.roots
        expect(roots.count).to eq(config.count)

        adhoc_domain = roots.first
        expect(adhoc_domain.mnemonic).to eq('adhoc')
        expect(adhoc_domain.child_records.count).to eq(3)
        expect(adhoc_domain.has_parent?).to eq(false)

        study_domain = adhoc_domain.child_records[1]
        expect(study_domain.mnemonic).to eq('study')
        expect(study_domain.child_records.count).to eq(2)
        expect(study_domain.parent_record.mnemonic).to eq('adhoc')

        domain = study_domain.child_records.first
        expect(domain.mnemonic).to eq('acim')
        expect(domain.child_records.count).to eq(0)
        expect(domain.parent_record.mnemonic).to eq('study')

        domain = study_domain.child_records.last
        expect(domain.mnemonic).to eq('class')
        expect(domain.child_records.count).to eq(0)
        expect(domain.parent_record.mnemonic).to eq('study')
        
        re_domain = adhoc_domain.child_records.last
        expect(re_domain.mnemonic).to eq('real_estate')
        expect(re_domain.child_records.count).to eq(2)
        expect(re_domain.parent_record.mnemonic).to eq('adhoc')

        domain = re_domain.child_records[0]
        expect(domain.mnemonic).to eq('board')
        expect(domain.child_records.count).to eq(0)
        expect(domain.parent_record.mnemonic).to eq('real_estate')
        
        domain = re_domain.child_records[1]
        expect(domain.mnemonic).to eq('group_rental')
        expect(domain.child_records.count).to eq(0)
        expect(domain.parent_record.mnemonic).to eq('real_estate')
        
      end
      
    end

  end
end
