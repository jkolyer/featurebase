module RoleLoader
  extend ActiveSupport::Concern

  included do

    def self.find_or_create_by_mnemonic(mnemonic, domain)
      role = self.where(mnemonic: mnemonic,
                        domain_id: domain.id).
             limit(1).
             first
      
      if role.nil?
        role = self.new
        role.type = self.name
        role.mnemonic = mnemonic
        role.parent_record = role  # NOTE rails forces presence validation for :belongs_to
        role.domain_space = domain
        role.save!
      end
      role
    end

    def self.add_role(parent, role_name, domain)
      child = find_or_create_by_mnemonic(role_name, domain)
      if parent
        child.parent_record = parent
        parent.child_records << child
        child.save!
      end
      child
    end

    def self.add_role_tree(parent, role_tree, domain)
      role_tree.each do |role_key, child_elem|
        
        new_parent = add_role(parent, role_key, domain)
        
        if child_elem.is_a?(Symbol)
          add_role(new_parent, child_elem, domain)
          
        elsif child_elem.is_a?(Array)
          child_elem.each do |role|
            if role.is_a?(Symbol)
              add_role(new_parent, role, domain)
              
            elsif role.is_a?(Hash)
              add_role_tree(new_parent, role, domain)
            end
          end
          
        else
          add_role_tree(new_parent, child_elem, domain)
        end
      end
    end

    def self.add_roles!(role_hash)
      role_hash.each do |domain_key, roles|
        domain = Feab::DomainSpace.find_or_create_by_mnemonic(domain_key)
        
        if roles.is_a? Array
          roles.each do |role_elem|
            if role_elem.is_a?(Symbol)
              add_role(nil, role_elem, domain)
              
            elsif role_elem.is_a?(Hash)
              add_role_tree(nil, role_elem, domain)
              
            elsif role_elem.is_a?(Array)
              role_elem.each do |role|
                add_role(nil, role, domain)
              end
              
            end
          end
          
        elsif roles.is_a?(Hash)
          add_role_tree(nil, roles, domain)
        end
      end
    end

  end
end
