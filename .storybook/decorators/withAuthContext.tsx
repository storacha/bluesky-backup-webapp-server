import { Decorator } from '@storybook/react'
import { fn } from '@storybook/test'
import {
  AuthenticatorContext,
  AuthenticatorContextActions,
  AuthenticatorContextState,
  Client,
} from '@storacha/ui-react'

export function withAuthContext(
  state: Partial<AuthenticatorContextState>,
  actions: Partial<AuthenticatorContextActions> = {}
): Decorator {
  return function WithAuthContext(Story) {
    return (
      <AuthenticatorContext.Provider
        value={[
          {
            accounts: [],
            spaces: [],
            email: '',
            submitted: false,
            client: {} as Client,
            ...state,
          },
          {
            setEmail: fn(),
            cancelLogin: fn(),
            logout: fn(),
            ...actions,
          },
        ]}
      >
        <Story />
      </AuthenticatorContext.Provider>
    )
  }
}
