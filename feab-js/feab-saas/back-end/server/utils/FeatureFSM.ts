import { StateMachine } from 'javascript-state-machine';

/*
gestation
development
staging
production
deprecated
*/

const FeatureFSM = StateMachine.factory({
  init: 'gestation',
  transitions: [
    { name: 'conceive', from: 'gestation',  to: 'development' },
    { name: 'trial', from: 'development',  to: 'staging' },
    { name: 'live', from: 'staging',  to: 'production' },
    { name: 'retire', from: '*', to: 'deprecated'  },
    { name: 'goto',
      from: '*',
      to: gotoState => gotoState,
    },
  ],
});

export { FeatureFSM };
