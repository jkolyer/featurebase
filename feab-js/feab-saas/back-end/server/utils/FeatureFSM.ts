import * as StateMachine from 'javascript-state-machine';

const DEFAULT_STATE = 'gestation';

const FeatureFSM = StateMachine.factory({
  transitions: [
    { name: 'init',
      from: 'none',
      to: featureState => featureState,
    },
    { name: 'conceive', from: 'gestation', to: 'development' },
    { name: 'trial', from: 'development', to: 'staging' },
    { name: 'retract', from: 'staging', to: 'development' },
    { name: 'live', from: 'staging', to: 'production' },
    { name: 'retire', from: '*', to: 'deprecated' },
    { name: 'goto',
      from: '*',
      to: gotoState => gotoState,
    },
  ],
  data: feature => {
    return {
      feature,
    };
  },
});

// State Machine Rules
// * cannot add child features unless in gestation/development
// * cannot delete features unless in gestation/development/deprecated
// * cannot edit features unless in gestation/development

const createFSM = feature => {
  const fsm = new FeatureFSM(feature);
  fsm.init(feature.state);
  return fsm;
};

export { createFSM, DEFAULT_STATE, FeatureFSM };
