export BIN_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

export FEAB_ENV=$BIN_DIR/..
export FEAB_BACK=$FEAB_ENV/feab-saas/back-end
export FEAB_FRONT=$FEAB_ENV/feab-saas/front-end

function visit_dir {
    echo $1
    cd $1
}

export FEAB_DEV_IP=10.0.0.231

function serve_back {
    visit_dir $FEAB_BACK
    NODE_IP=cohere.us yarn dev "$@"
    # NODE_ENV=dev PORT=3001 DEBUG=feab-back:* "$@" -b $FEAB_DEV_IP
}

function run_back {
    serve_back
}

function debug_back {
    serve_back debug
}

function run_front {
    visit_dir $FEAB_FRONT
    NODE_IP=cohere.us yarn dev
}

function run_mocha {
    visit_dir $FEAB_BACK
    NODE_ENV=test ./node_modules/mocha/bin/mocha $1
    # NODE_ENV=test npm test $2 test/$1
    # ./node_modules/mocha/bin/mocha test/$1
}

function mocha_test {
    run_mocha $1
}

function mocha_test_debug {
    run_mocha $1 debug
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

function jest_back {
    visit_dir $FEAB_BACK
    yarn test $1
}

function jest_back_debug {
    visit_dir $FEAB_BACK
    node inspect ./node_modules/jest-cli/bin/jest.js "$@"
}
