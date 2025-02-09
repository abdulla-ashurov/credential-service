/**
 * @openapi
 *
 * components:
 *   schemas:
 *     CredentialRequest:
 *       description: Input fields for the creating a Verifiable Credential.
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         issuerDid:
 *           description: DID of the Verifiable Credential issuer. This needs to be a `did:cheqd` DID.
 *           type: string
 *         subjectDid:
 *           description: DID of the Verifiable Credential holder/subject. This needs to be a `did:key` DID.
 *           type: string
 *         attributes:
 *           description: JSON object containing the attributes to be included in the credential.
 *           type: object
 *         '@context':
 *           description: Optional properties to be included in the `@context` property of the credential.
 *           type: array
 *           items:
 *             type: string
 *         type:
 *           description: Optional properties to be included in the `type` property of the credential.
 *           type: array
 *           items:
 *             type: string
 *         expirationDate:
 *           description: Optional expiration date according to the <a href=https://www.w3.org/TR/vc-data-model/#expiration> VC Data Model specification</a>.
 *           type: string
 *         format:
 *           description: Format of the Verifiable Credential. Defaults to VC-JWT.
 *           type: string
 *           enum:
 *             - jwt
 *             - lds
 *         credentialStatus:
 *           description: Optional `credentialStatus` properties for VC revocation or suspension. Takes `statusListName` and `statusListPurpose` as inputs.
 *           type: object
 *           required:
 *             - statusPurpose
 *             - statusListName
 *           properties:
 *             statusPurpose:
 *               type: string
 *               enum:
 *                 - revocation
 *                 - suspension
 *             statusListName:
 *               type: string
 *             statusListIndex:
 *               type: number
 *             statusListVersion:
 *               type: string
 *             statusListRangeStart:
 *               type: number
 *             statusListRangeEnd:
 *               type: number
 *             indexNotIn:
 *               type: number
 *           example:
 *             statusPurpose: revocation
 *             statusListName: employee-credentials
 *       required:
 *         - issuerDid
 *         - subjectDid
 *         - attributes
 *       example:
 *         issuerDid: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *         subjectDid: did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
 *         attributes:
 *           gender: male
 *           name: Bob
 *         '@context':
 *           - https://schema.org
 *         type:
 *           - Person
 *         format: jwt
 *         credentialStatus:
 *           statusPurpose: revocation
 *           statusListName: employee-credentials
 *           statusListIndex: 10
 *     Credential:
 *       description: Input fields for revoking/suspending a Verifiable Credential.
 *       type: object
 *       additionalProperties: false
 *       properties:
 *         '@context':
 *           type: array
 *           items:
 *             type: string
 *         type:
 *           type: array
 *           items:
 *             type: string
 *         expirationDate:
 *           type: string
 *         issuer:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *         credentialSubject:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *         credentialStatus:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             statusListIndex:
 *               type: string
 *             statusPurpose:
 *               type: string
 *               enum:
 *                 - revocation
 *                 - suspension
 *             type:
 *               type: string
 *               enum:
 *                 - StatusList2021Entry
 *         issuanceDate:
 *           type: string
 *         proof:
 *           type: object
 *           properties:
 *             type:
 *               type: string
 *             jwt:
 *               type: string
 *       example:
 *         '@context':
 *           - https://www.w3.org/2018/credentials/v1
 *           - https://schema.org
 *           - https://veramo.io/contexts/profile/v1
 *         credentialSubject:
 *           gender: male
 *           id: did:key:z6MkhaXgBZDvotDkL5257faiztiGiC2QtKLGpbnnEGta2doK
 *           name: Bob
 *         credentialStatus:
 *           id: https://resolver.cheqd.net/1.0/identifiers/did:cheqd:testnet:7c2b990c-3d05-4ebf-91af-f4f4d0091d2e?resourceName=cheqd-suspension-1&resourceType=StatusList2021Suspension#20
 *           statusIndex: 20
 *           statusPurpose: suspension
 *           type: StatusList2021Entry
 *         issuanceDate: 2023-06-08T13:49:28.000Z
 *         issuer:
 *           id: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *         proof:
 *           jwt: eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJkaWQ6Y2hlcWQ6dGVzdG5ldDo3YmY4MWEyMC02MzNjLTRjYzctYmM0YS01YTQ1ODAxMDA1ZTAiLCJuYmYiOjE2ODYyMzIxNjgsInN1YiI6ImRpZDprZXk6ejZNa2hhWGdCWkR2b3REa0w1MjU3ZmFpenRpR2lDMlF0S0xHcGJubkVHdGEyZG9LIiwidmMiOnsiQGNvbnRleHQiOlsiaHR0cHM6Ly93d3cudzMub3JnLzIwMTgvY3JlZGVudGlhbHMvdjEiLCJodHRwczovL3NjaGVtYS5vcmciLCJodHRwczovL3ZlcmFtby5pby9jb250ZXh0cy9wcm9maWxlL3YxIl0sImNyZWRlbnRpYWxTdWJqZWN0Ijp7ImdlbmRlciI6Im1hbGUiLCJuYW1lIjoiQm9iIn0sInR5cGUiOlsiVmVyaWZpYWJsZUNyZWRlbnRpYWwiLCJQZXJzb24iXX19.wMfdR6RtyAZA4eoWya5Aw97wwER2Cm5Guk780Xw8H9fA3sfudIJeLRLboqixpTchqSbYeA7KbuCTAnLgXTD_Cg
 *           type: JwtProof2020
 *         type:
 *           - VerifiableCredential
 *           - Person
 *     CredentialRevokeRequest:
 *       type: object
 *       properties:
 *         credential:
 *           description: Verifiable Credential to be revoked as a VC-JWT string or a JSON object.
 *           oneOf:
 *             - type: object
 *             - type: string
 *     RevocationResult:
 *       properties:
 *         revoked:
 *           type: boolean
 *     SuspensionResult:
 *       properties:
 *         suspended:
 *           type: boolean
 *         statusList:
 *           type: string
 *     UnSuspensionResult:
 *       properties:
 *         unsuspended:
 *           type: boolean
 *         statusList:
 *           type: string
 *     CredentialVerifyRequest:
 *       type: object
 *       properties:
 *         credential:
 *           description: Verifiable Credential to be verified as a VC-JWT string or a JSON object.
 *           allOf:
 *             - type: object
 *             - type: string
 *         policies:
 *           description: Custom verification policies to execute when verifying credential.
 *           type: object
 *           properties:
 *             now:
 *               description: Policy to verify current time during the verification check (provided as Unix/epoch time).
 *               type: number
 *             issuanceDate:
 *               description: Policy to skip the `issuanceDate` (`nbf`) timestamp check when set to `false`.
 *               type: boolean
 *             expirationDate:
 *               description: Policy to skip the `expirationDate` (`exp`) timestamp check when set to `false`.
 *               type: boolean
 *             audience:
 *               description: Policy to skip the audience check when set to `false`.
 *               type: boolean
 *     IVerifyResult:
 *       type: object
 *       properties:
 *         verified:
 *           type: boolean
 *         issuer:
 *           type: string
 *         signer:
 *           type: object
 *         jwt:
 *           type: string
 *         verifiableCredential:
 *           type: object
 *       example:
 *         verified: true
 *         polices: {}
 *         issuer: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *         signer:
 *           controller: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *           id: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0#key-1
 *           publicKeyBase58: BTJiso1S4iSiReP6wGksSneGfiKHxz9SYcm2KknpqBJt
 *           type: Ed25519VerificationKey2018
 *     PresentationRequest:
 *       type: object
 *       required:
 *         - presentation
 *       properties:
 *         presentation:
 *           description: Verifiable Presentation to be verified as a VP-JWT string or a JSON object.
 *           allOf:
 *             - type: string
 *             - type: object
 *         verifiedDid:
 *           description: Provide an optional verifier DID (also known as 'domain' parameter), if the verifier DID in the presentation is not managed in the wallet.
 *           type: string
 *         policies:
 *           description: Custom verification policies to execute when verifying presentation.
 *           type: object
 *           properties:
 *             now:
 *               description: Policy to verify current time during the verification check (provided as Unix/epoch time).
 *               type: number
 *             issuanceDate:
 *               description: Policy to skip the `issuanceDate` (`nbf`) timestamp check when set to `false`.
 *               type: boolean
 *             expirationDate:
 *               description: Policy to skip the `expirationDate` (`exp`) timestamp check when set to `false`.
 *               type: boolean
 *             audience:
 *               description: Policy to skip the audience check when set to `false`.
 *               type: boolean
 *     CredentialStatusCreateRequest:
 *       allOf:
 *         - type: object
 *           required:
 *             - did
 *             - statusListName
 *           properties:
 *             did:
 *               description: DID of the StatusList2021 publisher.
 *               type: string
 *             statusListName:
 *               description: The name of the StatusList2021 DID-Linked Resource to be created.
 *               type: string
 *             length:
 *               description: The length of the status list to be created. The default and minimum length is 140000 which is 16kb.
 *             encoding:
 *               description: The encoding format of the StatusList2021 DiD-Linked Resource to be created.
 *               type: string
 *               default: base64url
 *               enum:
 *                 - base64url
 *                 - base64
 *                 - hex
 *             statusListVersion:
 *               description: Optional field to assign a human-readable version in the StatusList2021 DID-Linked Resource.
 *               type: string
 *             alsoKnownAs:
 *               description: Optional field to assign a set of alternative URIs where the StatusList2021 DID-Linked Resource can be fetched from.
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   uri:
 *                     type: string
 *                   description:
 *                     type: string
 *       example:
 *         did: did:cheqd:testnet:7c2b990c-3d05-4ebf-91af-f4f4d0091d2e
 *         statusListName: cheqd-employee-credentials
 *     CredentialStatusResult:
 *       type: object
 *       properties:
 *         success:
 *           type: object
 *           properties:
 *             created:
 *               type: boolean
 *             resourceMetadata:
 *               type: object
 *             statusList2021:
 *               type: object
 *               properties:
 *                 statusList2021:
 *                   type: object
 *                   properties:
 *                     encodedList:
 *                       type: string
 *                     type:
 *                       type: string
 *                     validFrom:
 *                       type: string
 *             metadata:
 *               type: string
 *               properties:
 *                 encoding:
 *                   type: string
 *                 encrypted:
 *                   type: boolean
 *       example:
 *         created: true
 *         resource:
 *           StatusList2021:
 *             encodedList: H4sIAAAAAAAAA-3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAADwaDhDr_xcRAAA
 *             type: StatusList2021Revocation
 *             validFrom: 2023-06-26T11:45:19.349Z
 *           metadata:
 *             encoding: base64url
 *             encrypted: false
 *         resourceMetadata:
 *           checksum: 909e22e371a41afbb96c330a97752cf7c8856088f1f937f87decbef06cbe9ca2
 *           created: 2023-06-26T11:45:20Z
 *           mediaType: application/json
 *           nextVersionId: null
 *           previousVersionId: null
 *           resourceCollectionId: 7c2b990c-3d05-4ebf-91af-f4f4d0091d2e
 *           resourceId: 5945233a-a4b5-422b-b893-eaed5cedd2dc
 *           resourceName: cheqd-revocation-1
 *           resourceType: StatusList2021Revocation
 *           resourceURI: did:cheqd:testnet:7c2b990c-3d05-4ebf-91af-f4f4d0091d2e/resources/5945233a-a4b5-422b-b893-eaed5cedd2dc
 *           resourceVersion: 2023-06-26T11:45:19.349Z
 *     CredentialStatusPublishRequest:
 *       allOf:
 *         - type: object
 *           required:
 *             - did
 *             - encodedList
 *             - statusListName
 *             - encoding
 *           properties:
 *             did:
 *               description: DID of the StatusList2021 publisher.
 *               type: string
 *             statusListName:
 *               description: The name of the StatusList2021 DID-Linked Resource to be published.
 *               type: string
 *             encodedList:
 *               description: The encoding format of the StatusList2021 DiD-Linked Resource to be published.
 *               type: string
 *               enum:
 *                 - base64url
 *                 - base64
 *                 - hex
 *             statusListVersion:
 *               description: Optional field to assign a human-readable version in the StatusList2021 DID-Linked Resource.
 *               type: string
 *             alsoKnownAs:
 *                description: Optional field to assign a set of alternative URIs where the StatusList2021 DID-Linked Resource can be fetched from.
 *                type: array
 *                items:
 *                  type: object
 *                  properties:
 *                    uri:
 *                      type: string
 *                    description:
 *                      type: string
 *       example:
 *         did: did:cheqd:testnet:7c2b990c-3d05-4ebf-91af-f4f4d0091d2e
 *         statusListName: cheqd-employee-credentials
 *         statusListVersion: '2023'
 *         data: H4sIAAAAAAAAA-3BAQ0AAADCoPdPbQ8HFAAAAAAAAAAAAAAAAAAAAADwaDhDr_xcRAAA
 *         encoding: base64url
 *     CredentialStatusUpdateRequest:
 *       type: object
 *       required:
 *         - did
 *         - statusListName
 *         - indices
 *       properties:
 *         did:
 *           description: DID of the StatusList2021 publisher.
 *           type: string
 *         statusListName:
 *           description: The name of the StatusList2021 DID-Linked Resource to be updated.
 *           type: string
 *         indices:
 *           description: List of credential status indices to be updated. The indices must be in the range of the status list.
 *           type: array
 *           items:
 *             type: number
 *         statusListVersion:
 *           description: Optional field to assign a human-readable version in the StatusList2021 DID-Linked Resource.
 *           type: string
 *     CredentialStatusCheckRequest:
 *       type: object
 *       properties:
 *         did:
 *           description: DID of the StatusList2021 publisher.
 *           type: string
 *         statusListName:
 *           description: The name of the StatusList2021 DID-Linked Resource to be checked.
 *           type: string
 *         index:
 *           description: Credential status index to be checked for revocation or suspension.
 *           type: number
 *     KeyResult:
 *       type: object
 *       properties:
 *         kid:
 *           type: string
 *         type:
 *           type: string
 *           enum: [ Ed25519, Secp256k1 ]
 *         publicKeyHex:
 *           type: string
 *     DidDocument:
 *       description: This input field contains either a complete DID document, or an incremental change (diff) to a DID document. See <a href="https://identity.foundation/did-registration/#diddocument">Universal DID Registrar specification</a>.
 *       type: object
 *       properties:
 *         '@context':
 *           type: array
 *           items:
 *             type: string
 *         id:
 *          type: string
 *         controllers:
 *           type: array
 *           items:
 *             type: string
 *         authentication:
 *           type: array
 *           items:
 *             type: string
 *         assertionMethod:
 *           type: array
 *           items:
 *             type: string
 *         capabilityInvocation:
 *           type: array
 *           items:
 *             type: string
 *         capabilityDelegation:
 *           type: array
 *           items:
 *             type: string
 *         keyAgreement:
 *           type: array
 *           items:
 *             type: string
 *         verificationMethod:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VerificationMethod'
 *         service:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Service'
 *       example:
 *         id: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *         controller:
 *           - did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *         verificationMethod:
 *           - id: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0#key-1
 *             type: Ed25519VerificationKey2018
 *             controller: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *             publicKeyBase58: BTJiso1S4iSiReP6wGksSneGfiKHxz9SYcm2KknpqBJt
 *         authentication:
 *           - did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0#key-1
 *     DidCreateRequest:
 *       type: object
 *       properties:
 *         network:
 *           type: string
 *           enum:
 *             - testnet
 *             - mainnet
 *         methodSpecificIdAlgo:
 *           type: string
 *           enum:
 *             - uuid
 *             - base58btc
 *         verificationMethodType:
 *           type: string
 *           enum:
 *             - Ed25519VerificationKey2018
 *             - JsonWebKey2020
 *             - Ed25519VerificationKey2020
 *         serviceEndpoint:
 *           type: string
 *         assertionMethod:
 *           description: An assertion method is required to issue JSON-LD credentials.
 *           type: boolean
 *           default: true
 *         didDocument:
 *           $ref: '#/components/schemas/DidDocument'
 *     DidResult:
 *       type: object
 *       properties:
 *         did:
 *           type: string
 *         controllerKeyId:
 *           type: string
 *         keys:
 *           type: array
 *           items:
 *             type: object
 *         services:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Service'
 *     VerificationMethod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         type:
 *           type: string
 *         controller:
 *           type: string
 *         publicKeyMultibase:
 *           type: string
 *         publicKeyJwk:
 *           type: array
 *           items:
 *             type: string
 *       example:
 *         controller: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0
 *         id: did:cheqd:testnet :7bf81a20-633c-4cc7-bc4a-5a45801005e0#key-1
 *         publicKeyBase58: BTJiso1S4iSiReP6wGksSneGfiKHxz9SYcm2KknpqBJt
 *         type: Ed25519VerificationKey2018
 *     Service:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: did:cheqd:testnet:7bf81a20-633c-4cc7-bc4a-5a45801005e0#rand
 *         type:
 *           type: string
 *           example: rand
 *         serviceEndpoint:
 *           type: array
 *           items:
 *             type: string
 *             example: https://rand.in
 *     DidUpdateRequest:
 *       type: object
 *       properties:
 *         did:
 *           type: string
 *         service:
 *           type: array
 *           description: Service section of the DID Document.
 *           items:
 *             $ref: '#/components/schemas/Service'
 *         verificationMethod:
 *           type: array
 *           description: Verification Method section of the DID Document.
 *           items:
 *             $ref: '#/components/schemas/VerificationMethod'
 *         authentication:
 *           description: Authentication section of the DID Document.
 *           type: array
 *           items:
 *             type: string
 *         didDocument:
 *           $ref: '#/components/schemas/DidDocument'
 *     CreateResourceRequest:
 *       description: Input fields for DID-Linked Resource creation.
 *       type: object
 *       additionalProperties: false
 *       required:
 *         - name
 *         - type
 *         - data
 *         - encoding
 *       properties:
 *         data:
 *           description: Encoded string containing the data to be stored in the DID-Linked Resource.
 *           type: string
 *         encoding:
 *           description: Encoding format used to encode the data.
 *           type: string
 *           enum:
 *             - base64url
 *             - base64
 *             - hex
 *         name:
 *           description: Name of DID-Linked Resource.
 *           type: string
 *         type:
 *           description: Type of DID-Linked Resource. This is NOT the same as the media type, which is calculated automatically ledger-side.
 *           type: string
 *         alsoKnownAs:
 *           description: Optional field to assign a set of alternative URIs where the DID-Linked Resource can be fetched from.
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               uri:
 *                 type: string
 *               description:
 *                 type: string
 *         version:
 *           description: Optional field to assign a human-readable version in the DID-Linked Resource.
 *           type: string
 *       example:
 *         data: SGVsbG8gV29ybGQ=
 *         encoding: base64url
 *         name: ResourceName
 *         type: TextDocument
 *     Customer:
 *       type: object
 *       properties:
 *         customerId:
 *           type: string
 *         address:
 *           type: string
 *     InvalidRequest:
 *       description: A problem with the input fields has occurred. Additional state information plus metadata may be available in the response body.
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: InvalidRequest
 *     InternalError:
 *       description: An internal error has occurred. Additional state information plus metadata may be available in the response body.
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Internal Error
 *     UnauthorizedError:
 *       description: Access token is missing or invalid
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Unauthorized Error
 */
