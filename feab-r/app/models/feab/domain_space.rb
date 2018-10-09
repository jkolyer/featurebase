module Feab
  class DomainSpace < Element
    include Feab::Family

    include DomainLoader
    
    has_many :roles,
             class_name: 'Feab::Role',
             foreign_key: :domain_id,
             inverse_of: :domain_space

    has_many :feature_elements,
             class_name: 'Feab::FeatureElement',
             foreign_key: :domain_id,
             inverse_of: :domain_space

    def self.domain_configuration
      config_file = "#{Rails.root}/config/ffw_domains.yml"
      YAML.load(File.read(config_file))
    end

  end
end
