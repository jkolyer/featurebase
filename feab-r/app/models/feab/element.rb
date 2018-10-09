require 'paper_trail'
require 'paper_trail/frameworks/active_record'

module Feab
  class Element < ApplicationRecord
    self.table_name = :feab_elements
    self.abstract_class = true

    has_paper_trail
    
    default_scope -> { where(type: self.name).order("order_id ASC, created_at ASC") }

    def raise_validation_error
      super
    end

    def to_s
      self.mnemonic
    end

    def content
      JSON.parse(self.json_content)
    end

    def content= data
      self.json_content = data.to_json
    end

    def tags
      self.content['tags']
    end

    def self.mnemonic(mne)
      self.where(mnemonic: mne).limit(1).first      
    end

    def self.roots
      self.where(["parent_id = id"])
    end

  end
end
