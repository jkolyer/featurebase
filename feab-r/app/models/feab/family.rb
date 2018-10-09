require 'friendly_id'

module Feab
  module Family
    extend ActiveSupport::Concern
    
    included do
      has_many :child_records,
               -> { where("parent_id != id") },
               class_name: self.name,
               foreign_key: :parent_id,
               dependent: :nullify,
               inverse_of: :parent_record
      
      belongs_to :parent_record,
                 class_name: self.name,
                 foreign_key: :parent_id,
                 inverse_of: :child_records

      
      before_validation(on: :create) do
        self.parent_record = self if self.parent_id.nil?
      end
      
    end
    
    def has_parent?
      self.parent_id.present? && self.parent_id != self.id
    end

    def has_parent_record?(element)
      if self.parent != self
        self.parent.has_parent_record?(element)
      else
        self == element
      end
    end

    # methods defined here are going to extend the class, not the instance of it
    module ClassMethods
    end
    
  end
end
