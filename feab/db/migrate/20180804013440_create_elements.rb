class CreateElements < ActiveRecord::Migration[5.2]
  def change
    create_table :feab_elements, id: :uuid do |t|

      t.string :type, null: false
      t.string :mnemonic

      t.string :name
      t.string :feab_version, default: '0.0.0'
      t.string :order_id

      t.uuid :parent_id
      t.uuid :domain_id
      
      t.uuid :related_element_id

      t.jsonb :json_content, null: false, default: '{}'
      
      t.timestamps
    end
    
    add_index(:feab_elements, :type)
    add_index(:feab_elements, :mnemonic, unique: true)
    add_index(:feab_elements, :parent_id)
    add_index(:feab_elements, :domain_id)
    add_index(:feab_elements, :related_element_id)

  end
end
