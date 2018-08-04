module FeatureLoader
  extend ActiveSupport::Concern

  included do
    
    def self.feature_element_mnemonic(mne_domain, mne_role, feab_version, name)
      "#{mne_domain}_#{mne_role}_v#{feab_version} #{name}"
    end

    def self.tag_feab_version(tags=[])
      version = tags.select do |tag|
        if tag =~ /@feab_version_(\d+\.\d+\.\d+)/
          return $1
        end
        nil
      end
      version ? $1 : '0.0.0'
    end

  end
  
  def find_or_create_feature_element(args)
    feature = Feab::FeatureElement.where(name: args[:name],
                                              feab_version: args[:feab_version],
                                              domain_space: self.domain_space,
                                              role: self).
              limit(1).
              first
    
    unless feature
      feature = make_feature(args)
    end

    content = feature.content
    elem_doc = args[:element_doc]
    if elem_doc
      content['element_doc'] = elem_doc
    end
    content['type'] = args[:type]
    tags = args[:tags]
    unless tags.blank?
      content['tags'] = tags
    end
    type = args[:type]
    unless type.blank?
      content['type'] = type
    end
    ftypes = args[:ftypes]
    unless ftypes.blank?
      content['ftypes'] = ftypes
    end
    fname = args[:filename]
    unless fname.blank?
      content['filename'] = fname
    end
    src_name = args[:source_name]
    unless src_name.blank?
      content['source_name'] = src_name
    end
    
    feature.content = content
    feature.save!

    feature
  end

  def make_feature(args)
    Feab::FeatureElement.create(name: args[:name],
                                     feab_version: args[:feab_version],
                                     domain_space: self.domain_space,
                                     role: self,
                                     parent_record: args[:parent])
  end

  def load_feature_tree(features_array, parent=nil, feab_version=nil)
    features = []
    
    features_array.each do |feature|
      if feature.is_a? String
        features << self.make_feature({ name: feature,
                                        parent: parent,
                                        feab_version: feab_version
                                      })
      elsif feature.is_a? Hash
        feature.keys.each do |name|
          ff = self.make_feature({ name: name,
                                   parent: parent,
                                   feab_version: feab_version
                                 })
          features << ff
          self.load_feature_tree(feature[name], ff, feab_version)
        end
      end
    end
    features
  end

  def feature_name_types(fname)
    fname = fname.clone
    types = []
    while fname =~ /((\w+):<(\w+)>)/
      types << [$2, $3]
      fname.sub!($1, $2)
    end
    [fname, types]
  end
  
  def load_feature_doc(feature_doc, filename)
    feature = feature_doc[:feature]
    feature_root = nil

    feature_keys = feature.keys
    # [:type, :tags, :location, :language, :keyword, :name, :children]

    src_name = feature[:name]
    fname, ftypes = feature_name_types(src_name)
    tags = feature[:tags].collect { |tag| tag[:name] }
    args = {
      name: fname,
      ftypes: ftypes,
      domain: self.domain_space,
      feab_version: self.class.tag_feab_version(tags),
      tags: tags,
      type: feature[:type],
      filename: filename,
      source_name: src_name
    }
    felem = find_or_create_feature_element(args)
    args[:parent] = felem
    feature_root = felem

    mnemonics = []
    feature[:children].each do |elem|
      unless elem[:tags].blank?
        args[:tags] = elem[:tags].collect{ |tag| tag[:name] }
      else
        args[:tags] = nil
      end
      
      src_name = elem[:name]
      fname, ftypes = feature_name_types(src_name)
      args[:name] = fname
      args[:source_name] = src_name
      args[:ftypes] = ftypes
      args[:type] = elem[:type]
      args[:element_doc] = elem[:steps]
      args[:filename] = filename

      child_elem = find_or_create_feature_element(args)
      mnemonics << child_elem.mnemonic
    end

    feature_root.save!

    removals = feature_root.child_records.select do |felem|
      mnemonics.index(felem.mnemonic) == nil
    end
    unless removals.blank?
      removals.map(&:destroy)
      feature_root.reload
    end
    
    feature_root
  end
    
end

