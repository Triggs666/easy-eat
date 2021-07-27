import { verify } from "jsonwebtoken";
import { JwtPayload } from "../../auth/JwtPayload";


const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJGNnE70UgfX8DMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1tYnViOXBzaC5ldS5hdXRoMC5jb20wHhcNMjEwNzAzMTkyMjI3WhcN
MzUwMzEyMTkyMjI3WjAkMSIwIAYDVQQDExlkZXYtbWJ1Yjlwc2guZXUuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAr87lIuceW/RMkKDd
YWRwVzNJRObdVV1wyINmq225tDR1Ykn5zKJIRFZ8FYDroDNr4kdaJYWaRSEpWDLx
lWwkYkOltPDGUezuXppVpAhnJr0rdHmsOkwSkLJb9814lYxH5+GFX8OC/JlH5+Mp
Kyg2VnzVDWud+wFqn8xV4+TMkjd+B4r6H9DPIS8BuC6pq9WUqk8v/wF2YEQe4+Gn
in1t4Esq0eiv+xdX433dN4lpPWgeWjV0YOODr1oX3oP+AdcIQSGlTiT9vcOvU2tr
8vcd3cX2GrnRw+3VHG2sHMEDl1G/gdbGABBSv/IYE+4R5v5IpLeUMW4fVClbKwWV
FUO64wIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBRVgm9YWCWQ
rKPP3e6wxNzz/SdUsjAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ACj3pRBkOhDCG2Y2foSJFvVFSzHbXyvDdn/0OvCZ6JeNRqlOzlNfy94LbEBNIaiU
hgCJmraAGA0r8GkJhHY7XtbsT747hXq0/ki+vx+RVVc3BT0WXEkxCQeqRczyQZCH
vfQltqfzlMkouU3sNsMear9HFz5txlh8gtXlnYAVQeV0gLBuSHo1ySuBdYHSXd/I
ucK0scPpXGzTb68t4PQu0Op9cl7aJs357DgspB8VdzySpRT+iBtWGlxXQ1zVZFFa
qACpSJgkRe9YxYsH+N3iGuKBd6MngQfwCAPgsIRs9DDXu1IJtSjhTxz1QIgwzyp+
F5LRpIiQ7b0pEtZkexn0Ch8=
-----END CERTIFICATE-----`


export async function verifyToken(authHeader: string): Promise<JwtPayload> {
    const token = getToken(authHeader);
  
    return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  }
  
  function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header')
  
    if (!authHeader.toLowerCase().startsWith('bearer '))
      throw new Error('Invalid authentication header')
  
    const split = authHeader.split(' ')
    const token = split[1]
  
    return token
  }
  