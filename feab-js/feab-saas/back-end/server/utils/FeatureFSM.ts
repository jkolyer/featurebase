import * as StateMachine from 'javascript-state-machine';

const STATES = {
  gestation: 'gestation',
  development: 'development',
  staging: 'staging',
  production: 'production',
  deprecated: 'deprecated',
};

const DEFAULT_STATE = STATES.gestation;

const FeatureFSM = StateMachine.factory({
  transitions: [
    { name: 'init',
      from: 'none',
      to: featureState => featureState,
    },
    { name: 'conceive', from: STATES.gestation, to: STATES.development },
    { name: 'trial', from: STATES.development, to: STATES.staging },
    { name: 'retract', from: STATES.staging, to: STATES.development },
    { name: 'goLive', from: STATES.staging, to: STATES.production },
    { name: 'retire', from: '*', to: STATES.deprecated },
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
  methods: {
    performTransition: async fsm => {
      switch (fsm.state) {
        case STATES.gestation: {
          fsm.conceive();
          break;
        }
        case STATES.development: {
          fsm.trial();
          break;
        }
        case STATES.staging: {
          fsm.goLive();
          break;
        }
        case STATES.production: {
          fsm.retire();
          break;
        }
        case STATES.deprecated: {
          throw {
            name: 'FeatureTransitionFail',
            message: 'cannot transition feature out of deprecated state',
          };
          break;
        }
        default: {
          throw {
            name: 'FeatureTransitionFail',
            message: 'unknown feature state',
          };
          break;
        }
      }
    },
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

export { createFSM, DEFAULT_STATE, FeatureFSM, STATES };
