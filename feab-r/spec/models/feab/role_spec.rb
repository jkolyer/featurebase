require 'rails_helper'

module Feab
  RSpec.describe Role, type: :model do
    
    describe 'loading roles' do

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

      before do
        allow(Role).to receive(:role_configuration) { config }
      end
      
      it 'config read in properly' do
        expect(Role.role_configuration).to eq(config)
      end
      
      it 'roles loaded properly' do
        Role.add_roles!(config)
        expect(Role.count > 0).to be_truthy
        
        roots = Role.roots
        expect(roots.count).to eq(3)

        names = roots.map(&:mnemonic)
        expect(names.index('anon')).to be >= 0
        expect(names.index('owner')).to be >= 0
      end
      
      it 'domains have correct roles' do
        Role.add_roles!(config)

        domain = DomainSpace.find_or_create_by_mnemonic('adhoc')
        expect(domain.roles.count).to eq(4)
        
        domain = DomainSpace.find_or_create_by_mnemonic('site')
        expect(domain.roles.count).to eq(4)
        
        anon = Role.mnemonic('anon')
        expect(anon.domain_space).to eq(domain)
        
      end
      
    end

  end
end

