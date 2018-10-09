

function run_back {
    PORT=3001 DEBUG=feab-back:* npm start -b 10.0.0.231
}

function run_front {
    PORT=3002 npm start -b 10.0.0.231
}

function mocha_test {
    ./node_modules/mocha/bin/mocha test/$1
}

function sequelize_migrate {
    node_modules/.bin/sequelize db:migrate
}
