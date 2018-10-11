export BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export FEAB_ENV=$BIN_DIR/..
export FEAB_BACK=$FEAB_ENV/feab-back
export FEAB_FRONT=$FEAB_ENV/feab-front

function go_dir {
    echo $1
    cd $1
}

function run_back {
    go_dir $FEAB_BACK
    PORT=3001 DEBUG=feab-back:* npm start -b 10.0.0.231
}

function run_front {
    go_dir $FEAB_FRONT
    PORT=3002 npm start -b 10.0.0.231
}

function flow_front {
    go_dir $FEAB_FRONT
    yarn flow
}

function mocha_test {
    go_dir $FEAB_BACK
    npm test test/$1
    # ./node_modules/mocha/bin/mocha test/$1
}

function sequelize_migrate {
    go_dir $FEAB_BACK
    node_modules/.bin/sequelize db:migrate
}

function express_start {
    PORT=3001 DEBUG=feature-backend:* npm start -b 10.0.0.231
}

function sequelize_migrate {
    node_modules/.bin/sequelize db:migrate
}

function start_mongo {
    sudo systemctl start mongod
    sudo systemctl enable mongod
}

function status_mongo {
    sudo systemctl status mongod
}
