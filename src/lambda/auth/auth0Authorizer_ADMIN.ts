import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
import { verifyToken } from './auth0Utils'

const logger = createLogger('auth')

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    if (jwtToken.nickname.startsWith('admin')){
      return AllowAccess(jwtToken);
    }
    else{
      return DenyAccess();
    }
    
  } catch (e) {
    logger.error('User not authorized', { error: e.message })
    return DenyAccess();
  }
}

function AllowAccess(jwtToken):CustomAuthorizerResult{
  return {
    principalId: jwtToken.sub,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: '*'
        }
      ]
    }
  }
}

function DenyAccess():CustomAuthorizerResult{
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Deny',
          Resource: '*'
        }
      ]
    }
  }
}
