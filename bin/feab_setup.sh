export BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export FEAB_ENV=$BIN_DIR/..
export FEAB_PORTAL=$FEAB_ENV

function gofeab {
    cd $FEAB_PORTAL/feab
}

function goportal {
    cd $FEAB_PORTAL
}

function run_feab_admin {
    gofeab
    bin/rails s -b 10.0.0.198 -p 3002
}

function rails_sibling {
    rails new  --skip-test --skip-git --database=postgresql --skip-turbolinks --skip-coffee $1
}

function gen_feab_portal {
    goportal
    
    rails_sibling "--webpack=react feab"

    gofeab
    
    echo "gem 'activeadmin'" >> Gemfile
    echo "gem 'devise'" >> Gemfile
    echo "gem 'cancancan'" >> Gemfile
    echo "gem 'draper'" >> Gemfile
    echo "gem 'pundit'" >> Gemfile
    
    echo "gem 'friendly_id'" >> Gemfile
    echo "gem 'paper_trail'" >> Gemfile

    echo -e "\ngem 'rspec-rails', group: [:development, :test]\n" >> feab_core/Gemfile    
    echo -e "\n\ngroup :test do\n  gem 'factory_bot_rails'\n  gem 'faker'\n  gem 'cucumber-rails', require: false\n  gem 'database_cleaner'\nend\n" >> Gemfile
    
    
    bundle install

    bin/rails g rspec:install
    bundle binstubs rspec-core
    
    bin/rails g friendly_id
    bin/rails g paper_trail:install
    bin/rails g active_admin:install
    
    bin/rails db:drop
    bin/rails db:create
    
    bin/rake db:migrate
    bin/rake db:seed

    bin/rails db:migrate RAILS_ENV=development
    bin/rails db:migrate RAILS_ENV=test

    
    bin/rails g migration enable_pgcrypto_extension
    bin/rails g model element
}    

rbenv local 2.5.1

function rspec_models {
    gofeab
    bundle exec rspec spec/models/feab/$1
}

function boot_features {
    gofeab
    
    echo 'features:clear_feature_elements'
    bin/rails features:clear_feature_elements $1
    
    echo 'features:load_feature_files'
    bin/rails features:load_feature_files $1
}

function gemspec_init {
    perl -p -i -e 's/"feab"/"featurebase"/g' feab_core/feab.gemspec
    perl -p -i -e 's/TODO: Write your name/jkolyer/g' feab_core/feab.gemspec
    perl -p -i -e 's/TODO: Write your email address/jkolyer@example.com/g' feab_core/feab.gemspec
    perl -p -i -e 's/TODO: Summary of Feab./FeatureBase is a feature lifecycle manager/g' feab_core/feab.gemspec
    perl -p -i -e 's/TODO: Description of Feab./FeatureBase is a feature lifecycle manager/g' feab_core/feab.gemspec
    perl -p -i -e 's/TODO/http:\/\/example.com/g' feab_core/feab.gemspec

    awk '/end$/ && c == 0 {c = 1; print "\n  s.test_files = Dir[\"spec/**/*\"]"}; {print}' feab_core/feab.gemspec > feab_core/feab.gemspec.new
    mv feab_core/feab.gemspec.new feab_core/feab.gemspec

    awk '/end$/ && c == 0 {c = 1; print "\n  s.add_dependency \"friendly_id\", \"~> 5.2.0\""}; {print}' feab_core/feab.gemspec > feab_core/feab.gemspec.new
    mv feab_core/feab.gemspec.new feab_core/feab.gemspec
      
    awk '/end$/ && c == 0 {c = 1; print "\n  s.add_dependency \"paper_trail\", \"~> 9.2.0\""}; {print}' feab_core/feab.gemspec > feab_core/feab.gemspec.new
    mv feab_core/feab.gemspec.new feab_core/feab.gemspec

    mv feab_core/feab.gemspec feab_core/featurebase.gemspec 
    
    perl -p -i -e 's/# gem/gem/g' feab_core/Gemfile
    echo -e "\ngem 'rspec-rails', group: [:development, :test]\n" >> feab_core/Gemfile    
    echo -e "\n\ngroup :test do\n  gem 'factory_bot_rails'\n  gem 'faker'\n  gem 'cucumber-rails', require: false\n  gem 'database_cleaner'\nend\n" >> feab_core/Gemfile
    
}

function engine_install_files {
    cp $FEAB_INSTALLS/lib/feab/engine.rb $FEAB_CORE/lib/feab
    cp -r $FEAB_INSTALLS/app/models/concerns $FEAB_CORE/app/models
    cp -r $FEAB_INSTALLS/app/models/feab $FEAB_CORE/app/models
    rm $FEAB_CORE/app/models/feab/element.rb
}

function setup_engine {
    gen_feab_enginesh
    mv feab feab_core
    gemspec_init

    cd $FEAB_CORE
    # bin/rails db:environment:set RAILS_ENV=development
    bundle install
    mkdir config/initializers
    
    bin/rails g rspec:install
    bundle binstubs rspec-core

    perl -p -i -e 's/dummy/feab/g' spec/dummy/config/database.yml
    
    engine_models
    cp $FEAB_INSTALLS/db/migrate/create_feab_elements.rb `find db/migrate -name '*feab_elements.rb'`
    cp $FEAB_INSTALLS/db/migrate/enable_pgcrypto_extension.rb `find db/migrate -name '*enable_pgcrypto_extension.rb'`

    engine_install_files

    bin/rails g friendly_id
    cp $FEAB_INSTALLS/config/initializers/friendly_id.rb config/initializers
    bin/rails g paper_trail:install

    ffw_bootdb

    cp $FEAB_INSTALLS/config/ffw_*.yml $FEAB_CORE/config
}

function setup_spec {
    cd $FEAB_CORE
    cp -r $FEAB_INSTALLS/spec/support spec
    cp $FEAB_INSTALLS/spec/rails_helper.rb spec
    cp $FEAB_INSTALLS/spec/spec_helper.rb spec
    cp -r $FEAB_INSTALLS/spec/models spec
    cp -r $FEAB_INSTALLS/spec/factories spec

    cp $FEAB_INSTALLS/spec/dummy/lib/tasks/features.rake spec/dummy/lib/tasks
    cp -r $FEAB_INSTALLS/spec/dummy/features spec/dummy

    rspec_ffw
}

