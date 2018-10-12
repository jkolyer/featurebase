export BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export FEAB_ENV=$BIN_DIR/..
export FEAB_BACK=$FEAB_ENV/feab-back
export FEAB_FRONT=$FEAB_ENV/feab-front

function go_dir {
    echo $1
    cd $1
}

export FEAB_DEV_IP=10.0.0.231

function serve_back {
    go_dir $FEAB_BACK
    NODE_ENV=dev PORT=3001 DEBUG=feab-back:* "$@" -b $FEAB_DEV_IP
}

function run_back {
    serve_back npm start
}

function debug_back {
    serve_back node inspect server.js
}

function run_front {
    go_dir $FEAB_FRONT
    PORT=3002 npm start -b 10.0.0.231
}

function flow_front {
    go_dir $FEAB_FRONT
    yarn flow
}

function flow_back {
    go_dir $FEAB_BACK
    yarn flow
}

function run_mocha {
    go_dir $FEAB_BACK
    NODE_ENV=test npm test $2 test/$1
    # ./node_modules/mocha/bin/mocha test/$1
}

function mocha_test {
    run_mocha $1
}

function mocha_test_debug {
    run_mocha $1 debug
}

function sequelize_migrate {
    go_dir $FEAB_BACK
    node_modules/.bin/sequelize db:migrate
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

function dolint {
    ./node_modules/.bin/eslint "$@"
}
