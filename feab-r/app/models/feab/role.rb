module Feab
  class Role < Element
    include Feab::Family
    
    include RoleLoader
    include FeatureLoader
    
    has_many :feature_elements,
             class_name: 'Feab::FeatureElement',
             foreign_key: :related_element_id

    belongs_to :domain_space,
               class_name: 'Feab::DomainSpace',
               foreign_key: :domain_id,
               inverse_of: :roles
    
    default_scope { order(created_at: :asc) }
    
    def self.role_configuration
      config_file = "#{Rails.root}/config/ffw_roles.yml"
      YAML.load(File.read(config_file))
    end

    def self.bootstrap!
      self.add_roles!(self.role_configuration)
    end

  end # class
end # module
