require 'gherkin/parser'
require 'gherkin/pickles/compiler'
require 'byebug'

namespace :features do
  
  desc "Loading feature records from feature definition files"
  task load_feature_files: :environment do
    parser = Gherkin::Parser.new
    Feab::Role.bootstrap!
    
    `find #{Rails.root}/features/domains -name '*.feature'`.split.each do |path|
      file = File.read(path)
      fdoc = parser.parse(file)

      if path =~ /\/(\w+)\/\w+\.feature$/
        role = Feab::Role.mnemonic($1)
      end
      next unless role
      next unless fdoc[:feature]
      puts "Loading role = #{$1}; path = #{path}"

      role.load_feature_doc(fdoc, File.basename(path, '.feature'))
    end
  end
  
  desc "Clear feature elements"
  task clear_feature_elements: :environment do
    Feab::FeatureElement.destroy_all
  end

end
