module DomainLoader
  extend ActiveSupport::Concern

  included do
    def self.find_or_create_by_mnemonic(mnemonic)
      domain = self.where(mnemonic: mnemonic).
               limit(1).
               first
      
      if domain.nil?
        domain = self.new
        domain.type = self.name
        domain.mnemonic = mnemonic
        # domain.json_content = { category: category }
        domain.parent_record = domain
        domain.save!
      end
      domain
    end

    def self.add_domain(parent, domain_name)
      child = self.find_or_create_by_mnemonic(domain_name)
      if parent
        child.parent_record = parent
        parent.child_records << child
        child.save!
      end
      child
    end

    def self.add_domains!(domain_hash, parent=nil)
      domain_hash.each do |domain_name, subdomain|
        
        new_parent = add_domain(parent, domain_name)
        
        if subdomain.is_a?(Symbol)
          add_domain(new_parent, subdomain)
          
        elsif subdomain.is_a?(Hash)
          add_domains!(subdomain, new_parent)
          
        elsif subdomain.is_a?(Array)
          subdomain.each do |domain|
            add_domain(new_parent, domain)
          end
        end
      end
    end

  end
  
end

