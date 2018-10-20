import * as StateMachine from 'javascript-state-machine';

const DEFAULT_STATE = 'gestation';

const FeatureFSM = StateMachine.factory({
  init: DEFAULT_STATE,
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

export { FeatureFSM, DEFAULT_STATE };
