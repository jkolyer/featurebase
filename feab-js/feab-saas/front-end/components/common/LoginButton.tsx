import React from 'react';

import Button from '@material-ui/core/Button';
import { makeQueryString } from '../../lib/api/makeQueryString';
import env from '../../lib/env';

import { styleLoginButton } from '../../lib/sharedStyles';

// TS errors: https://github.com/mui-org/material-ui/issues/8198

const dev = process.env.NODE_ENV !== 'production';
const { PRODUCTION_URL_API } = env;
const port = process.env.PORT || 8000;
const devhost = process.env.NODE_IP || 'localhost';
const LOGIN_URL = dev ? `http://${devhost}:${port}` : PRODUCTION_URL_API;

class LoginButton extends React.PureComponent<{ next?: string; invitationToken?: string }> {
  public render() {
    const { next, invitationToken } = this.props;

    let url = `${LOGIN_URL}/auth/google`;
    const qs = makeQueryString({ next, invitationToken });

    if (qs) {
      url += `?${qs}`;
    }

    return (
      <Button variant="contained" style={styleLoginButton} href={url}>
        <img src="https://storage.googleapis.com/async-await-all/G.svg" alt="Log in with Google" />
        &nbsp;&nbsp;&nbsp; Log in with Google
      </Button>
    );
  }
}

export default LoginButton;
