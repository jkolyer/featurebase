require 'friendly_id'

module Feab
  class FeatureElement < Element
    TYPE_FEATURE = 'Feature'
    
    include Feab::Family
    
    belongs_to :role,
               class_name: 'Feab::Role',
               foreign_key: :related_element_id,
               inverse_of: :feature_elements
    
    belongs_to :domain_space,
               class_name: 'Feab::DomainSpace',
               foreign_key: :domain_id,
               inverse_of: :feature_elements

    extend FriendlyId
    
    friendly_id :create_mnemonic,
                use: [:scoped, :slugged],
                slug_column: :mnemonic,
                scope: :role

    def create_mnemonic
      Role.feature_element_mnemonic(domain_space.mnemonic,
                                         role.mnemonic,
                                         feab_version,
                                         name)
    end

    def should_generate_new_friendly_id?
      name_changed?
    end

    def accessible_role(role)
      self.role == role ? true : self.role.has_parent_record?(role)
    end

    def components
      values = []
      tt = tags
      unless tt.blank?
        tt.each do |tag|
          values << $1 if tag =~ /^\s*@(\S+):<cmpt>\s*$/
        end
      end
      values
    end

    def element_type
      self.content['type']
    end

    def steps_text
      return [] if element_type == TYPE_FEATURE
      
      self.content['element_doc'].collect do |step|
        "#{step['keyword']}#{step['text']}"
      end
    end

    def domain_name
      domain_space.mnemonic
    end

    def role_name
      role.mnemonic
    end

  end
end

