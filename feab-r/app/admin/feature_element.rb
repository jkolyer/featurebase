
ActiveAdmin.register Feab::FeatureElement, as: 'Feature' do

  config.filters = false
  config.per_page = 100

  controller do

    def scoped_collection
      Feab::FeatureElement.roots
    end

    def find_resource
      Feab::FeatureElement.find_by_mnemonic(params[:id])
    end
    
  end
  
  index do
    column :domain_name
    column :role_name
    column :name
    column :mnemonic
    column :source_name do |felem|
      felem.content['source_name']
    end
    column :filename do |felem|
      felem.content['filename']
    end
    column :feab_version
    id_column
  end

  show do
    attributes_table do
      row :domain_name
      row :role_name
      row :name
      row :source_name do |felem|
        felem.content['source_name']
      end
      row :mnemonic
      row :feab_version
    end

    panel "Children" do
      table_for resource.child_records do
        column :mnemonic
        column :name
        column :source_name do |felem|
          felem.content['source_name']
        end
        column :feab_version
        column :id do |felem|
          link_to felem, resource_path(felem), class: "resource_id_link"
        end
      end
    end
    
  end
  
end
